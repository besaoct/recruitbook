"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { ReqruitBookHostConfig, ReqruitBookEvent } from "./types";
import { bridge } from "./bridge";

interface ReqruitBookContextValue extends ReqruitBookHostConfig {
  emitEvent: (type: any, payload: any) => void;
}

const ReqruitBookContext = createContext<ReqruitBookContextValue>({
  isEmbedded: false,
  hostName: undefined,
  emitEvent: (type, payload) => bridge.emit(type, payload),
});

export function ReqruitBookProvider({
  config = {},
  children,
}: {
  config?: ReqruitBookHostConfig;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (config.onEvent) {
      const unsub = bridge.subscribe("*", (evt: ReqruitBookEvent) => {
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
    <ReqruitBookContext.Provider value={value}>
      {children}
    </ReqruitBookContext.Provider>
  );
}

export function useReqruitBook() {
  return useContext(ReqruitBookContext);
}
