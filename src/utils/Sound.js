import { Audio } from 'expo-av';

let soundOn = true;
let backgroundMusicOn = true;
let backgroundMusicObject = null;

const sounds = {};

const isSoundOn = () => {
  return soundOn;
};

const setSoundOn = (on) => {
  soundOn = on;
};

const playSound = async (name) => {
  if (soundOn) {
    play(name);
  }
};

const setBackgroundMusicOn = async (on) => {
  backgroundMusicOn = on;
  try {
    if (backgroundMusicObject) {
      if (on) {
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

const playBackgroundMusic = async (name) => {
  if (backgroundMusicObject) {
    await stopBackgroundMusic();
  }
  backgroundMusicObject = await play(name, true, backgroundMusicOn);
};

const stopBackgroundMusic = async () => {
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

const load = async (name, resource) => {
  sounds[name] = resource;
};

const unload = (name) => {
  if (sounds[name] !== undefined) {
    delete sounds[name];
  }
};

const play = async (name, loop = false, surePlay = true) => {
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

export default {
  load,
  unload,
  play,
  isSoundOn,
  setSoundOn,
  playSound,
  setBackgroundMusicOn,
  playBackgroundMusic,
  stopBackgroundMusic
};