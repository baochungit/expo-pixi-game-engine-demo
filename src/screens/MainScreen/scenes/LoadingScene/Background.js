import { PIXI } from 'libs/expo-pixi';
import { GameObject } from 'utils/Game';

import backgroundRes from 'assets/images/lobby-background-01.jpg';


export default class Background extends GameObject {
  constructor(props = {}) {
    super(props);
  }

  async setup() {
    const sceneSize = this.gameScene.getSize();
    const sprite = await PIXI.Sprite.fromExpoAsync(backgroundRes);
    const ratio = sceneSize.height / sprite.height;
    sprite.scale.set(ratio, ratio);
    sprite.anchor.set(0.5);
    sprite.position.set(sceneSize.width / 2, sceneSize.height / 2);
    this.add('sprite', sprite);
  }
}
