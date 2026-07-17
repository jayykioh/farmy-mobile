import { useWindowDimensions } from 'react-native';

export const CONTENT_MAX_WIDTH = 760;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < 390;
  const isWide = width >= 768;
  const isLandscape = width > height;

  return {
    width,
    height,
    isCompact,
    isWide,
    isLandscape,
    gutter: isCompact ? 16 : isWide ? 32 : 20,
    contentMaxWidth: CONTENT_MAX_WIDTH,
  };
}
