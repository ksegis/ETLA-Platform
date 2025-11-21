// Hook: useImportConfirmation
// Purpose: Manage import session and log confirmations to database

import { useState, useEffect } from 'react';

interface ConfirmationData {
  sessionKey: string;
  importType: 'candidates' | 'jobs' | 'applications';
  confirmationStage: 'upload' | 'review' | 'final';
  confirmationType: 'tenant_selection' | 'tenant_verification' | 'final_approval';
  promptText: string;
  selectedTenantId?: string;
  selectedTenantName?: string;
  recordCount?: number;
  documentCount?: number;
  metadata?: Record<string, any>;
}

export function useImportConfirmation(importType: 'candidates' | 'jobs' | 'applications') {
  const [sessionKey] = useState(() => {
    // Generate or retrieve session key from sessionStorage
    const existing = sessionStorage.getItem('talent-import-session-key');
    if (existing) return existing;
    
    const newKey = `import-${importType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('talent-import-session-key', newKey);
    return newKey;
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log confirmation to database
  const logConfirmation = async (data: Omit<ConfirmationData, 'sessionKey' | 'importType'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/talent-import/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionKey,
          importType,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log confirmation');
      }

      const result = await response.json();
      setSessionId(result.sessionId);
      
      return {
        success: true,
        sessionId: result.sessionId,
        timestamp: result.timestamp,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error logging confirmation:', err);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Get confirmation status
  const getConfirmationStatus = async () => {
    try {
      const response = await fetch(`/api/talent-import/confirm?sessionKey=${sessionKey}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error getting confirmation status:', err);
      return null;
    }
  };

  // Clear session (e.g., when starting new import)
  const clearSession = () => {
    sessionStorage.removeItem('talent-import-session-key');
    setSessionId(null);
    setError(null);
  };

  return {
    sessionKey,
    sessionId,
    isLoading,
    error,
    logConfirmation,
    getConfirmationStatus,
    clearSession,
  };
}
