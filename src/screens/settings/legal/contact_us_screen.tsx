import SettingsLayout from '@/components/ui/settings-layout';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';

// --- Dynamic colors based on theme ---
const getColors = (themeColors: any) => ({
  background: themeColors.backgroundColor || themeColors.white,
  surface: themeColors.white,
  primary: themeColors.primaryColor,
  text: themeColors.textColor,
  textSecondary: themeColors.textColor,
  textMuted: themeColors.greyColor600,
  border: themeColors.greyColor200,
  gradientStart: '#1c256b',
  gradientEnd: '#2c3bbb',
});

const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
};

// --- Reusable Components with theme colors ---

const InfoRow = ({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  colors: any;
}) => (
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.medium,
      backgroundColor: colors.surface,
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon
      name={icon}
      size={22}
      color={colors.primary}
      style={{ marginRight: SPACING.medium }}
    />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontFamily: FONT_FAMILIES.nunitoMedium, color: colors.text }}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{ fontSize: 14, fontFamily: FONT_FAMILIES.nunitoMedium,color: colors.textSecondary, marginTop: 2 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
    <Icon name="chevron-forward" size={20} color={colors.textMuted} />
  </TouchableOpacity>
);

const Section = ({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) => (
  <View
    style={{ marginHorizontal: SPACING.medium, marginBottom: SPACING.large }}
  >
    <Text
      style={{
        fontSize: 14,
        fontFamily: FONT_FAMILIES.nunitoBold,
        color: colors.textMuted,
        marginBottom: SPACING.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      }}
    >
      {title}
    </Text>
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  </View>
);

// --- Main Screen Component ---
const ContactUsScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const COLORS = getColors(theme.Colors);

  const handleLinkPress = (url: string, errorMsg: string) => {
    Linking.openURL(url).catch(() => console.warn(errorMsg));
  };

  const contactOptions = [
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'info@AuraCoremedical.com',
      onPress: () =>
        handleLinkPress(
          'mailto:info@AuraCoremedical.com',
          'Could not open email client.',
        ),
    },

    {
      icon: 'call-outline',
      title: 'Phone Support',
      subtitle: '+1 587-879-0772',
      onPress: () =>
        handleLinkPress('tel:+15878790772', 'Could not open phone app.'),
    },
  ];

  return (
    <SettingsLayout
      heading="Contact Us"
      subtitle="Have questions? We're here to help you get the most out of your experience."
      onBackPress={() => navigation.goBack()}
    >
      <Section title="" colors={COLORS}>
          {contactOptions.map((item, index) => (
            <React.Fragment key={item.title}>
              <InfoRow {...item} colors={COLORS} />
              {index < contactOptions.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: COLORS.border,
                    marginLeft: SPACING.medium * 2 + SPACING.small,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Section>

        <View
          style={{
            alignItems: 'center',
            marginTop: SPACING.medium,
          }}
        >
        </View>
        <Image
          source={require('@/assets/images/AuraCore-logo-bnw.png')}
          style={{ height: 60, width: 60, alignSelf: 'center', marginBottom: 20, marginTop: 10 }}
        />
    </SettingsLayout>
  );
};

export default ContactUsScreen;
