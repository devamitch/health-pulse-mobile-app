import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface HomeLayoutProps {
  children: ReactNode;
  headerComponent: () => ReactNode;
  backgroundColor?: string;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
  headerComponent: HeaderComponent,
  backgroundColor = '#F5F5F5',
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* <StatusBar backgroundColor="#1857C1" barStyle="light-content" /> */}
      <HeaderComponent />
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Header stays on top but below expanded tray (zIndex 100+)
  },
  scrollContent: {
    paddingTop: 140, // Increased space for header + task tray cards
    paddingBottom: 100,
  },
});

export default HomeLayout;
