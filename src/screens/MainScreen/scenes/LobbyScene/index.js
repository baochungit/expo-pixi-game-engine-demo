import { PIXI } from 'libs/expo-pixi';

import { GameScene, GameButton } from 'utils/Game';
import * as Sound from 'utils/Sound';

import Background from './Background';


export default class LobbyScene extends GameScene {
  constructor() {
    super();
  }

  async setup(app, sceneSwitcher, sceneContainer, params) {
    super.setup(app, sceneSwitcher, sceneContainer, params);
    const sceneSize = this.getSize();

    // add background
    const background = new Background();

    // add play button
    const playButton = new GameButton({
      position: [ 190, sceneSize.height - 550 ],
      texture: PIXI.Texture.fromFrame('CT_butt.png'),
      texturePressed: PIXI.Texture.fromFrame('CT_butt_press.png'),
      onClick: () => {
        Sound.playSound('click');
      }
    });

    const playCUButton = new GameButton({
      position: [ 550, sceneSize.height - 550 ],
      texture: PIXI.Texture.fromFrame('CU_butt.png'),
      texturePressed: PIXI.Texture.fromFrame('CU_butt_press.png'),
      onClick: () => {
        Sound.playSound('click');
      }
    });

    // add open settings button
    const openSettingsButton = new GameButton({
      position: [ 600, sceneSize.height - 100 ],
      texture: PIXI.Texture.fromFrame('setting_butt.png'),
      texturePressed: PIXI.Texture.fromFrame('setting_butt_press.png'),
      onClick: () => {
        Sound.playSound('click');
      }
    });

    await this.addChildren({
      background,
      playButton,
      playCUButton,
      openSettingsButton,
    });
  }

  onSceneActive() {
    Sound.playBackgroundMusic('maintheme');
  }

  sceneUpdate(delta) {
    // 
  }
}