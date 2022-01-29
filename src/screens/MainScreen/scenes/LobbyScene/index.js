import { PIXI } from 'libs/expo-pixi';

import { GameScene, GameButton } from 'utils/Game';
import Sound from 'utils/Sound';

import Background from './Background';
import ChatButton from './ChatButton';


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

    // add open chat popup button
    const openChatPopupButton = new ChatButton({
      position: [ 150, sceneSize.height - 100 ],
      texture: PIXI.Texture.fromFrame('chat_butt.png'),
      texturePressed: PIXI.Texture.fromFrame('chat_butt_press.png'),
      onClick: () => {
        Sound.playSound('click');
      }
    });

    // add open friend popup button
    const openFriendPopupButton = new GameButton({
      position: [ 300, sceneSize.height - 100 ],
      texture: PIXI.Texture.fromFrame('friends_butt.png'),
      texturePressed: PIXI.Texture.fromFrame('friends_butt_press.png'),
      onClick: () => {
        Sound.playSound('click');
      }
    });
    // add open share button
    const openShareButton = new GameButton({
      position: [ 450, sceneSize.height - 100 ],
      texture: PIXI.Texture.fromFrame('share_butt.png'),
      texturePressed: PIXI.Texture.fromFrame('share_butt_press.png'),
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
      openChatPopupButton,
      openFriendPopupButton,
      openShareButton,
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