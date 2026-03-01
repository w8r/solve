import { Dimensions } from 'react-native';
import { isWeb } from './device';

const { width, height } = Dimensions.get('window');
export const menuMargin = isWeb ? -80 : 0;

export default {
  window: {
    width,
    height
  },
  isSmallDevice: width < 375
};
