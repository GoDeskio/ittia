import { useState, useEffect, useCallback } from 'react';
import { UpdateService, UpdateCheckResult } from '../services/updateService';

class WebUpdateService extends UpdateService {
  public getCurrentVersion(): string {
    return process.env.REACT_APP_VERSION || '1.0.0';
  }
}

interface UseUpdateCheckerOptions {
  autoCheck?: boolean;
  checkInterval?: number;
  onUpdateAvailable?: (result: UpdateCheckResult) => void;
}

interface UseUpdateCheckerReturn {
  updateResult: UpdateCheckResult | null;
  isChecking: boolean;
  lastCheckTime: Date | null;
  checkForUpdates: () => Promise<void>;
  skipVersion: (version: string) => void;
  clearSkippedVersions: () => void;
  error: string | null;
}

export const useUpdateChecker = (options: UseUpdateCheckerOptions = {}): UseUpdateCheckerReturn => {
  const {
    autoCheck = true,
    onUpdateAvailable
  } = options;

  const [updateService] = useState(() => new WebUpdateService());
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateAvailable = useCallback((result: UpdateCheckResult) => {
    setUpdateResult(result);
    setLastCheckTime(new Date());
    
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
    }

    if (result.hasUpdate && onUpdateAvailable) {
      onUpdateAvailable(result);
    }
  }, [onUpdateAvailable]);

  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const result = await updateService.checkForUpdates();
      handleUpdateAvailable(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setUpdateResult({
        hasUpdate: false,
        currentVersion: updateService.getCurrentVersion(),
        error: errorMessage
      });
    } finally {
      setIsChecking(false);
    }
  }, [updateService, handleUpdateAvailable]);

  const skipVersion = useCallback((version: string) => {
    updateService.skipVersion(version);
  }, [updateService]);

  const clearSkippedVersions = useCallback(() => {
    updateService.clearSkippedVersions();
  }, [updateService]);

  useEffect(() => {
    // Get last check time on mount
    setLastCheckTime(updateService.getLastCheckTime());

    if (autoCheck) {
      updateService.startAutoCheck(handleUpdateAvailable);
    }

    return () => {
      updateService.stopAutoCheck();
    };
  }, [autoCheck, updateService, handleUpdateAvailable]);

  return {
    updateResult,
    isChecking,
    lastCheckTime,
    checkForUpdates,
    skipVersion,
    clearSkippedVersions,
    error
  };
};

export default useUpdateChecker;