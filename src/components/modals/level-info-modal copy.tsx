import { FONT_FAMILIES } from '@/constants/typography';
import useGameProgression from '@/hooks/useGameProgression';
import { xpCalculator } from '@/utils/gamification/calculations';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Button from '../ui/buttons/button';
import BaseModal from './base-modal';

interface LevelInfoModalProps {
  visible: boolean;
  onClose: () => void;
  level: number;
}

const LevelInfoModal: React.FC<LevelInfoModalProps> = ({
  visible,
  onClose,
  level,
}) => {
  const { userLevelInfo } = useGameProgression();

  const xpToNextLevel = xpCalculator(level + 1) * 100;
  const levelInfo = userLevelInfo[level]
    ? {
        Level: userLevelInfo[level].level,
        'xp Gained':
          userLevelInfo[level].xp > userLevelInfo[level].xpToNextLevel
            ? userLevelInfo[level].xpToNextLevel
            : userLevelInfo[level].xp,
        'xp to next level': userLevelInfo[level].xpToNextLevel,
      }
    : undefined;

  const RenderInfo = !levelInfo ? (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontFamily: FONT_FAMILIES.nunitoMedium }}>
        Level {level + 1} not unlocked
      </Text>
      <Text style={{ fontSize: 18, fontFamily: FONT_FAMILIES.nunitoMedium }}>
        Gain {xpToNextLevel} xp to unlock this level.
      </Text>
    </View>
  ) : (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    >
      {Object.keys(levelInfo).map(item => (
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={{
              width: '40%',
              fontSize: 16,
              fontFamily: FONT_FAMILIES.nunitoRegular,
            }}
          >
            {item}
          </Text>
          <Text
            style={{
              width: '20%',
              textAlign: 'center',
              fontSize: 16,
              fontFamily: FONT_FAMILIES.nunitoRegular,
            }}
          >
            :
          </Text>
          <Text
            style={{
              width: '40%',
              textAlign: 'center',
              fontSize: 16,
              fontFamily: FONT_FAMILIES.nunitoRegular,
            }}
          >
            {levelInfo[item]}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <BaseModal
      isVisible={visible}
      onClose={onClose}
      title="Level Info"
      showBackButton={false}
      buttons={<Button text="Close" variant="contained" onPress={onClose} />}
    >
      <GestureHandlerRootView>{RenderInfo}</GestureHandlerRootView>
    </BaseModal>
  );
};

export default LevelInfoModal;
