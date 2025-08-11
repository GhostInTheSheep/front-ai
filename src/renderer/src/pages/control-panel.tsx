import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Tabs, 
  Button, 
  Textarea, 
  IconButton, 
  HStack, 
  VStack,
  Text,
  Kbd,
  Heading,
  Flex
} from '@chakra-ui/react';
import { BsMicFill, BsMicMuteFill, BsPaperclip } from 'react-icons/bs';
import { IoHandRightSharp } from 'react-icons/io5';
import { FiX, FiSettings, FiMessageCircle, FiMic, FiUsers, FiClock } from 'react-icons/fi';
import { InputGroup } from '@/components/ui/input-group';

// 导入所有需要的设置组件
import General from '@/components/sidebar/setting/general';
import Live2D from '@/components/sidebar/setting/live2d';
import ASR from '@/components/sidebar/setting/asr';
import TTS from '@/components/sidebar/setting/tts';
import Agent from '@/components/sidebar/setting/agent';
import Media from '@/components/sidebar/setting/media';
import About from '@/components/sidebar/setting/about';

// 导入聊天和历史组件
import ChatHistoryPanel from '@/components/sidebar/chat-history-panel';
import HistoryDrawer from '@/components/sidebar/history-drawer';
import GroupDrawer from '@/components/sidebar/group-drawer';

