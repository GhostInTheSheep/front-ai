import { Stack } from '@chakra-ui/react';
import { settingStyles } from './setting-styles';
import { useAgentSettings } from '@/hooks/sidebar/setting/use-agent-settings';
import { SwitchField, NumberField } from './common';

interface AgentProps {
  onSave?: (callback: () => void) => () => void
  onCancel?: (callback: () => void) => () => void
}

function Agent({ onSave, onCancel }: AgentProps): JSX.Element {
  const {
    settings,
    handleAllowProactiveSpeakChange,
    handleIdleSecondsChange,
    handleAllowButtonTriggerChange,
  } = useAgentSettings({ onSave, onCancel });

  return (
    <Stack {...settingStyles.common.container}>
      <SwitchField
        label="🤖 AIが積極的に発話することを許可"
        checked={settings.allowProactiveSpeak}
        onChange={handleAllowProactiveSpeakChange}
      />

      {settings.allowProactiveSpeak && (
        <NumberField
          label="⏱️ AIが発話するまでのアイドル秒数"
          value={settings.idleSecondsToSpeak}
          onChange={(value) => handleIdleSecondsChange(Number(value))}
          min={0}
          step={0.1}
          allowMouseWheel
        />
      )}

      <SwitchField
        label="🙋 手を挙げるボタンでAIに発話を促す"
        checked={settings.allowButtonTrigger}
        onChange={handleAllowButtonTriggerChange}
      />
    </Stack>
  );
}

export default Agent;
