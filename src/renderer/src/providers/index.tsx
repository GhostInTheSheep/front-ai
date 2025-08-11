/**
 * 扁平化Provider架构
 * 将原来的9层嵌套减少到3层，提升性能和可维护性
 */

import React, { ReactNode } from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { errorHandler } from '@/utils/error-handler';

// =========================
// 核心Provider层 - 基础设施
// =========================

interface CoreProvidersProps {
  children: ReactNode;
}

export const CoreProviders: React.FC<CoreProvidersProps> = ({ children }) => {
  // 全局错误处理
  const handleGlobalError = (error: Error, errorInfo: any) => {
    console.error('🚨 全局React错误:', error, errorInfo);
    errorHandler.handleError({
      type: 'unknown' as any,
      message: error.message,
      originalError: error,
      context: 'React Component Tree',
      timestamp: Date.now(),
      recoverable: false,
    });
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <ChakraProvider value={defaultSystem}>
        <Toaster />
        {children}
      </ChakraProvider>
    </ErrorBoundary>
  );
};

// =========================
// 服务Provider层 - 核心服务
// =========================

// WebSocketHandler 已移至 LegacyProviders 中以确保依赖顺序正确

interface ServiceProvidersProps {
  children: ReactNode;
}

export const ServiceProviders: React.FC<ServiceProvidersProps> = ({ children }) => {
  // 现在只是一个传递层，未来可以在这里添加其他不依赖Context的服务
  return <>{children}</>;
};

// =========================
// 功能Provider层 - 业务功能
// =========================

// 将剩余的Context合并到几个关键的Provider中
import { LaundryProvider } from '@/context/laundry-context';
import { AdvertisementProvider } from '@/context/advertisement-context';

interface FeatureProvidersProps {
  children: ReactNode;
}

export const FeatureProviders: React.FC<FeatureProvidersProps> = ({ children }) => {
  return (
    <LaundryProvider>
      <AdvertisementProvider>
        {children}
      </AdvertisementProvider>
    </LaundryProvider>
  );
};

// =========================
// 统一Provider组合器
// =========================

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <CoreProviders>
      <ServiceProviders>
        <FeatureProviders>
          {children}
        </FeatureProviders>
      </ServiceProviders>
    </CoreProviders>
  );
};

// =========================
// Provider迁移助手
// =========================

/**
 * 临时迁移Provider - 用于渐进式迁移
 * 保留部分原有Context以确保向后兼容
 */

import { AiStateProvider } from '@/context/ai-state-context';
import { Live2DConfigProvider } from '@/context/live2d-config-context';
import { SubtitleProvider } from '@/context/subtitle-context';
import { BgUrlProvider } from '@/context/bgurl-context';
import { CameraProvider } from '@/context/camera-context';
import { ChatHistoryProvider } from '@/context/chat-history-context';
import { CharacterConfigProvider } from '@/context/character-config-context';
import { VADProvider } from '@/context/vad-context';
import { Live2DModelProvider } from '@/context/live2d-model-context';
import { ProactiveSpeakProvider } from '@/context/proactive-speak-context';
import { ScreenCaptureProvider } from '@/context/screen-capture-context';
import { GroupProvider } from '@/context/group-context';
import WebSocketHandler from '@/services/websocket-handler';

interface LegacyProvidersProps {
  children: ReactNode;
}

export const LegacyProviders: React.FC<LegacyProvidersProps> = ({ children }) => {
  console.warn('⚠️ 使用LegacyProviders，请尽快迁移到Zustand状态管理');
  
  return (
    <Live2DModelProvider>
      <CameraProvider>
        <ScreenCaptureProvider>
          <CharacterConfigProvider>
            <ChatHistoryProvider>
              <AiStateProvider>
                <ProactiveSpeakProvider>
                  <Live2DConfigProvider>
                    <SubtitleProvider>
                      <VADProvider>
                        <BgUrlProvider>
                          <GroupProvider>
                            {/* WebSocketHandler 必须在所有Context Provider之后 */}
                            <WebSocketHandler>
                              {children}
                            </WebSocketHandler>
                          </GroupProvider>
                        </BgUrlProvider>
                      </VADProvider>
                    </SubtitleProvider>
                  </Live2DConfigProvider>
                </ProactiveSpeakProvider>
              </AiStateProvider>
            </ChatHistoryProvider>
          </CharacterConfigProvider>
        </ScreenCaptureProvider>
      </CameraProvider>
    </Live2DModelProvider>
  );
};

// =========================
// 迁移策略Provider
// =========================

interface MigrationProvidersProps {
  children: ReactNode;
  useLegacy?: boolean; // 用于渐进式迁移
}

export const MigrationProviders: React.FC<MigrationProvidersProps> = ({ 
  children, 
  useLegacy = false 
}) => {
  if (useLegacy) {
    return (
      <CoreProviders>
        <FeatureProviders>
          <LegacyProviders>
            {children}
          </LegacyProviders>
        </FeatureProviders>
      </CoreProviders>
    );
  }

  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
};

// =========================
// Provider性能监控
// =========================

/**
 * 性能监控Provider包装器
 */
export const withPerformanceMonitoring = <P extends {}>(
  WrappedProvider: React.ComponentType<P>,
  name: string
) => {
  return React.memo((props: P) => {
    React.useEffect(() => {
      console.log(`📊 Provider性能监控: ${name} 已挂载`);
      
      return () => {
        console.log(`📊 Provider性能监控: ${name} 已卸载`);
      };
    }, []);

    return <WrappedProvider {...props} />;
  });
};

// 使用示例：
// export const MonitoredCoreProviders = withPerformanceMonitoring(CoreProviders, 'CoreProviders');

// =========================
// 开发工具Provider
// =========================

interface DevProvidersProps {
  children: ReactNode;
  enableDevTools?: boolean;
}

export const DevProviders: React.FC<DevProvidersProps> = ({ 
  children, 
  enableDevTools = process.env.NODE_ENV === 'development' 
}) => {
  if (!enableDevTools) {
    return <>{children}</>;
  }

  return (
    <div data-dev-providers="true">
      {/* 开发环境专用的Provider */}
      {children}
      
      {/* 开发工具面板 */}
      {enableDevTools && (
        <div 
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
          }}
        >
          🔧 开发模式
        </div>
      )}
    </div>
  );
};

export default AppProviders;