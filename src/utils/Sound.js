import { Audio } from 'expo-av';
import Data from './Data';


const namespace = 'Sound';

const fields = {
  soundOn: true,
  backgroundMusicOn: true,
};

Data.init(namespace, fields);

let backgroundMusicObject = null;
const sounds = {};

export const init = async () => {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: false,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};

export const isSoundOn = () => {
  return Data.getField(namespace, 'soundOn');
};

export const setSoundOn = (soundOn) => {
  Data.setFields(namespace, { soundOn });
};

export const playSound = async (name) => {
  if (isSoundOn()) {
    play(name);
  }
};

export const isBackgroundMusicOn = () => {
  return Data.getField(namespace, 'backgroundMusicOn');
};

export const setBackgroundMusicOn = async (backgroundMusicOn) => {
  Data.setFields(namespace, { backgroundMusicOn });
  try {
    if (backgroundMusicObject) {
      if (backgroundMusicOn) {
        await backgroundMusicObject.setPositionAsync(0);
        await backgroundMusicObject.playAsync();
      } else {
        await backgroundMusicObject.stopAsync();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const playBackgroundMusic = async (name) => {
  if (backgroundMusicObject) {
    if (isBackgroundMusicOn()) {
      await backgroundMusicObject.playAsync();
    }
    return;
    // await stopBackgroundMusic();
  }
  backgroundMusicObject = await play(name, true, isBackgroundMusicOn());
};

export const stopBackgroundMusic = async () => {
  try {
    if (backgroundMusicObject) {
      await backgroundMusicObject.stopAsync();
      await backgroundMusicObject.unloadAsync()
      backgroundMusicObject = null;
    }
  } catch (error) {
    console.log(error);
  }
};

export const load = async (name, resource) => {
  if (name != 'theme') {
    const soundObject = new Audio.Sound();
    soundObject.loadAsync(resource);
  }
  sounds[name] = resource;
};

export const unload = (name) => {
  if (sounds[name] !== undefined) {
    delete sounds[name];
  }
};

export const play = async (name, loop = false, surePlay = true) => {
  if (sounds[name] !== undefined) {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(sounds[name]);
      if (loop) {
        soundObject.setIsLoopingAsync(true);
      } else {
        soundObject.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish === true) {
            await soundObject.unloadAsync()
          }
        });
      }
      if (surePlay) {
        await soundObject.playAsync();
      }
    } catch (error) {
      console.log(error);
      return null;
    }
    return soundObject;
  }
  return null;
};
