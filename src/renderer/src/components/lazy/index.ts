/**
 * 懒加载组件集合 - 代码分割优化
 * 按功能模块进行代码分割，提高首屏加载速度
 */

import { lazy } from 'react';

// 🎬 广告组件 - 非首屏关键
export const LazyAdCarousel = lazy(() => import('../advertisement/ad-carousel').then(module => ({ 
  default: module.AdCarousel 
})));

// ⚙️ 设置相关组件 - 按需加载
export const LazySettingUI = lazy(() => import('../sidebar/setting/setting-ui'));
export const LazyMediaSettings = lazy(() => import('../sidebar/setting/media'));
export const LazyLive2DSettings = lazy(() => import('../sidebar/setting/live2d'));
export const LazyVADSettings = lazy(() => import('../sidebar/setting/vad'));
export const LazyCharacterSettings = lazy(() => import('../sidebar/setting/character'));

// 📺 Live2D组件 - 核心但可延迟
export const LazyLive2D = lazy(() => import('../canvas/live2d').then(module => ({ 
  default: module.Live2D 
})));

// 📱 面板组件 - 按需加载
export const LazyCameraPanel = lazy(() => import('../sidebar/camera-panel'));
export const LazyScreenPanel = lazy(() => import('../sidebar/screen-panel'));
export const LazyBottomTab = lazy(() => import('../sidebar/bottom-tab'));

// 📝 聊天相关 - 按模块分割
export const LazyChatHistoryPanel = lazy(() => import('../sidebar/chat-history-panel'));
export const LazyHistoryDrawer = lazy(() => import('../sidebar/history-drawer'));
export const LazyGroupDrawer = lazy(() => import('../sidebar/group-drawer'));

// 🧹 洗衣机功能 - 独立模块
export const LazyLaundryPanel = lazy(() => import('../laundry/laundry-panel'));

// Loading组件用于懒加载时的占位
export const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    height: '100%',
    width: '100%' 
  }}>
    <div style={{
      width: '24px',
      height: '24px',
      border: '2px solid #e2e8f0',
      borderTop: '2px solid #3182ce',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);