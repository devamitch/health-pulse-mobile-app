import ModalSelector from '@/components/modals/modal-selector';
import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StatusMenu: React.FC<{
  insetTop: number;
  menuItems?: {
    title: string;
    onPress: () => void | Promise<void>;
    icon?: string;
  }[];
  menuVisible?: boolean;
  setMenuVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ menuItems, insetTop, menuVisible, setMenuVisible }) => {
  return (
    <ModalSelector
      isVisible={!!menuVisible}
      onClose={() => setMenuVisible?.(false)}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            paddingTop: insetTop + 20,
          },
        ]}
      >
        {menuVisible ? (
          <BlurView
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
            blurAmount={5}
          />
        ) : null}

        <RectButton
          onPress={() => setMenuVisible?.(false)}
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        >
          <View />
        </RectButton>

        <Animated.View
          style={[
            styles.menuPositioningContainer,
            { top: insetTop + 40, right: 40, zIndex: 999 },
          ]}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Animated.View
            style={styles.menuContainer}
            entering={FadeIn}
            exiting={FadeOut}
          >
            {menuItems?.map((item, index) => (
              <RectButton
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => {
                  setMenuVisible?.(false);
                  item?.onPress?.();
                }}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon || 'ellipsis-vertical'}
                    size={20}
                    color="#333"
                    style={styles.menuIcon}
                  />
                )}
                <Text style={styles.menuItemText}>{item.title}</Text>
              </RectButton>
            ))}
          </Animated.View>
        </Animated.View>
      </View>
    </ModalSelector>
  );
};

export default StatusMenu;

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    zIndex: 100,
  },
  backButton: {
    padding: 5,
    borderRadius: 30,
  },
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Nunito-SemiBold',
  },
  menuWrapper: {
    zIndex: 1001,
  },
  menuButton: {
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  menuPositioningContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.99)',
    borderRadius: 12,
    minWidth: 180,
    paddingVertical: 8,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
  },
  menuIcon: {
    marginRight: 12,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  subtitleText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Nunito-Regular',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  circle1: {
    position: 'absolute',
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circle2: {
    position: 'absolute',
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 15,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  image: {
    zIndex: 1,
  },
});
