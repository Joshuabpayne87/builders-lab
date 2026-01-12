'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { FunnelStage } from './types';

interface FunnelContextType {
  stage: FunnelStage;
  setStage: (stage: FunnelStage) => void;
  strategyDoc: string;
  setStrategyDoc: (doc: string) => void;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;
}

const FunnelContext = createContext<FunnelContextType | undefined>(undefined);

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<FunnelStage>('IDEA');
  const [strategyDoc, setStrategyDoc] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <FunnelContext.Provider
      value={{
        stage,
        setStage,
        strategyDoc,
        setStrategyDoc,
        generatedCode,
        setGeneratedCode,
        isGenerating,
        setIsGenerating
      }}
    >
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  const context = useContext(FunnelContext);
  if (context === undefined) {
    throw new Error('useFunnel must be used within a FunnelProvider');
  }
  return context;
}
