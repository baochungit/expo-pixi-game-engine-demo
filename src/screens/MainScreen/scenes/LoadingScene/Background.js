import { GameObject } from 'utils/Game';
import * as Pixi from 'utils/Pixi';


export default class Background extends GameObject {
  constructor(props = {}) {
    super(props);
  }

  async setup() {
    const sceneSize = this.gameScene.getSize();
    const sprite = await Pixi.Sprite(require('assets/images/lobby-background-01.jpg'), true);
    const ratio = sceneSize.height / sprite.height;
    sprite.scale.set(ratio, ratio);
    sprite.anchor.set(0.5);
    sprite.position.set(sceneSize.width / 2, sceneSize.height / 2);
    await this.addChildren({ sprite });
  }
}
