"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { communicationTemplates, candidateMessages, candidates, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";

export async function getCommunicationTemplates() {
  try {
    return await db
      .select()
      .from(communicationTemplates)
      .orderBy(desc(communicationTemplates.createdAt));
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
}

export async function createCommunicationTemplate(data: {
  name: string;
  triggerEvent: string;
  subject: string;
  bodyTemplate: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canSendCommunications", user.permissions);

  const newId = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(communicationTemplates).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    triggerEvent: data.triggerEvent,
    subject: data.subject,
    bodyTemplate: data.bodyTemplate,
    isActive: true,
    createdAt: new Date(),
  });

  revalidatePath("/communications");
  return { success: true, id: newId };
}

export async function updateCommunicationTemplate(
  id: string,
  data: Partial<{
    name: string;
    triggerEvent: string;
    subject: string;
    bodyTemplate: string;
    isActive: boolean;
  }>,
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canSendCommunications", user.permissions);

  await db
    .update(communicationTemplates)
    .set(data)
    .where(eq(communicationTemplates.id, id));

  revalidatePath("/communications");
  return { success: true };
}

export async function deleteCommunicationTemplate(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canSendCommunications", user.permissions);

  await db.delete(communicationTemplates).where(eq(communicationTemplates.id, id));

  revalidatePath("/communications");
  return { success: true };
}

export async function getCandidateMessages() {
  try {
    return await db
      .select({
        id: candidateMessages.id,
        candidateId: candidateMessages.candidateId,
        recipientEmail: candidateMessages.recipientEmail,
        subject: candidateMessages.subject,
        body: candidateMessages.body,
        status: candidateMessages.status,
        sentAt: candidateMessages.sentAt,
        candidateName: candidates.fullName,
        senderName: users.name,
      })
      .from(candidateMessages)
      .leftJoin(candidates, eq(candidateMessages.candidateId, candidates.id))
      .leftJoin(users, eq(candidateMessages.senderId, users.id))
      .orderBy(desc(candidateMessages.sentAt));
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

export async function sendMessageToCandidate(data: {
  candidateId: string;
  templateId?: string;
  recipientEmail: string;
  subject: string;
  body: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canSendCommunications", user.permissions);

  const newId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(candidateMessages).values({
    id: newId,
    candidateId: data.candidateId,
    templateId: data.templateId || null,
    senderId: user.id,
    recipientEmail: data.recipientEmail,
    subject: data.subject,
    body: data.body,
    status: "delivered",
    sentAt: new Date(),
  });

  revalidatePath("/communications");
  return { success: true, id: newId };
}
