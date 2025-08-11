/**
 * 企业级Zustand状态管理架构
 * 基于最新最佳实践设计的统一状态管理系统
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { resourceManager } from '@/utils/resource-manager';
import { errorHandler } from '@/utils/error-handler';

// =========================
// 状态类型定义
// =========================

export interface AiState {
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'waiting' | 'loading';
  isIdle: boolean;
  isThinkingSpeaking: boolean;
  isInterrupted: boolean;
  isLoading: boolean;
  isListening: boolean;
  isWaiting: boolean;
}

export interface VADState {
  micOn: boolean;
  autoStopMic: boolean;
  autoStartMicOn: boolean;
  autoStartMicOnConvEnd: boolean;
  previousTriggeredProbability: number;
  settings: {
    positiveSpeechThreshold: number;
    negativeSpeechThreshold: number;
    redemptionFrames: number;
    frameSamples: number;
    minSpeechFrames: number;
    vadMode: number;
  };
}

export interface MediaState {
  // Live2D相关
  currentModel: any | null;
  
  // 背景相关
  backgroundUrl: string;
  backgroundFiles: any[];
  useCameraBackground: boolean;
  
  // 摄像头相关
  stream: MediaStream | null;
  isStreaming: boolean;
  
  // 广告相关
  showAdvertisements: boolean;
  currentAdIndex: number;
  advertisements: any[];
  isAdPlaying: boolean;
  
  // 洗衣店相关
  isLaundryMode: boolean;
  currentVideo: string | null;
  videoTitle: string;
  isVideoPlaying: boolean;
}

export interface ChatState {
  messages: any[];
  historyList: any[];
  currentHistoryUid: string | null;
  subtitleText: string;
  
  // 群聊相关
  groupMembers: any[];
  isOwner: boolean;
  selfUid: string;
}

export interface ConfigurationState {
  // 模型配置
  modelInfo: any | null;
  
  // 角色配置
  characterConfig: any | null;
  
  // 网络配置
  wsUrl: string;
  baseUrl: string;
  wsState: string;
  
  // 应用配置
  appConfig: any;
}

// =========================
// 统一状态接口
// =========================

export interface AppStore {
  // 状态分片
  ai: AiState;
  vad: VADState;
  media: MediaState;
  chat: ChatState;
  config: ConfigurationState;
  
  // AI状态管理
  setAiState: (state: AiState['status'] | ((current: AiState['status']) => AiState['status'])) => void;
  resetAiState: () => void;
  
  // VAD管理
  updateVADSettings: (settings: Partial<VADState['settings']>) => void;
  setMicState: (micOn: boolean) => void;
  
  // 媒体管理
  setCurrentModel: (model: any) => void;
  updateMediaState: (updates: Partial<MediaState>) => void;
  setBackgroundUrl: (url: string) => void;
  setAdvertisements: (ads: any[]) => void;
  
  // 聊天管理
  addMessage: (message: any) => void;
  clearMessages: () => void;
  setSubtitleText: (text: string) => void;
  updateChatState: (updates: Partial<ChatState>) => void;
  
  // 配置管理
  updateNetworkConfig: (config: { wsUrl?: string; baseUrl?: string }) => void;
  setModelInfo: (info: any) => void;
  updateAppConfig: (config: any) => void;
  
  // 工具方法
  resetAll: () => void;
  getSnapshot: () => Partial<AppStore>;
}

// =========================
// 初始状态定义
// =========================

const initialAiState: AiState = {
  status: 'idle',
  isIdle: true,
  isThinkingSpeaking: false,
  isInterrupted: false,
  isLoading: false,
  isListening: false,
  isWaiting: false,
};

const initialVADState: VADState = {
  micOn: false,
  autoStopMic: true,
  autoStartMicOn: false,
  autoStartMicOnConvEnd: false,
  previousTriggeredProbability: 0,
  settings: {
    positiveSpeechThreshold: 60,
    negativeSpeechThreshold: 45,
    redemptionFrames: 8,
    frameSamples: 1536,
    minSpeechFrames: 4,
    vadMode: 3,
  },
};

const initialMediaState: MediaState = {
  currentModel: null,
  backgroundUrl: '',
  backgroundFiles: [],
  useCameraBackground: false,
  stream: null,
  isStreaming: false,
  showAdvertisements: false,
  currentAdIndex: 0,
  advertisements: [],
  isAdPlaying: false,
  isLaundryMode: false,
  currentVideo: null,
  videoTitle: '',
  isVideoPlaying: false,
};

const initialChatState: ChatState = {
  messages: [],
  historyList: [],
  currentHistoryUid: null,
  subtitleText: '',
  groupMembers: [],
  isOwner: false,
  selfUid: '',
};

const initialConfigState: ConfigurationState = {
  modelInfo: null,
  characterConfig: null,
  wsUrl: '',
  baseUrl: '',
  wsState: 'CLOSED',
  appConfig: {},
};

// =========================
// 主要Store创建
// =========================

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // 初始状态
          ai: initialAiState,
          vad: initialVADState,
          media: initialMediaState,
          chat: initialChatState,
          config: initialConfigState,

          // =========================
          // AI状态管理Actions
          // =========================
          setAiState: (state) => {
            set((draft) => {
              const newStatus = typeof state === 'function' 
                ? state(draft.ai.status) 
                : state;
              
              draft.ai.status = newStatus;
              
              // 更新派生状态
              draft.ai.isIdle = newStatus === 'idle';
              draft.ai.isThinkingSpeaking = newStatus === 'thinking' || newStatus === 'speaking';
              draft.ai.isInterrupted = newStatus === 'interrupted';
              draft.ai.isLoading = newStatus === 'loading';
              draft.ai.isListening = newStatus === 'listening';
              draft.ai.isWaiting = newStatus === 'waiting';
            });
          },

          resetAiState: () => {
            set((draft) => {
              draft.ai = initialAiState;
            });
          },

          // =========================
          // VAD管理Actions
          // =========================
          updateVADSettings: (settings) => {
            set((draft) => {
              Object.assign(draft.vad.settings, settings);
            });
          },

          setMicState: (micOn) => {
            set((draft) => {
              draft.vad.micOn = micOn;
            });
          },

          // =========================
          // 媒体管理Actions
          // =========================
          setCurrentModel: (model) => {
            set((draft) => {
              draft.media.currentModel = model;
            });
          },

          updateMediaState: (updates) => {
            set((draft) => {
              Object.assign(draft.media, updates);
            });
          },

          setBackgroundUrl: (url) => {
            set((draft) => {
              draft.media.backgroundUrl = url;
            });
          },

          setAdvertisements: (ads) => {
            set((draft) => {
              draft.media.advertisements = ads;
              draft.media.currentAdIndex = 0;
            });
          },

          // =========================
          // 聊天管理Actions
          // =========================
          addMessage: (message) => {
            set((draft) => {
              draft.chat.messages.push(message);
            });
          },

          clearMessages: () => {
            set((draft) => {
              draft.chat.messages = [];
            });
          },

          setSubtitleText: (text) => {
            set((draft) => {
              draft.chat.subtitleText = text;
            });
          },

          updateChatState: (updates) => {
            set((draft) => {
              Object.assign(draft.chat, updates);
            });
          },

          // =========================
          // 配置管理Actions
          // =========================
          updateNetworkConfig: (config) => {
            set((draft) => {
              if (config.wsUrl) draft.config.wsUrl = config.wsUrl;
              if (config.baseUrl) draft.config.baseUrl = config.baseUrl;
            });
          },

          setModelInfo: (info) => {
            set((draft) => {
              draft.config.modelInfo = info;
            });
          },

          updateAppConfig: (config) => {
            set((draft) => {
              Object.assign(draft.config.appConfig, config);
            });
          },

          // =========================
          // 工具方法
          // =========================
          resetAll: () => {
            set((draft) => {
              draft.ai = initialAiState;
              draft.vad = initialVADState;
              draft.media = initialMediaState;
              draft.chat = initialChatState;
              draft.config = initialConfigState;
            });
          },

          getSnapshot: () => {
            const state = get();
            return {
              ai: state.ai,
              vad: state.vad,
              media: state.media,
              chat: state.chat,
              config: state.config,
            };
          },
        }))
      ),
      {
        name: 'app-store',
        partialize: (state) => ({
          // 只持久化部分状态
          vad: {
            micOn: state.vad.micOn,
            autoStopMic: state.vad.autoStopMic,
            autoStartMicOn: state.vad.autoStartMicOn,
            autoStartMicOnConvEnd: state.vad.autoStartMicOnConvEnd,
            settings: state.vad.settings,
          },
          media: {
            backgroundUrl: state.media.backgroundUrl,
            showAdvertisements: state.media.showAdvertisements,
            isLaundryMode: state.media.isLaundryMode,
          },
          config: {
            wsUrl: state.config.wsUrl,
            baseUrl: state.config.baseUrl,
            appConfig: state.config.appConfig,
          },
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// =========================
// 选择器Hooks (性能优化)
// =========================

// AI状态选择器 (重命名避免与Context版本冲突)
export const useAiStatus = () => useAppStore((state) => state.ai.status);
export const useAiStore = () => useAppStore((state) => ({
  status: state.ai.status,
  isIdle: state.ai.isIdle,
  isThinkingSpeaking: state.ai.isThinkingSpeaking,
  setAiState: state.setAiState,
}));

// VAD状态选择器 (重命名避免与Context版本冲突)
export const useVADStore = () => useAppStore((state) => ({
  micOn: state.vad.micOn,
  autoStopMic: state.vad.autoStopMic,
  settings: state.vad.settings,
  setMicState: state.setMicState,
  updateVADSettings: state.updateVADSettings,
}));

// 媒体状态选择器 (重命名避免与Context版本冲突)
export const useMediaStore = () => useAppStore((state) => ({
  currentModel: state.media.currentModel,
  backgroundUrl: state.media.backgroundUrl,
  showAdvertisements: state.media.showAdvertisements,
  advertisements: state.media.advertisements,
  setCurrentModel: state.setCurrentModel,
  updateMediaState: state.updateMediaState,
  setAdvertisements: state.setAdvertisements,
}));

// 聊天状态选择器 (重命名避免与Context版本冲突)
export const useChatStore = () => useAppStore((state) => ({
  messages: state.chat.messages,
  subtitleText: state.chat.subtitleText,
  addMessage: state.addMessage,
  setSubtitleText: state.setSubtitleText,
}));

// 配置状态选择器 (重命名避免与Context版本冲突)
export const useConfigStore = () => useAppStore((state) => ({
  wsUrl: state.config.wsUrl,
  baseUrl: state.config.baseUrl,
  wsState: state.config.wsState,
  modelInfo: state.config.modelInfo,
  updateNetworkConfig: state.updateNetworkConfig,
  setModelInfo: state.setModelInfo,
}));

// =========================
// 资源清理和错误处理集成
// =========================

// Store订阅器，用于资源管理
useAppStore.subscribe(
  (state) => state.media.stream,
  (stream, prevStream) => {
    // 清理旧的媒体流
    if (prevStream && prevStream !== stream) {
      resourceManager.registerMediaStream(prevStream, 'Previous media stream');
    }
  }
);

// 错误处理集成
useAppStore.subscribe(
  (state) => state.config.wsState,
  (wsState) => {
    if (wsState === 'CLOSED') {
      errorHandler.handleWebSocketError(
        new Error('WebSocket connection closed'),
        'Store subscription detected connection loss'
      );
    }
  }
);

console.log('🏪 Zustand企业级状态管理系统已初始化');