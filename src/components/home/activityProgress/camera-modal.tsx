
import { FONT_FAMILIES } from '@/constants/typography';
import { CameraModalProps } from '@/types/home/activityProgress';
import React from 'react';
import {
Modal,
StyleSheet,
Text,
TouchableOpacity,
View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



export const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  theme,
  categoryColor,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View
        style={[
          styles2.cameraContainer,
          { backgroundColor: theme.Colors.backgroundColor },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles2.topBar,
            {
              paddingTop: insets.top + 12,
              paddingBottom: 12,
              backgroundColor: theme.Colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: theme.Colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles2.closeButton,
              { backgroundColor: theme.Colors.surfaceHover },
            ]}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color={theme.Colors.textColor} />
          </TouchableOpacity>
          <Text
            style={[styles2.cameraTitle, { color: theme.Colors.textColor }]}
          >
            Camera Challenge
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Coming Soon Content */}
        <View style={styles2.comingSoonContainer}>
          {/* Icon */}
          <View
            style={[
              styles2.comingSoonIconContainer,
              {
                backgroundColor: categoryColor + '20',
                borderColor: categoryColor + '30',
              },
            ]}
          >
            <Icon name="camera-outline" size={64} color={categoryColor} />
          </View>

          {/* Title */}
          <Text
            style={[styles2.comingSoonTitle, { color: theme.Colors.textColor }]}
          >
            Coming Soon
          </Text>

          {/* Description */}
          <Text
            style={[
              styles2.comingSoonDescription,
              { color: theme.Colors.textSecondary },
            ]}
          >
            Camera verification feature is currently under development. Soon
            you'll be able to capture photos to verify your progress and earn
            bonus rewards!
          </Text>

          {/* Features List */}
          <View style={styles2.featuresList}>
            {[
              { icon: 'camera-burst', text: 'Photo verification' },
              { icon: 'medal', text: 'Bonus rewards' },
              { icon: 'shield-check', text: 'Progress tracking' },
            ].map((feature, index) => (
              <View key={index} style={styles2.featureItem}>
                <View
                  style={[
                    styles2.featureIconContainer,
                    { backgroundColor: categoryColor + '15' },
                  ]}
                >
                  <Icon name={feature.icon} size={20} color={categoryColor} />
                </View>
                <Text
                  style={[
                    styles2.featureText,
                    { color: theme.Colors.textSecondary },
                  ]}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles2.closeButtonLarge,
              { backgroundColor: categoryColor },
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles2.closeButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles2 = StyleSheet.create({
  cameraContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  comingSoonIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontFamily: FONT_FAMILIES.nunitoBold,
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  closeButtonLarge: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
});