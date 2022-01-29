import 'libs/browser-polyfill';

import * as PixiInstance from 'pixi.js';
import {
  Platform,
  Dimensions,
  PixelRatio
} from 'react-native';
import { resolveAsync } from 'expo-asset-utils';


global.PIXI = global.PIXI || null;

export let PIXI = global.PIXI;

import 'libs/pixi-sortable-container';

import * as filters from 'pixi-filters';
PIXI.filters = { ...(PIXI.filters || {}), ...filters };


class Application extends PIXI.Application {
  constructor({ width, height, scale, backgroundColor, context, ...props }) {
    if (!context)
      throw new Error(
        'expo-pixi: new Application({ context: null }): context must be a valid WebGL context.'
      );

    if (Platform.OS !== 'web') {
      // Shim stencil buffer attribute
      const getAttributes = context.getContextAttributes || (() => ({}));
      context.getContextAttributes = () => {
        const contextAttributes = getAttributes();
        return {
          ...contextAttributes,
          stencil: true,
        };
      };
    }

    const defaultScale = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('window').width) / 750;
    const resolution = scale || defaultScale;
    super({
      context,
      resolution,
      width: width || context.drawingBufferWidth / resolution,
      height: height || context.drawingBufferHeight / resolution,
      backgroundColor,
      ...props,
    });
    this.ticker.add(() => context.endFrameEXP());
  }
}

const isAsset = input => {
  return (
    input &&
    typeof input.width === 'number' &&
    typeof input.height === 'number' &&
    typeof input.localUri === 'string'
  );
};

if (!(PIXI.Application instanceof Application)) {
  const { HTMLImageElement } = global;

  const textureFromExpoAsync = async resource => {
    let asset = resource;
    if (Platform.OS !== 'web') {
      asset = await resolveAsync(resource);
    }
    return PIXI.Texture.from(asset);
  };

  const spriteFromExpoAsync = async resource => {
    const texture = await textureFromExpoAsync(resource);
    return PIXI.Sprite.from(texture);
  };

  const originalSpriteFrom = PIXI.Sprite.from;
  const originalTextureFrom = PIXI.Texture.from;
  PIXI = {
    ...PIXI,
    Application: Application,
    Texture: {
      ...PIXI.Texture,
      from: (...props) => {
        if (Platform.OS === 'web') {
          return originalTextureFrom(...props);
        }
        if (props.length && props[0]) {
          let asset = props[0];
          if (isAsset(asset)) {
            if (asset instanceof HTMLImageElement) {
              return originalTextureFrom(asset);
            } else {
              return originalTextureFrom(new HTMLImageElement(asset));
            }
          } else if (typeof asset === 'string' || typeof asset === 'number') {
            console.warn(
              `PIXI.Texture.from(asset: ${typeof asset}) is not supported. Returning a Promise!`
            );
            return textureFromExpoAsync(asset);
          }
        }
        return originalTextureFrom(...props);
      },
      fromExpoAsync: textureFromExpoAsync,
    },
    Sprite: {
      ...PIXI.Sprite,
      fromExpoAsync: spriteFromExpoAsync,
      from: (...props) => {
        if (Platform.OS === 'web') {
          return originalSpriteFrom(...props);
        }
        if (props.length && props[0]) {
          let asset = props[0];
          if (isAsset(asset)) {
            const image = new HTMLImageElement(asset);
            return originalSpriteFrom(image);
          } else if (typeof asset === 'string' || typeof asset === 'number') {
            console.warn(
              `PIXI.Sprite.from(asset: ${typeof asset}) is not supported. Returning a Promise!`
            );
            return spriteFromExpoAsync(asset);
          }
        }

        return originalSpriteFrom(...props);
      },
    },
  };
}
