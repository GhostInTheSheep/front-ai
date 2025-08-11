/* eslint-disable react-hooks/rules-of-hooks */
import { Stack, Text, Button, HStack, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { settingStyles } from './setting-styles';
import { useLive2dSettings } from '@/hooks/sidebar/setting/use-live2d-settings';
import { SwitchField, InputField } from './common';

interface live2DProps {
  onSave?: (callback: () => void) => () => void
  onCancel?: (callback: () => void) => () => void
}

function live2D({ onSave, onCancel }: live2DProps): JSX.Element {
  const {
    modelInfo,
    handleInputChange,
    handleSave,
    handleCancel,
  } = useLive2dSettings();

  const [newEmotionName, setNewEmotionName] = useState('');
  const [newEmotionValue, setNewEmotionValue] = useState('');

  useEffect(() => {
    if (!onSave || !onCancel) return;

    const cleanupSave = onSave(handleSave);
    const cleanupCancel = onCancel(handleCancel);

    return (): void => {
      cleanupSave?.();
      cleanupCancel?.();
    };
  }, [onSave, onCancel]);

  // 添加表情映射
  const handleAddEmotion = () => {
    if (!newEmotionName.trim() || !newEmotionValue.trim()) return;
    
    const numericValue = parseInt(newEmotionValue);
    if (isNaN(numericValue)) return;

    const updatedEmotionMap = {
      ...modelInfo.emotionMap,
      [newEmotionName.trim()]: numericValue
    };

    handleInputChange('emotionMap', updatedEmotionMap);
    setNewEmotionName('');
    setNewEmotionValue('');
  };

  // 删除表情映射
  const handleDeleteEmotion = (emotionName: string) => {
    const updatedEmotionMap = { ...modelInfo.emotionMap };
    delete updatedEmotionMap[emotionName];
    handleInputChange('emotionMap', updatedEmotionMap);
  };

  // 快速设置吸血鬼公主表情映射
  const handleSetVampirePrincessEmotions = () => {
    const vampireEmotionMap = {
      "neutral": 0,
      "anger": 1,
      "disgust": 1,
      "fear": 1,
      "joy": 2,
      "smirk": 5,
      "sadness": 4,
      "surprise": 3
    };
    handleInputChange('emotionMap', vampireEmotionMap);
  };

  return (
    <Stack {...settingStyles.live2d.container}>
      <SwitchField
        label="📱 ポインターインタラクティブ"
        checked={modelInfo.pointerInteractive ?? false}
        onChange={(checked) => handleInputChange('pointerInteractive', checked)}
      />

      <SwitchField
        label="🔍 スクロールでサイズ変更を有効化"
        checked={modelInfo.scrollToResize ?? true}
        onChange={(checked) => handleInputChange('scrollToResize', checked)}
      />

      {/* 表情映射配置 */}
      <VStack align="stretch" gap={4} mt={6}>
        <Text {...settingStyles.live2d.emotionMap.title}>
          🎭 表情マッピング設定
        </Text>
        
        {/* 快速设置按钮 */}
        <Button 
          onClick={handleSetVampirePrincessEmotions}
          size="sm"
          variant="solid"
          colorScheme="blue"
        >
          🧛‍♀️ バンパイアプリンセスの表情設定
        </Button>

        {/* 现有表情映射列表 */}
        {Object.entries(modelInfo.emotionMap || {}).map(([name, value]) => (
          <HStack key={name} {...settingStyles.live2d.emotionMap.entry}>
            <Text flex={1} fontSize="sm">{name}</Text>
            <Text fontSize="sm" color="gray.600">→</Text>
            <Text fontSize="sm" fontWeight="bold">{value}</Text>
            <Button
              size="xs"
              variant="outline"
              colorScheme="red"
              onClick={() => handleDeleteEmotion(name)}
            >
              删除
            </Button>
          </HStack>
        ))}

        {/* 添加新表情映射 */}
        <VStack gap={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium">新しい表情マッピングを追加:</Text>
          <HStack>
            <InputField
              label=""
              placeholder="表情名 (例: joy)"
              value={newEmotionName}
              onChange={setNewEmotionName}
            />
            <InputField
              label=""
              placeholder="表情番号 (例: 2)"
              value={newEmotionValue}
              onChange={setNewEmotionValue}
            />
            <Button
              onClick={handleAddEmotion}
              size="sm"
              variant="solid"
              colorScheme="green"
              disabled={!newEmotionName.trim() || !newEmotionValue.trim()}
            >
              追加
            </Button>
          </HStack>
        </VStack>

        {/* 使用说明 */}
        <Text fontSize="xs" color="gray.700">
          💡 ヒント: 表情名はバックエンドから送信される表情文字列と一致させ、表情番号はLive2Dモデルの表情インデックスに対応します
        </Text>
      </VStack>
    </Stack>
  );
}

export default live2D;
