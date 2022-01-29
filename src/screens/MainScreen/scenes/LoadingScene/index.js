import * as Font from 'expo-font';
import { PIXI } from 'libs/expo-pixi';
import * as Splash from 'expo-splash-screen';

import { GameScene, GameLoader } from 'utils/Game';
import * as Assets from 'utils/Assets';
import { sleep } from 'utils';

import Background from './Background';
import LoadingAnim from './LoadingAnim';


export default class LoadingScene extends GameScene {
  constructor() {
    super();
  }

  async setup(app, sceneSwitcher, sceneContainer, params) {
    super.setup(app, sceneSwitcher, sceneContainer, params);

    // add background
    const background = new Background();

    // add loading animation
    const loadingAnim = new LoadingAnim();

    await this.addChildren({
      background,
      loadingAnim
    });
  }

  async onSceneReady() {
    await sleep(100);
    Splash.hideAsync();
  }

  async onSceneActive() {
    await this._cacheGameAssets();

    await sleep(3000);
    return this.sceneSwitcher('lobby');
  }

  sceneUpdate(delta) {
    const { loadingAnim } = this.getChildren();
    loadingAnim.update(delta);
  }

  _cacheGameAssets = async () => {
    const loader = new GameLoader();
    const gameAssets = Assets.getGameAssets();
    for (let type in gameAssets) {
      const assets = gameAssets[type];
      for (let j = 0; j < assets.length; j++) {
        loader.add(type, assets[j]);
      }
    }
    await loader.load();
  }
}