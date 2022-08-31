import {
  NativeModules,
  Platform,
  Dimensions,
} from 'react-native';
import * as Device from 'expo-device';

const statusBarHeight = Platform.OS === 'ios' ? 20 : (NativeModules.StatusBarManager ? NativeModules.StatusBarManager.HEIGHT : 0);
let { width: windowWidth, height: windowHeight } = Dimensions.get('window');
let { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
// console.log(windowWidth, windowHeight, screenWidth, screenHeight);

// because the app is always in portrait mode, fix if the phone was somehow in landscape mode
if (windowWidth > windowHeight) {
  windowWidth = Dimensions.get('window').height;
  windowHeight = Dimensions.get('window').width;
  screenWidth = Dimensions.get('screen').height;
  screenHeight = Dimensions.get('screen').width;
}
// screenHeight = screenWidth * 1.7;

const softkeysHeight = screenHeight - windowHeight - statusBarHeight;

const hasPlaceHolderWhenStatusBarHidden = parseInt(statusBarHeight) > 24;

let actualHeight = screenHeight;
if (hasPlaceHolderWhenStatusBarHidden) {
  actualHeight = screenHeight - statusBarHeight;
}

export default {
  WINDOW_WIDTH: windowWidth,
  WINDOW_HEIGHT: windowHeight,
  SCREEN_WIDTH: screenWidth,
  SCREEN_HEIGHT: screenHeight,
  ACTUAL_HEIGHT: actualHeight,
  SOFTKEYS_HEIGHT: softkeysHeight,
  STATUSBAR_HEIGHT: statusBarHeight,
};
