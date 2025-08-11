import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MachineInfo {
  id: string;
  name: string;
  videoPath: string;
  available: boolean;
}

export interface LaundryContextType {
  // 洗衣店模式状态
  isLaundryMode: boolean;
  setIsLaundryMode: (enabled: boolean) => void;
  
  // 视频播放状态
  currentVideo: string | null;
  videoTitle: string;
  isVideoPlaying: boolean;
  setCurrentVideo: (videoPath: string | null, title?: string) => void;
  
  // 可用的洗衣机列表
  availableMachines: MachineInfo[];
  setAvailableMachines: (machines: MachineInfo[]) => void;
  
  // 会话状态
  isIdle: boolean;
  setIsIdle: (idle: boolean) => void;
  idleTimeout: number;
  setIdleTimeout: (timeout: number) => void;
  
  // 自动关闭功能
  autoCloseEnabled: boolean;
  setAutoCloseEnabled: (enabled: boolean) => void;
  autoCloseDelay: number;
  setAutoCloseDelay: (delay: number) => void;
}

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const useLaundry = (): LaundryContextType => {
  const context = useContext(LaundryContext);
  if (!context) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};

interface LaundryProviderProps {
  children: ReactNode;
}

export const LaundryProvider: React.FC<LaundryProviderProps> = ({ children }) => {
  // 洗衣店模式状态
  const [isLaundryMode, setIsLaundryMode] = useState(false);
  
  // 视频播放状态
  const [currentVideo, setCurrentVideoState] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // 可用的洗衣机列表
  const [availableMachines, setAvailableMachines] = useState<MachineInfo[]>([]);
  
  // 会话状态
  const [isIdle, setIsIdle] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState(60000); // 60秒
  
  // 自动关闭功能
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const [autoCloseDelay, setAutoCloseDelay] = useState(3000); // ✅ TODO: 将来可以从统一配置读取

  const setCurrentVideo = (videoPath: string | null, title: string = '使用教程') => {
    setCurrentVideoState(videoPath);
    setVideoTitle(title);
    setIsVideoPlaying(!!videoPath);
  };

  const contextValue: LaundryContextType = {
    // 洗衣店模式状态
    isLaundryMode,
    setIsLaundryMode,
    
    // 视频播放状态
    currentVideo,
    videoTitle,
    isVideoPlaying,
    setCurrentVideo,
    
    // 可用的洗衣机列表
    availableMachines,
    setAvailableMachines,
    
    // 会话状态
    isIdle,
    setIsIdle,
    idleTimeout,
    setIdleTimeout,
    
    // 自动关闭功能
    autoCloseEnabled,
    setAutoCloseEnabled,
    autoCloseDelay,
    setAutoCloseDelay,
  };

  return (
    <LaundryContext.Provider value={contextValue}>
      {children}
    </LaundryContext.Provider>
  );
};

export default LaundryProvider;