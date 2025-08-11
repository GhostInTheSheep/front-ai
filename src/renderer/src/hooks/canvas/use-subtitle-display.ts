import { useMemo } from 'react';
import { useSubtitle } from '@/context/subtitle-context';

// 过滤字幕中的标签，如 [neutral], [happy] 等
const filterSubtitleTags = (text: string): string => {
  return text.replace(/\[[\w\s]*\]/g, '').trim();
};

export const useSubtitleDisplay = () => {
  const context = useSubtitle();

  const subtitleText = useMemo(() => {
    if (!context || !context.subtitleText) return null;
    // 过滤掉方括号标签，但保留原始文本在context中
    return filterSubtitleTags(context.subtitleText);
  }, [context?.subtitleText]);

  return {
    subtitleText,
    isLoaded: !!context,
  };
};
