import { Platform, StyleSheet } from 'react-native';

export const SKYP_COLORS = {
  // Primary shades (Blue)
  primary: '#1857C1',
  primaryLight: '#4A7ED6', // Lighter shade for hover/active states
  primaryLighter: '#7BA3E3', // Even lighter for backgrounds
  primaryDark: '#0D3D8F', // Darker shade for emphasis
  primaryBg: '#E8F0FC', // Very light background tint
  primaryBgHover: '#D6E4FA', // Slightly darker background on hover

  // Secondary/Success shades (Green for wellness)
  secondary: '#4CAF50',
  secondaryLight: '#6FBF73',
  secondaryDark: '#388E3C',
  secondaryBg: '#E8F5E9',

  // Accent shades (Soft purple for calm/wellness)
  accent: '#7986CB',
  accentLight: '#9FA8DA',
  accentDark: '#5C6BC0',
  accentBg: '#E8EAF6',

  // Error/Warning shades
  error: '#FF5252',
  errorLight: '#FF8A80',
  errorDark: '#E53935',
  errorBg: '#FFEBEE',

  warning: '#FFA726',
  warningLight: '#FFB74D',
  warningDark: '#F57C00',
  warningBg: '#FFF3E0',

  // Info shades (Using primary blue tones)
  info: '#2196F3',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  infoBg: '#E3F2FD',

  // Neutral shades
  background: '#FFFFFF',
  surface: '#F5F9FF', // Light blue tint for a fresh feel
  surfaceHover: '#EBF3FE',

  // Text shades
  text: '#2D3748',
  textSecondary: '#718096',
  textTertiary: '#A0AEC0',
  textDisabled: '#CBD5E0',

  // Border shades
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  borderDark: '#CBD5E0',

  // Shadow
  shadow: 'rgba(24, 87, 193, 0.15)', // Primary color shadow

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// export const SKYP_COLORS = {
//   primary: '#1857C1',
//   secondary: '#4CAF50',
//   accent: '#7986CB',
//   error: '#FF5252',
//   background: '#FFFFFF',
//   surface: '#F5F9FF',
//   text: '#2D3748',
//   textSecondary: '#718096',
//   border: '#E2E8F0',
// };

export const loginStyles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: SKYP_COLORS.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: Platform.select({ ios: 30, android: 20 }),
  },

  // Header
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1856c144',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: SKYP_COLORS.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 16,
    color: SKYP_COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 8,
    maxWidth: '80%',
    alignSelf: 'center',
  },

  // Form
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  errorText: {
    color: SKYP_COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 20,
  },

  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  footerText: {
    color: SKYP_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginRight: 6,
  },
  footerActionText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // Shared
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 12,
  },
  forgotPasswordText: {
    color: SKYP_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  resendText: {
    color: SKYP_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SKYP_COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: SKYP_COLORS.textSecondary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    padding: 12,
    borderRadius: 10,
  },
  privacyText: {
    fontSize: 13,
    color: SKYP_COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
});
