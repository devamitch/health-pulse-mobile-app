'use client';

/**
 * Custom WheelPicker Component for React Native
 * Uses react-native-reanimated and react-native-gesture-handler
 * for smooth scrolling wheel picker with haptic feedback
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface WheelPickerItem {
  label: string;
  value: string | number;
}

export interface WheelPickerProps {
  items: WheelPickerItem[];
  selectedValue?: string | number;
  onValueChange: (value: string | number, index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
  width?: number;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  selectedItemStyle?: ViewStyle;
  textStyle?: object;
  selectedTextStyle?: object;
  showGradient?: boolean;
  hapticEnabled?: boolean;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<WheelPickerItem>);

interface WheelPickerItemComponentProps {
  item: WheelPickerItem;
  index: number;
  scrollY: Animated.SharedValue<number>;
  itemHeight: number;
  visibleItems: number;
  textStyle?: object;
  selectedTextStyle?: object;
}

const WheelPickerItemComponent: React.FC<WheelPickerItemComponentProps> = ({
  item,
  index,
  scrollY,
  itemHeight,
  visibleItems,
  textStyle,
  selectedTextStyle,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * itemHeight,
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
      (index + 2) * itemHeight,
    ];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.7, 0.85, 1, 0.85, 0.7],
      'clamp'
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.3, 0.5, 1, 0.5, 0.3],
      'clamp'
    );

    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [45, 25, 0, -25, -45],
      'clamp'
    );

    return {
      transform: [
        { scale },
        { perspective: 500 },
        { rotateX: `${rotateX}deg` },
      ],
      opacity,
    };
  });

  const isSelected = useAnimatedStyle(() => {
    const currentIndex = Math.round(scrollY.value / itemHeight);
    return {
      fontWeight: currentIndex === index ? '700' : '400',
    };
  });

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        { height: itemHeight },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.itemText,
          textStyle,
          selectedTextStyle,
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </Animated.View>
  );
};

const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  itemHeight = 50,
  visibleItems = 5,
  width = SCREEN_WIDTH * 0.3,
  containerStyle,
  itemStyle,
  selectedItemStyle,
  textStyle,
  selectedTextStyle,
  showGradient = true,
  hapticEnabled = true,
}) => {
  const flatListRef = useRef<FlatList<WheelPickerItem>>(null);
  const scrollY = useSharedValue(0);
  const lastIndex = useRef<number>(-1);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate initial index
  const initialIndex = items.findIndex(item => item.value === selectedValue);
  const startIndex = initialIndex >= 0 ? initialIndex : 0;

  // Add padding items for proper scrolling
  const paddingItems = Math.floor(visibleItems / 2);
  const paddedItems: WheelPickerItem[] = [
    ...Array(paddingItems).fill({ label: '', value: '' }),
    ...items,
    ...Array(paddingItems).fill({ label: '', value: '' }),
  ];

  const containerHeight = itemHeight * visibleItems;

  useEffect(() => {
    // Scroll to initial position
    if (flatListRef.current && startIndex >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: startIndex * itemHeight,
          animated: false,
        });
      }, 100);
    }
  }, []);

  const triggerHaptic = useCallback(() => {
    if (hapticEnabled) {
      ReactNativeHapticFeedback.trigger('selection', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
  }, [hapticEnabled]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.value = offsetY;

      const currentIndex = Math.round(offsetY / itemHeight);
      if (currentIndex !== lastIndex.current && currentIndex >= 0 && currentIndex < items.length) {
        lastIndex.current = currentIndex;
        triggerHaptic();
      }
    },
    [itemHeight, items.length, triggerHaptic]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / itemHeight);
      
      if (index >= 0 && index < items.length) {
        const selectedItem = items[index];
        onValueChange(selectedItem.value, index);
        
        // Snap to exact position
        flatListRef.current?.scrollToOffset({
          offset: index * itemHeight,
          animated: true,
        });
      }
      setIsScrolling(false);
    },
    [itemHeight, items, onValueChange]
  );

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: WheelPickerItem; index: number }) => {
      // Don't render padding items
      if (index < paddingItems || index >= paddedItems.length - paddingItems) {
        return <View style={{ height: itemHeight }} />;
      }

      const actualIndex = index - paddingItems;
      
      return (
        <WheelPickerItemComponent
          item={item}
          index={actualIndex}
          scrollY={scrollY}
          itemHeight={itemHeight}
          visibleItems={visibleItems}
          textStyle={textStyle}
          selectedTextStyle={selectedTextStyle}
        />
      );
    },
    [paddingItems, paddedItems.length, itemHeight, visibleItems, textStyle, selectedTextStyle]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  return (
    <View style={[styles.container, { width, height: containerHeight }, containerStyle]}>
      {/* Selection indicator */}
      <View
        style={[
          styles.selectionIndicator,
          {
            top: (containerHeight - itemHeight) / 2,
            height: itemHeight,
          },
        ]}
      />

      <AnimatedFlatList
        ref={flatListRef}
        data={paddedItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        initialScrollIndex={startIndex}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 0,
        }}
      />

      {/* Gradient overlays */}
      {showGradient && (
        <>
          <View style={[styles.gradientTop, { height: containerHeight * 0.35 }]} pointerEvents="none" />
          <View style={[styles.gradientBottom, { height: containerHeight * 0.35 }]} pointerEvents="none" />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#0F172A',
    fontFamily: 'Nunito-SemiBold',
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});

export default WheelPicker;
