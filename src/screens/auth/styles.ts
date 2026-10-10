import { Platform, StyleSheet } from 'react-native';
import { FONT_FAMILIES } from '@/constants/typography';

// Skyp Health theme colors - Enhanced palette derived from primary #1857C1
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

export const loginStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SKYP_COLORS.background,
  },
  headerSpacer: {
    width: 24,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    position: 'relative',
    zIndex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    color: SKYP_COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  successMessage: {
    fontSize: 16,
    color: SKYP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  fixedHeaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  gradientFill: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    backgroundColor: SKYP_COLORS.primaryBg,
    shadowColor: SKYP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    color: SKYP_COLORS.text,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.nunitoBold,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: SKYP_COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.nunitoRegular,
    marginTop: 8,
    lineHeight: 24,
    maxWidth: '85%',
    alignSelf: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    color: SKYP_COLORS.text,
    marginBottom: 8,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: SKYP_COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: SKYP_COLORS.background,
    shadowColor: SKYP_COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: SKYP_COLORS.primary,
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: SKYP_COLORS.error,
    backgroundColor: SKYP_COLORS.errorBg,
  },
  socialIconButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: SKYP_COLORS.background,
    borderWidth: 1.5,
    borderColor: SKYP_COLORS.border,
    elevation: 2,
    shadowColor: SKYP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    paddingVertical: 0,
    color: SKYP_COLORS.text,
  },
  inputIcon: {
    marginRight: 12,
  },
  errorText: {
    color: SKYP_COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: FONT_FAMILIES.nunitoMedium,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 12,
  },
  forgotPasswordText: {
    color: SKYP_COLORS.primary,
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  resendText: {
    color: SKYP_COLORS.primary,
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpText: {
    color: SKYP_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FONT_FAMILIES.nunitoRegular,
    marginRight: 4,
  },
  signUpLink: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    color: SKYP_COLORS.primary,
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
    fontFamily: FONT_FAMILIES.nunitoMedium,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SKYP_COLORS.border,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: SKYP_COLORS.background,
    shadowColor: SKYP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    marginLeft: 12,
    color: SKYP_COLORS.text,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: SKYP_COLORS.secondaryBg,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: SKYP_COLORS.secondary,
  },
  privacyText: {
    fontSize: 13,
    color: SKYP_COLORS.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SKYP_COLORS.overlay,
    zIndex: 999,
  },
  loadingContainer: {
    width: 200,
    height: 100,
    borderRadius: 20,
    backgroundColor: SKYP_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: SKYP_COLORS.text,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
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
    fontFamily: FONT_FAMILIES.nunitoRegular,
    marginRight: 6,
  },
  footerActionText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    color: SKYP_COLORS.primary,
  },

  // Password Strength Indicator
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: SKYP_COLORS.border,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: FONT_FAMILIES.nunitoMedium,
  },

  // Helper Text
  helperText: {
    fontSize: 12,
    color: SKYP_COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },

  // Info Box
  infoBox: {
    backgroundColor: SKYP_COLORS.infoBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: SKYP_COLORS.info,
  },
  infoText: {
    fontSize: 13,
    color: SKYP_COLORS.text,
    lineHeight: 20,
  },

  // Warning Box
  warningBox: {
    backgroundColor: SKYP_COLORS.warningBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: SKYP_COLORS.warning,
  },
  warningText: {
    fontSize: 13,
    color: SKYP_COLORS.text,
    lineHeight: 20,
  },

  // Error Box
  errorBox: {
    backgroundColor: SKYP_COLORS.errorBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: SKYP_COLORS.error,
  },
  errorBoxText: {
    fontSize: 13,
    color: SKYP_COLORS.text,
    lineHeight: 20,
  },

  // Success Box
  successBox: {
    backgroundColor: SKYP_COLORS.secondaryBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: SKYP_COLORS.secondary,
  },
  successBoxText: {
    fontSize: 13,
    color: SKYP_COLORS.text,
    lineHeight: 20,
  },
});
