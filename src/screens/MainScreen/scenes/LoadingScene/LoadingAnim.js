import { PIXI } from 'libs/expo-pixi';
import { GameObject, GameLoader } from 'utils/Game';

import fighter_json from 'assets/images/fighter.json';
import fighter_png from 'assets/images/fighter.png';


export default class LoadingAnim extends GameObject {
  constructor(props = {}) {
    super(props);
  }

  async setup() {
    const sceneSize = this.gameScene.getSize();

    await new GameLoader([{
      type: 'spritesheet',
      data: { json: fighter_json, image : fighter_png }
    }]).load();

    let frames = [];
    for (let i = 0; i < 30; i++) {
        let val = i < 10 ? '0' + i : i;
        frames.push(PIXI.Texture.fromFrame('rollSequence00' + val + '.png'));
    }
    const sprite = new PIXI.extras.AnimatedSprite(frames);
    sprite.anchor.set(0.5);
    sprite.position.set(sceneSize.width / 2, sceneSize.height / 2);
    sprite.animationSpeed = 0.5;
    sprite.play();

    this.add('sprite', sprite);
  }

  update(delta) {
    const sprite = this.get('sprite');
    if (sprite) {
      sprite.rotation += 0.01 * delta;
    }
  }
}
