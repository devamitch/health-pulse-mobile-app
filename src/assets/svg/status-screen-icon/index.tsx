import WinddownIcon from './evening-winddown.png';
import MeditationIcon from './mindful-morning.png';
import FoodIcon from './superfood.svg';
import SupplementIcon from './supplements.svg';
import WorkoutIcon from './workout.svg';
import { StatusScreenType } from '@/utils/interfaces';
import { SvgProps } from 'react-native-svg';
import { Image, ImageStyle } from 'react-native';

export interface StatusScreenIconProps extends SvgProps {
  screen: StatusScreenType;
}

type IconConfig = {
  type: 'svg' | 'png';
  icon: React.ComponentType<SvgProps> | any;
};

const iconMap: Partial<Record<StatusScreenType, IconConfig>> = {
  FeminineScreen: { type: 'png', icon: MeditationIcon },
  GymScreen: { type: 'svg', icon: WorkoutIcon },
  MindfulScreen: { type: 'png', icon: MeditationIcon },
  SuperfoodScreen: { type: 'svg', icon: FoodIcon },
  SupplementScreen: { type: 'svg', icon: SupplementIcon },
  WindScreen: { type: 'png', icon: WinddownIcon },
};

export const StatusScreenIcon: React.FC<StatusScreenIconProps> = ({
  screen,
  width,
  height,
  ...rest
}) => {
  // Extract style-related props for PNG images
  const imageStyle: ImageStyle = {
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined,
  };

  // Props for SVG components including width and height
  const svgProps: SvgProps = { ...rest };
  if (width !== undefined) svgProps.width = width;
  if (height !== undefined) svgProps.height = height;

  const config = iconMap[screen] || { type: 'png', icon: MeditationIcon };

  return config.type === 'svg' ? (
    <config.icon {...svgProps} />
  ) : (
    <Image source={config.icon} style={imageStyle} />
  );
};

export { WinddownIcon, MeditationIcon, FoodIcon, SupplementIcon, WorkoutIcon };
