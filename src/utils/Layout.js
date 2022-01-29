import {
  NativeModules,
  Platform,
  Dimensions,
} from 'react-native';


const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const statusBarHeight = Platform.OS === 'ios' ? 20 : (NativeModules.StatusBarManager ? NativeModules.StatusBarManager.HEIGHT : 0);
const softkeysHeight = screenHeight - windowHeight - statusBarHeight;

export default {
  WINDOW_WIDTH: windowWidth,
  WINDOW_HEIGHT: windowHeight,
  SCREEN_WIDTH: screenWidth,
  SCREEN_HEIGHT: screenHeight,
  ACTUAL_HEIGHT: parseInt(softkeysHeight) == 0 ? windowHeight : screenHeight,
  SOFTKEYS_HEIGHT: softkeysHeight,
  STATUSBAR_HEIGHT: statusBarHeight,
};
