export const WATCH_MOVIE_PNG = require('./icons/watch-movie.png');
export const SHARE_PNG = require('./icons/share.png');
export const RIVER_PNG = require('./images/river.jpg');
export const LOTTIE_NOTE = require('./lottie-animation/Notes.json');

import { ColorValue } from 'react-native';
import { NumberProp } from 'react-native-svg';
import Goal from './svg/goal-progress.svg';

export const GoalProgressSvg = ({
  size,
  color,
}: {
  size: NumberProp;
  color: ColorValue;
}) => <Goal color={color} height={size} width={size} />;
