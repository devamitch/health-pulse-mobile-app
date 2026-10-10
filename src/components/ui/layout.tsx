import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: ReactNode;
  headerContent?: ReactNode;
  variant?: 'scrollable' | 'non-scrollable';
  headerBackgroundColor?: string;
  backgroundColor?: string;
  headerPaddingTop?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  headerHeight?: number;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerContent,
  variant = 'scrollable',
  headerBackgroundColor = '#1857C1',
  backgroundColor = '#FFFFFF',
  headerHeight = 120,
  headerPaddingTop = 220,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}) => {
  const insets = useSafeAreaInsets();

  const renderContent = () => {
    if (variant === 'non-scrollable') {
      return (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      );
    }

    return (
      <ScrollView
        overScrollMode="never"
        scrollToOverflowEnabled={false}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View
        style={{
          height: headerHeight + insets.top,
          backgroundColor: headerBackgroundColor,
          borderBottomRightRadius: 34,
          borderBottomLeftRadius: 34,
        }}
      />

      {headerContent && (
        <View style={[styles.headerWrapper, { paddingTop: headerPaddingTop }]}>
          {headerContent}
        </View>
      )}

      <View style={{ marginTop: headerHeight - 45 }}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 180,
  },
  headerWrapper: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;
