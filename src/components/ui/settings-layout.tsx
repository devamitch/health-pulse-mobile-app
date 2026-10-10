// @/components/ui/simple-header-layout.tsx
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/themeHook';
import BackButton from './buttons/back-button';
import { FONT_FAMILIES } from '@/constants/typography';

interface SettingsLayoutProps {
  heading: string;
  subtitle?: string;
  onBackPress: () => void;
  children: ReactNode;
  showScrollIndicator?: boolean;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  heading,
  subtitle,
  onBackPress,
  children,
  showScrollIndicator = false,
}) => {
  const insets = useSafeAreaInsets();
  const { Colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundColor }]}>
      <View style={{ height: subtitle ? 150 + insets.top : 120 + insets.top }}>
        <View
          style={[
            styles.blueBackground,
            { height: 120 + insets.top, paddingTop: insets.top + 16 },
          ]}
        >
          <View style={styles.headerContent}>
            <BackButton onPress={onBackPress} iconColor="white" />
            <Text style={styles.headingText}>{heading}</Text>
            <View style={{ width: 42 }} />
          </View>
        </View>

        {subtitle && (
          <View style={styles.subtitleCardContainer}>
            <View style={[styles.subtitleCard, { backgroundColor: Colors.white }]}>
              <Text style={[styles.subtitleText, { color: Colors.textColor }]}>{subtitle}</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={showScrollIndicator}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blueBackground: {
    backgroundColor: '#1857C1',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headingText: {
    color: 'white',
    fontFamily: FONT_FAMILIES.nunitoBold,
      fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  subtitleCardContainer: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  subtitleCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily:FONT_FAMILIES.nunitoRegular,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
});

export default SettingsLayout;
