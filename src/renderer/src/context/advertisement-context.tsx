import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdvertisementState {
  showAdvertisements: boolean;
  setShowAdvertisements: (show: boolean) => void;
  currentAdvertisement: any;
  setCurrentAdvertisement: (ad: any) => void;
}

const AdvertisementContext = createContext<AdvertisementState | undefined>(undefined);

interface AdvertisementProviderProps {
  children: ReactNode;
}

export const AdvertisementProvider: React.FC<AdvertisementProviderProps> = ({ children }) => {
  const [showAdvertisements, setShowAdvertisements] = useState(true); // 默认显示广告
  const [currentAdvertisement, setCurrentAdvertisement] = useState(null);

  return (
    <AdvertisementContext.Provider value={{
      showAdvertisements,
      setShowAdvertisements,
      currentAdvertisement,
      setCurrentAdvertisement,
    }}>
      {children}
    </AdvertisementContext.Provider>
  );
};

export const useAdvertisement = (): AdvertisementState => {
  const context = useContext(AdvertisementContext);
  if (!context) {
    throw new Error('useAdvertisement must be used within an AdvertisementProvider');
  }
  return context;
};