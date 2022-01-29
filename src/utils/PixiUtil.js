import { PIXI } from 'libs/expo-pixi';


export const setButtonBehaviour = (sprite, props, extras = {}) => {
  const { texture, texturePressed, onClick } = props;
  const { disabled } = extras;
  sprite.interactive = true;
  sprite.buttonMode = true;

  let oldMoveIn = false;
  let hasTouchStart = false;
  sprite.on('touchstart', () => {
    hasTouchStart = true;
    oldMoveIn = true;
    if (!disabled) {
      if (texturePressed !== undefined) {
        sprite.texture = texturePressed;
      }
    }
  });
  sprite.on('touchmove', (event) => {
    if (!hasTouchStart) return;
    const point = event.data.global;
    const moveIn = event.currentTarget == sprite && sprite.containsPoint(point);
    if (moveIn != oldMoveIn) {
      oldMoveIn = moveIn;
      if (!disabled) {
        if (moveIn) {
          if (texturePressed !== undefined) {
            sprite.texture = texturePressed;
          }
        } else {
          if (texture !== undefined) {
            sprite.texture = texture;
          }
        }
      }
    }
  });
  sprite.on('touchendoutside', () => {
    hasTouchStart = false;
  });
  sprite.on('tap', () => {
    if (!hasTouchStart) return;
    oldMoveIn = false;
    hasTouchStart = false;
    if (!disabled) {
      if (texture !== undefined) {
        sprite.texture = texture;
      }
      if (typeof onClick == 'function') {
        onClick();
      }
    }
  });
};

export const createButton = (props, extras = {}) => {
  const { position, texture, texturePressed, onClick } = props;

  const sprite = PIXI.Sprite.from(texture);
  sprite.anchor.set(0.5);
  if (position !== undefined) {
    const [ x, y ] = position;
    sprite.position.set(x, y);
  }
  setButtonBehaviour(sprite, {
    texture,
    texturePressed,
    onClick
  }, extras);

  return sprite;
};
