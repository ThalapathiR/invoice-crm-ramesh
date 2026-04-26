import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { useIsFetching } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface LoadingContextType {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Extend Window interface for global access
declare global {
  interface Window {
    showGlobalLoader: () => void;
    hideGlobalLoader: () => void;
  }
}

let loadingCount = 0;

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [minLoading, setMinLoading] = useState(false);
  const isFetchingCount = useIsFetching();
  const [location] = useLocation();
  const lastLocation = useRef(location);
  const minLoadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Trigger loading on location change
  useEffect(() => {
    if (location !== lastLocation.current) {
      lastLocation.current = location;
      triggerMinLoading();
    }
  }, [location]);

  const triggerMinLoading = () => {
    setMinLoading(true);
    if (minLoadingTimeout.current) clearTimeout(minLoadingTimeout.current);
    minLoadingTimeout.current = setTimeout(() => {
      setMinLoading(false);
    }, 150); // Reduced delay for faster navigation transitions
  };

  useEffect(() => {
    window.showGlobalLoader = () => {
      loadingCount++;
      if (loadingCount > 0) {
        setIsLoadingState(true);
      }
    };

    window.hideGlobalLoader = () => {
      loadingCount = Math.max(0, loadingCount - 1);
      if (loadingCount === 0) setIsLoadingState(false);
    };

    // Also trigger on mount to cover initial load cases that might be missed
    if (loadingCount > 0) setIsLoadingState(true);

    return () => {
      delete (window as any).showGlobalLoader;
      delete (window as any).hideGlobalLoader;
      if (minLoadingTimeout.current) clearTimeout(minLoadingTimeout.current);
    };
  }, []);

  const showLoader = isLoading || minLoading;

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: setIsLoadingState }}>
      {showLoader && <LogoLoader fullScreen={true} />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
