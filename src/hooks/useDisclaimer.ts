import { RootState } from '@/services/mmkv-redux';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  acceptDisclaimer,
  disclaimerShown,
  shouldShowDisclaimer,
} from '@/services/mmkv-redux/slices';

export const useDisclaimer = () => {
  const dispatch = useAppDispatch();
  const disclaimerSettings = useAppSelector(
    (state: RootState) => state.user.disclaimerSettings,
  );

  const showDisclaimer = (context: 'startup' | 'medical_query' | 'manual') => {
    dispatch(disclaimerShown({ context, timestamp: new Date().toISOString() }));
  };

  const acceptDisclaimer2 = (params: {
    context: 'startup' | 'medical_query' | 'manual';
    readTime: number;
    viewMode: 'mini' | 'full';
    settings: { dontShowAgain: boolean; showMiniReminders: boolean };
  }) => {
    dispatch(acceptDisclaimer(params));
  };

  const shouldShow = (context: string) => {
    return shouldShowDisclaimer(disclaimerSettings, context);
  };

  return {
    disclaimerSettings,
    showDisclaimer,
    acceptDisclaimer: acceptDisclaimer2,
    shouldShow,
  };
};
