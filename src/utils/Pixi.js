import { PIXI } from 'libs/expo-pixi';
import * as PixiEase from 'pixi-ease';


class ButtonHandler {
  constructor(sprite, props = {}) {
    this.props = props;
    this.sprite = sprite;
    this.isActive = this.props.isRadio && this.props.isActive ? true : false;
    this.setActive(this.isActive);
    this.setup();
  }
  
  setup = () => {
    const { sprite } = this;
    const { texture, texturePressed, onClick, onPressed, onUnpressed, isClickNotAllowed, isRadio, alphaPressed } = this.props;

    sprite.interactive = true;
    sprite.buttonMode = true;

    let oldMoveIn = false;
    let hasTouchStart = false;
    sprite.on('touchstart', () => {
      if (isRadio && this.isActive) return;
      hasTouchStart = true;
      oldMoveIn = true;
      if (!this.props.disabled) {
        if (texturePressed !== undefined) {
          sprite.texture = texturePressed;
        }
        if (alphaPressed !== undefined) {
          sprite.alpha = alphaPressed;
        }
        if (typeof onPressed == 'function') {
          onPressed();
        }
      }
    });
    sprite.on('touchmove', (event) => {
      if (isRadio && this.isActive) return;
      if (!hasTouchStart) return;
      const point = event.data.global;
      const moveIn = event.currentTarget == sprite && sprite.containsPoint(point);
      if (moveIn != oldMoveIn) {
        oldMoveIn = moveIn;
        if (!this.props.disabled) {
          if (moveIn) {
            if (texturePressed !== undefined) {
              sprite.texture = texturePressed;
            }
            if (alphaPressed !== undefined) {
              sprite.alpha = alphaPressed;
            }
            if (typeof onPressed == 'function') {
              onPressed();
            }
          } else {
            if (texture !== undefined) {
              sprite.texture = texture;
            }
            if (alphaPressed !== undefined) {
              sprite.alpha = 1.0;
            }
            if (typeof onUnpressed == 'function') {
              onUnpressed();
            }
          }
        }
      }
    });
    sprite.on('touchendoutside', () => {
      hasTouchStart = false;
    });
    sprite.on('tap', () => {
      if (isRadio && this.isActive) return;
      if (!hasTouchStart) return;
      oldMoveIn = false;
      hasTouchStart = false;
      if (!this.props.disabled) {
        if (typeof isClickNotAllowed == 'function' && isClickNotAllowed()) return;
        if (!isRadio && texture !== undefined) {
          sprite.texture = texture;
        }
        if (!isRadio && alphaPressed !== undefined) {
          sprite.alpha = 1.0;
        }
        if (!isRadio && typeof onUnpressed == 'function') {
          onUnpressed();
        }
        if (typeof onClick == 'function') {
          if (isRadio) {
            this.isActive = true;
          }
          onClick();
        }
      }
    });
  };

  setActive(bool) {
    const { sprite } = this;
    const { texture, texturePressed, isRadio } = this.props;
    if (!isRadio) return;
    if (!bool) {
      sprite.texture = texture;
    } else if (texturePressed !== undefined) {
      sprite.texture = texturePressed;
    }
    this.isActive = bool;
  }
}

export const setButtonBehaviour = (sprite, props, extras = {}) => {
  return new ButtonHandler(sprite, props, extras);
};

export const Texture = (from, async = false) => {
  if (async) {
    return PIXI.Texture.fromExpoAsync(from);
  }
  if (typeof from == 'string') {
    return PIXI.Texture.fromFrame(from);
  } else if (from) {
    return PIXI.Texture.from(from);
  } else {
    return PIXI.Texture.EMPTY;
  }
}

export const Sprite = (from, async = false) => {
  if (async) {
    return PIXI.Sprite.fromExpoAsync(from);
  }
  if (typeof from == 'string') {
    return PIXI.Sprite.fromFrame(from);
  } else if (from) {
    return PIXI.Sprite.from(from);
  } else {
    return PIXI.Sprite.from(PIXI.Texture.EMPTY);
  }
}

export const BitmapText = (text, options) => {
  return new PIXI.extras.BitmapText(text, options);
}

export const AnimatedSprite = (frames) => {
  return new PIXI.extras.AnimatedSprite(frames);
}

export const Container = () => {
  return new PIXI.Container();
}
export const Graphics = () => {
  return new PIXI.Graphics();
}

export const createButton = (props, extras = {}) => {
  const { position, texture } = props;

  const sprite = Sprite(texture);
  sprite.anchor.set(0.5);
  if (position !== undefined) {
    const [ x, y ] = position;
    sprite.position.set(x, y);
  }
  const handler = new ButtonHandler(sprite, { ...props, position: undefined }, extras);

  return { sprite, handler };
};

export const createTransparentButton = (props, extras = {}) => {
  const { position } = props;

  delete props.texture;
  delete props.texturePressed;
  delete props.alphaPressed;

  const sprite = Sprite();
  sprite.anchor.set(0.5);
  sprite.width = props.width;
  sprite.height = props.height;
  if (position !== undefined) {
    const [ x, y ] = position;
    sprite.position.set(x, y);
  }

  const handler = new ButtonHandler(sprite, { ...props, position: undefined }, extras);

  return { sprite, handler };
};

export const createOverlay = (props, extras = {}) => {
  const { position, alpha, width, height, texture, onClick } = props;

  const sprite = Sprite(texture);
  sprite.alpha = alpha ? alpha : 0.3;
  sprite.width = width;
  sprite.height = height;

  if (position !== undefined) {
    const [ x, y ] = position;
    sprite.position.set(x, y);
  }

  setButtonBehaviour(sprite, {
    onClick
  }, extras);

  return sprite;
};

export const createRectTexture = (renderer, props = {}) => {
  const color = props.color || 0;
  const width = props.width || 2;
  const height = props.height || 2;
  const round = props.round || 0;
  const graphics = Graphics();
  graphics.beginFill(color);
  graphics.drawRoundedRect(0, 0, width, height, round);
  graphics.endFill();
  return renderer.generateTexture(graphics);
};

export const Ease = (ticker, props = {}) => {
  return new PixiEase.Ease({
    ticker,
    ...props
  });
};
