// import { StrictMode } from 'react';
import { Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Canvas from './components/canvas/canvas';

import { Live2D } from './components/canvas/live2d';
import TitleBar from './components/electron/title-bar';
import { InputSubtitle } from './components/electron/input-subtitle';
import ControlPanel from './pages/control-panel';
import { useGlobalShortcuts } from './hooks/utils/use-keyboard-shortcuts';
import { useLaundry } from './context/laundry-context';
import VideoPlayer from './components/laundry/video-player';
import { useAdvertisement } from './context/advertisement-context';
import { AdCarousel } from './components/advertisement/ad-carousel';
import { MigrationProviders } from './providers';
import { useAdvertisementAudioConfig } from './hooks/sidebar/setting/use-advertisement-audio-settings';
// eslint-disable-next-line import/no-extraneous-dependencies, import/newline-after-import
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

function AppContent(): JSX.Element {
  const [mode, setMode] = useState('window');
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isElectron = window.api !== undefined;
  const { currentVideo, videoTitle, setCurrentVideo } = useLaundry();
  const { showAdvertisements } = useAdvertisement();
  const { isAudioEnabled, isVADEnabled } = useAdvertisementAudioConfig();

  // 控制面板相关函数
  const openControlPanel = () => setIsControlPanelOpen(true);
  const closeControlPanel = () => setIsControlPanelOpen(false);

  // 注册全局快捷键（包括F11全屏）
  useGlobalShortcuts(openControlPanel, closeControlPanel, isControlPanelOpen);

  // 监听全屏状态变化
  useEffect(() => {
    if (isElectron && window.api?.onFullscreenChange) {
      const cleanup = window.api.onFullscreenChange((fullscreen: boolean) => {
        setIsFullscreen(fullscreen);
      });
      return cleanup;
    }
  }, [isElectron]);

  useEffect(() => {
    if (isElectron) {
      window.electron.ipcRenderer.on('pre-mode-changed', (_event, newMode) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.electron.ipcRenderer.send('renderer-ready-for-mode-change', newMode);
          });
        });
      });
    }
  }, [isElectron]);

  useEffect(() => {
    if (isElectron) {
      window.electron.ipcRenderer.on('mode-changed', (_event, newMode) => {
        setMode(newMode);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.electron.ipcRenderer.send('mode-change-rendered');
          });
        });
      });
    }
  }, [isElectron]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算主容器高度 - 全屏时使用100vh，否则考虑标题栏
  const getMainContainerHeight = () => {
    if (isFullscreen) {
      return '100vh'; // 全屏模式使用整个视口高度
    }
    return isElectron ? 'calc(100vh - 30px)' : '100vh';
  };

  return (
    <>
      {mode === 'window' ? (
        <>
          {/* 只在非全屏时显示标题栏 */}
          {isElectron && !isFullscreen && <TitleBar />}
          <Box
            width="100vw"
            height={getMainContainerHeight()}
            bg="gray.900"
            color="white"
            overflow="hidden"
            position="relative"
          >
            <Canvas />
            
            {/* 控制面板 */}
            <ControlPanel 
              isOpen={isControlPanelOpen}
              onClose={closeControlPanel}
            />
          </Box>
        </>
      ) : (
        <>
          <Live2D isPet={mode === 'pet'} />
          {mode === 'pet' && (
            <InputSubtitle isPet={mode === 'pet'} />
          )}
        </>
      )}
      
      {/* 洗衣店视频播放器 */}
      {currentVideo && (
        <VideoPlayer
          src={currentVideo}
          title={videoTitle}
          autoPlay={true}
          autoClose={true}
          onClose={() => setCurrentVideo(null)}
          onEnded={() => {
            console.log('视频播放完成');
          }}
        />
      )}
      
      {/* 🎬 广告轮播系统 */}
      <AdCarousel 
        isVisible={showAdvertisements}
        enableAudioWithVAD={isVADEnabled}
        defaultAudioEnabled={isAudioEnabled}
        onRequestAdvertisements={() => {
          console.log('请求更多广告数据...');
        }}
      />
    </>
  );
}

function App(): JSX.Element {
  return (
    <MigrationProviders useLegacy={true}>
      <AppContent />
    </MigrationProviders>
  );
}

export default App;
