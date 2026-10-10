// hooks/useThemeStyles.ts
import { THEME } from '@/constants/theme';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { shallowEqual } from 'react-redux';

export const useThemeStyles = () => {
  const scheme = useAppSelector(state => state.theme.colorScheme, shallowEqual);

  const colors = THEME[scheme];
  const elevation = THEME.elevation;
  const isDark = scheme === 'dark';

  return {
    colors,
    elevation,
    isDark,
  };
};
