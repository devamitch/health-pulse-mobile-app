import { Dimensions } from 'react-native';

const { width: x, height: y } = Dimensions.get('window');

const BaseStyle = {
  DEVICE_HEIGHT: y,
  DEVICE_WIDTH: x,
  PADDING: (x / 100) * 5,
};

export default BaseStyle;