// 导入hooks
import { useFooter } from '@/hooks/footer/use-footer';
import { useAiState } from '@/context/ai-state-context';
import { useSidebar } from '@/hooks/sidebar/use-sidebar';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'chat' | 'settings' | 'controls'>('chat');
  const [activeSettingTab, setActiveSettingTab] = useState('general');
  const [saveHandlers, setSaveHandlers] = useState<(() => void)[]>([]);
  const [cancelHandlers, setCancelHandlers] = useState<(() => void)[]>([]);
  
  const { aiState } = useAiState();
  const { createNewHistory } = useSidebar();
  const {
    inputValue,
    handleInputChange,
    handleKeyPress,
    handleCompositionStart,
    handleCompositionEnd,
    handleInterrupt,
    handleMicToggle,
    micOn,
  } = useFooter();

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 设置保存/取消处理器
  const handleSaveCallback = useCallback((handler: () => void) => {
    setSaveHandlers((prev) => [...prev, handler]);
    return (): void => {
      setSaveHandlers((prev) => prev.filter((h) => h !== handler));
    };
  }, []);

  const handleCancelCallback = useCallback((handler: () => void) => {
    setCancelHandlers((prev) => [...prev, handler]);
    return (): void => {
      setCancelHandlers((prev) => prev.filter((h) => h !== handler));
    };
  }, []);

  const handleSaveAll = useCallback((): void => {
    saveHandlers.forEach((handler) => handler());
  }, [saveHandlers]);

  const handleCancelAll = useCallback((): void => {
    cancelHandlers.forEach((handler) => handler());
  }, [cancelHandlers]);

  // AI状态显示 - 修复状态类型匹配
  const getAiStateColor = () => {
    switch (aiState) {
      case 'idle': return 'gray.500';
      case 'listening': return 'blue.500';
      case 'thinking-speaking': return 'yellow.500';
      case 'interrupted': return 'red.500';
      case 'loading': return 'purple.500';
      case 'waiting': return 'orange.500';
      default: return 'gray.500';
    }
  };

  const getAiStateText = () => {
    switch (aiState) {
      case 'idle': return '待機中';
      case 'listening': return '聞き取り中';
      case 'thinking-speaking': return '考え中・話し中';
      case 'interrupted': return '中断';
      case 'loading': return '読み込み中';
      case 'waiting': return '待機中';
      default: return '不明な状態';
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(10px)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="white"
        borderRadius="xl"
        width="90vw"
        height="90vh"
        maxWidth="1200px"
        border="1px solid"
        borderColor="gray.300"
        overflow="hidden"
        position="relative"
        boxShadow="2xl"
      >
        {/* 头部 */}
        <Flex
          p="4"
          bg="gray.50"
          align="center"
          justify="space-between"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Heading size="lg" color="gray.800">
            ⚙️ コントロールパネル
          </Heading>
          
          <HStack gap={2}>
            <Text fontSize="xs" color="gray.700">
              <Kbd>Esc</Kbd> 閉じる
            </Text>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onClose}
              color="gray.700"
              _hover={{ color: 'gray.800' }}
            >
              <FiX />
            </IconButton>
          </HStack>
        </Flex>

        {/* 主要区域 */}
        <Grid templateColumns="200px 1fr" h="calc(100% - 80px)">
          {/* 左侧导航 */}
          <Box
            bg="gray.100"
            p="4"
            borderRight="1px solid"
            borderColor="gray.200"
          >
            <VStack gap={2} align="stretch">
              <Button
                variant={activeSection === 'chat' ? 'solid' : 'ghost'}
                colorPalette="blue"
                onClick={() => setActiveSection('chat')}
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <FiMessageCircle />
                  <Text>💬 チャット履歴</Text>
                </HStack>
              </Button>
              <Button
                variant={activeSection === 'settings' ? 'solid' : 'ghost'}
                colorPalette="blue"
                onClick={() => setActiveSection('settings')}
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <FiSettings />
                  <Text>⚙️ 設定</Text>
                </HStack>
              </Button>
              <Button
                variant={activeSection === 'controls' ? 'solid' : 'ghost'}
                colorPalette="blue"
                onClick={() => setActiveSection('controls')}
                justifyContent="flex-start"
              >
                <HStack gap={2}>
                  <FiMic />
                  <Text>🎙️ 制御・状態</Text>
                </HStack>
              </Button>
            </VStack>
          </Box>

          {/* 右侧内容区 */}
          <Box p="4" overflow="auto">
            {/* 聊天 & 历史区域 */}
            {activeSection === 'chat' && (
              <VStack gap={4} align="stretch" h="full">
                <HStack gap={2}>
                  <Button onClick={createNewHistory} colorPalette="green">
                    📝 新しい会話
                  </Button>
                  <HistoryDrawer>
                    <Button colorPalette="blue">
                      <HStack gap={1}>
                        <FiClock />
                        <Text>📜 履歴記録</Text>
                      </HStack>
                    </Button>
                  </HistoryDrawer>
                  <GroupDrawer>
                    <Button colorPalette="purple">
                      <HStack gap={1}>
                        <FiUsers />
                        <Text>👥 グループ管理</Text>
                      </HStack>
                    </Button>
                  </GroupDrawer>
                </HStack>
                
                <Box flex="1" border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
                  <ChatHistoryPanel />
                </Box>
              </VStack>
            )}

            {/* 设置区域 */}
            {activeSection === 'settings' && (
              <Tabs.Root
                value={activeSettingTab}
                onValueChange={(details) => setActiveSettingTab(details.value)}
                h="full"
              >
                <Tabs.List>
                  <Tabs.Trigger value="general">🔧 一般設定</Tabs.Trigger>
                  <Tabs.Trigger value="live2d">🎭 Live2D</Tabs.Trigger>
                  <Tabs.Trigger value="asr">🎤 音声認識</Tabs.Trigger>
                  <Tabs.Trigger value="tts">🔊 音声合成</Tabs.Trigger>
                  <Tabs.Trigger value="agent">🤖 エージェント</Tabs.Trigger>
                  <Tabs.Trigger value="media">🎬 メディア</Tabs.Trigger>
                  <Tabs.Trigger value="about">ℹ️ 情報</Tabs.Trigger>
                </Tabs.List>

                <Tabs.ContentGroup>
                  <Tabs.Content value="general">
                    <General
                      onSave={handleSaveCallback}
                      onCancel={handleCancelCallback}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="live2d">
                    <Live2D
                      onSave={handleSaveCallback}
                      onCancel={handleCancelCallback}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="asr">
                    <ASR 
                      onSave={handleSaveCallback} 
                      onCancel={handleCancelCallback} 
                    />
                  </Tabs.Content>
                  <Tabs.Content value="tts">
                    <TTS />
                  </Tabs.Content>
                  <Tabs.Content value="agent">
                    <Agent
                      onSave={handleSaveCallback}
                      onCancel={handleCancelCallback}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="media">
                    <Media
                      onSave={handleSaveCallback}
                      onCancel={handleCancelCallback}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="about">
                    <About />
                  </Tabs.Content>
                </Tabs.ContentGroup>

                <HStack mt="4" justify="flex-end">
                  <Button colorPalette="red" onClick={handleCancelAll}>
                    キャンセル
                  </Button>
                  <Button colorPalette="blue" onClick={handleSaveAll}>
                    保存
                  </Button>
                </HStack>
              </Tabs.Root>
            )}

            {/* 控制 & 状态区域 */}
            {activeSection === 'controls' && (
              <VStack gap={6} align="stretch">
                {/* AI状态卡片 */}
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p="4"
                >
                  <Heading size="md" mb="3" color="gray.800">🤖 AI状態</Heading>
                  <HStack gap={4}>
                    <Box
                      w="12px"
                      h="12px"
                      bg={getAiStateColor()}
                      borderRadius="full"
                    />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      {getAiStateText()}
                    </Text>
                  </HStack>
                </Box>

                {/* 语音控制卡片 */}
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p="4"
                >
                  <Heading size="md" mb="3" color="gray.800">🎙️ 音声制御</Heading>
                  <HStack gap={4}>
                    <IconButton
                      size="lg"
                      bg={micOn ? 'green.500' : 'red.500'}
                      _hover={{ bg: micOn ? 'green.600' : 'red.600' }}
                      onClick={handleMicToggle}
                      color="white"
                    >
                      {micOn ? <BsMicFill /> : <BsMicMuteFill />}
                    </IconButton>
                    <Text color="gray.700">
                      マイク：{micOn ? 'オン' : 'オフ'}
                    </Text>
                    
                    <IconButton
                      size="lg"
                      bg="yellow.500"
                      _hover={{ bg: 'yellow.600' }}
                      onClick={handleInterrupt}
                      color="white"
                    >
                      <IoHandRightSharp />
                    </IconButton>
                    <Text color="gray.700">
                      中断/トリガー
                    </Text>
                  </HStack>
                </Box>

                {/* 文本输入卡片 */}
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p="4"
                >
                  <Heading size="md" mb="3" color="gray.800">💬 テキスト入力</Heading>
                  <InputGroup>
                    <Box position="relative" width="100%">
                      <IconButton
                        position="absolute"
                        left="2"
                        top="2"
                        size="sm"
                        variant="ghost"
                        color="whiteAlpha.700"
                        _hover={{ color: 'white' }}
                        zIndex={1}
                      >
                        <BsPaperclip />
                      </IconButton>
                      <Textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        placeholder="メッセージを入力..."
                        pl="12"
                        minH="120px"
                        bg="gray.50"
                        borderColor="gray.300"
                        color="gray.800"
                        _focus={{ borderColor: 'blue.500', bg: 'white' }}
                      />
                    </Box>
                  </InputGroup>
                </Box>
              </VStack>
            )}
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

export default ControlPanel; 