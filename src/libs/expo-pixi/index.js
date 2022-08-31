import '@expo/browser-polyfill';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';
import * as Utils from 'utils';


// touches
class TouchEvent {
  constructor() {
    this.clientX = 0;
    this.clientY = 0;
    this.touches = [];
  }
  preventDefault() {}
  stopPropagation() {}
}
window.TouchEvent = TouchEvent;
window.ontouchstart = {};

import * as filters from 'pixi-filters'; 
import * as PixiInstance from 'pixi.js';
import { Platform, Dimensions, PixelRatio } from 'react-native';
import { Asset } from 'expo-asset';

global.PIXI = global.PIXI || PixiInstance;

export let PIXI = global.PIXI;

PIXI.filters = { ...(PIXI.filters || {}), ...filters };

import 'libs/pixi-sortable-container';


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

    const defaultScale = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('window').width) / 746;
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
    // typeof input.width === 'number' &&
    // typeof input.height === 'number' &&
    typeof input.localUri === 'string'
  );
};

const fbProfilePictureCache = {};
const assetFromFBProfilePicture = async (uri) => {
  const params = Utils.urlParams(uri);
  if (fbProfilePictureCache[params.asid]) {
    return fbProfilePictureCache[params.asid];
  }
  const asset = new Asset({
    name: `fb-profilepic-${params.asid}`,
    type: 'png',
    hash: params.hash,
    uri,
    width: null,
    height: null,
  });
  const localUri = `${FileSystem.cacheDirectory}${asset.name}-${asset.hash}.${asset.type}`;
  const fileInfo = await FileSystem.getInfoAsync(localUri, { size: false });
  if (!fileInfo.exists) {
    await FileSystem.downloadAsync(uri, localUri);
  }
  Image.getSize(localUri, (width, height) => {
    asset.width = width;
    asset.height = height;
  });
  await Utils.sleepUntil(() => asset.width);
  asset.downloaded = true;
  asset.localUri = localUri;
  fbProfilePictureCache[params.asid] = asset;
  return asset;
};

const loadAsset = async (resource) => {
  let asset = null;
  try {
    if (typeof resource == 'string') {
      const params = Utils.urlParams(resource);
      if (params.asid && params.hash) {
        asset = await assetFromFBProfilePicture(resource);
      }
    } else {
      asset = await Asset.fromModule(resource).downloadAsync();
      if (asset.localUri.startsWith('file://')) {
        return asset;
      }
      const localUri = `${FileSystem.cacheDirectory}ExponentAsset-${asset.hash}.${asset.type}`;
      const fileInfo = await FileSystem.getInfoAsync(localUri, { size: false });
      if (!fileInfo.exists) {
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: localUri,
        });
      }
      asset.localUri = localUri;
    }
  } catch (error) {
    console.log(error);
  }
  return asset;
};

if (!(PIXI.Application instanceof Application)) {
  const { HTMLImageElement } = global;

  const textureFromExpoAsync = async resource => {
    let asset = resource;
    if (Platform.OS !== 'web') {
      asset = await loadAsset(resource);
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
