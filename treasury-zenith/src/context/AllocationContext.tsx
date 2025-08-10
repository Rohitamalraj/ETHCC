import React, { createContext, useContext, useState } from "react";

type AllocationContextType = {
  targetEthPercent: number;
  targetUsdcPercent: number;
  setTargetEthPercent: (val: number) => void;
  setTargetUsdcPercent: (val: number) => void;
};

const AllocationContext = createContext<AllocationContextType | undefined>(undefined);

export const AllocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targetEthPercent, setTargetEthPercent] = useState<number>(50);
  const [targetUsdcPercent, setTargetUsdcPercent] = useState<number>(50);

  return (
    <AllocationContext.Provider
      value={{ targetEthPercent, targetUsdcPercent, setTargetEthPercent, setTargetUsdcPercent }}
    >
      {children}
    </AllocationContext.Provider>
  );
};

export const useAllocation = () => {
  const context = useContext(AllocationContext);
  if (!context) throw new Error("useAllocation must be used within AllocationProvider");
  return context;
};