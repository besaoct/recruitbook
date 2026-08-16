"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { RecruitBookHostConfig, RecruitBookEvent } from "./types";
import { bridge } from "./bridge";

interface RecruitBookContextValue extends RecruitBookHostConfig {
  emitEvent: (type: any, payload: any) => void;
}

const RecruitBookContext = createContext<RecruitBookContextValue>({
  isEmbedded: false,
  hostName: undefined,
  emitEvent: (type, payload) => bridge.emit(type, payload),
});

export function RecruitBookProvider({
  config = {},
  children,
}: {
  config?: RecruitBookHostConfig;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (config.onEvent) {
      const unsub = bridge.subscribe("*", (evt: RecruitBookEvent) => {
        config.onEvent?.(evt);
      });
      return unsub;
    }
  }, [config.onEvent]);

  useEffect(() => {
    if (config.onCandidateHired) {
      const unsub = bridge.subscribe("candidate:hired", (evt) => {
        config.onCandidateHired?.(evt.payload);
      });
      return unsub;
    }
  }, [config.onCandidateHired]);

  const value = useMemo(
    () => ({
      isEmbedded: config.isEmbedded ?? false,
      hostName: config.hostName,
      activeDepartmentId: config.activeDepartmentId,
      theme: config.theme,
      onNavigate: config.onNavigate,
      permissions: config.permissions,
      hiddenModules: config.hiddenModules,
      readOnly: config.readOnly ?? false,
      emitEvent: (type: any, payload: any) => bridge.emit(type, payload),
    }),
    [config],
  );

  return (
    <RecruitBookContext.Provider value={value}>
      {children}
    </RecruitBookContext.Provider>
  );
}

export function useRecruitBook() {
  return useContext(RecruitBookContext);
}
