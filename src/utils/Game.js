import { PIXI } from 'libs/expo-pixi';
import * as Sound from 'utils/Sound';
import Layout from 'utils/Layout';
import * as Pixi from 'utils/Pixi';



export const SceneState = {
  INITIAL: 'initial',
  ACTIVE: 'active',
  FINALIZE: 'finalize',
  DONE: 'done'
};

export const TransitionType = {
  HIDE_MASK: 'hide_mask',
  SHOW_MASK: 'show_mask'
};

export class GameSceneTransition {
  constructor(settings) {
    this.settings = settings;
    this.app = null;
  }

  async init(app, sceneContainer) {
    this.app = app;
  }

  update(delta, callback) {
  }
}

export class GameObject {
  constructor(props = {}) {
    this.props = props;
    this.gameScene = null;
    this.parent = null;
    this._children = {};
    this._container = new PIXI.SortableContainer();
    this.initialized = false;
    PIXI.ticker.shared.add(() => this._container.sortChildren());
  }

  async init(parent) {
    let gameScene = null;
    if (parent instanceof GameScene) {
      this.gameScene = parent;
      const { sceneContainer } = this.gameScene;
      sceneContainer.addChild(this._container);
    } else if (parent instanceof GameObject) {
      this.gameScene = parent.gameScene;
      parent._container.addChild(this._container);
    }
    if (!this.gameScene) {
      throw new Error('GameObject must have `gameScene` property');
    }
    this.parent = parent;

    await this.setup();
    this.onUpdateProps(this.props);
    this.initialized = true;
  }

  async liberalInit(gameScene, container) {
    this.gameScene = gameScene;
    container.addChild(this._container);
    await this.setup();
    this.onUpdateProps(this.props);
    this.initialized = true;
  }

  async setup() {}

  set zOrder(value) {
    this._container.zOrder = value;
  }

  get zOrder() {
    return this._container.zOrder;
  }

  setProps(props) {
    for (const propName in props) {
      this.props[propName] = props[propName];
    }
    this.onUpdateProps(props);
  }

  onUpdateProps(props) {}

  async addChild(name, displayObject) {
    if (displayObject instanceof GameObject) {
      if (!displayObject.initialized) {
        await displayObject.init(this);
      } else if (displayObject.parent !== this) {
        throw new Error('GameObject was added to a different one');
      }
    } else {
      this._container.addChild(displayObject);
    }
    this._children[name] = displayObject;
  }

  getChild(name) {
    if (this._children[name] !== undefined) {
      return this._children[name];
    }
    return null;
  }

  removeChild(name) {
    if (this._children[name] !== undefined) {
      const displayObject = this._children[name];
      if (displayObject instanceof GameObject) {
        this._container.removeChild(displayObject._container);
      } else {
        this._container.removeChild(displayObject);
      }
      displayObject.destroy();
      delete this._children[name];
    }
  }

  getContainer() {
    return this._container;
  }

  getSceneEase() {
    return this.gameScene.ease;
  }

  async addChildren(displayObjects) {
    for (const name in displayObjects) {
      await this.addChild(name, displayObjects[name]);
    }
  }

  getChildren() {
    return this._children;
  }

  update(delta) {}

  destroy() {
    for (const name in this._children) {
      const displayObject = this.getChild(name);
      if (displayObject) {
        displayObject.destroy();
      }
    }
    this._container.destroy();
  }
}

export class GameScene {
  constructor() {
    this.app = null;
    this.params = {};
    this.sceneState = SceneState.INITIAL;
    this.onEnterSceneTransition = null;
    this.onLeaveSceneTransition = null;
    this.sceneSwitcher = null;
    this.sceneContainer = null;
    this._listeners = {};
    this._children = {};
  }

  setup(app, sceneSwitcher, sceneContainer, params = {}) {
    this.app = app;
    this.sceneSwitcher = sceneSwitcher;
    this.sceneContainer = sceneContainer;
    this.params = params;
    this.ease = Pixi.Ease(this.app.ticker);
  }

  setOnEnterTransition(onEnterSceneTransition) {
    const { transitionSprite } = onEnterSceneTransition;
    this.onEnterSceneTransition = onEnterSceneTransition;
  }

  setOnLeaveTransition(onLeaveSceneTransition) {
    const { transitionSprite } = onLeaveSceneTransition;
    this.onLeaveSceneTransition = onLeaveSceneTransition;
  }

  setSceneState(sceneState) {
    this.sceneState = sceneState;
  }

  preTransitionUpdate(delta) {
  }

  sceneUpdate(delta) {
  }

  async onSceneSetup() {}

  onSceneReady() {}

  onSceneActive() {}

  onSceneDone() {}

  setListener(eventName, func) {
    this._listeners[eventName] = func;
  }

  removeListener(eventName, func) {
    if (this._listeners[eventName]) {
      delete this._listeners[eventName];
    }
  }

  async addChild(name, gameObject) {
    this._children[name] = gameObject;
    if (!gameObject.initialized) {
      await gameObject.init(this);
    }
  }

  getChild(name) {
    if (this._children[name] !== undefined) {
      return this._children[name];
    }
    return null;
  }

  removeChild(name) {
    if (this._children[name] !== undefined) {
      const gameObject = this._children[name];
      gameObject.destroy();
      delete this._children[name];
    }
  }

  async addChildren(gameObjects) {
    for (const name in gameObjects) {
      await this.addChild(name, gameObjects[name]);
    }
  }

  getChildren() {
    return this._children;
  }

  getSize() {
    const { renderer } = this.app;
    const appWidth =  renderer.width / renderer.resolution;
    const appHeight =  renderer.height / renderer.resolution;
    return { width: appWidth, height: appHeight };
  }

  getSceneRatio() {
    const { renderer } = this.app;
    return renderer.height / renderer.width;
  }

  getScaleRatio(factor = 0.5) {
    const ratio = this.getSceneRatio() * factor;
    return ratio <= 1.0 ? ratio : 1.0;
  }

  getScreenRatio() {
    const { width, height } = this.getSize();
    return { X: Layout.SCREEN_WIDTH / width, Y: Layout.ACTUAL_HEIGHT / height };
  }

  update(delta) {
    switch (this.sceneState) {
      case SceneState.INITIAL:
        const initialized = () => {
          this.sceneState = SceneState.ACTIVE;
          this.onSceneActive();
          if (typeof this._listeners['onSceneActive'] === 'function') {
            this._listeners['onSceneActive'].call();
          }
        };
        if (this.onEnterSceneTransition) {
          this.onEnterSceneTransition.update(delta, () => initialized());
        } else {
          initialized();
        }
        this.preTransitionUpdate(delta);
        break;
      case SceneState.ACTIVE:
        this.sceneUpdate(delta);
        break;
      case SceneState.FINALIZE:
        const finalized = () => {
          this.sceneState = SceneState.DONE;
          this.ease.destroy();
          this.onSceneDone();
          if (typeof this._listeners['onSceneDone'] === 'function') {
            this._listeners['onSceneDone'].call();
          }
        };
        if (this.onLeaveSceneTransition) {
          this.onLeaveSceneTransition.update(delta, () => finalized());
        } else {
          finalized();
        }
        break;
      default:
        break;
    }
  }

  setFinalizing(onSceneDone) {
    this.sceneState = SceneState.FINALIZE;
    this.setListener('onSceneDone', onSceneDone);
  }

  destroy() {
    for (const name in this._children) {
      const gameObject = this.getChild(name);
      if (gameObject) {
        gameObject.destroy();
      }
    }
    this.sceneContainer.destroy();
  }

}

export class GameEngine {
  constructor(app, sceneTemplates, settings) {
    this.app = app;
    this.settings = settings;
    this.sceneTemplates = sceneTemplates;

    this.engineContainer = new PIXI.SortableContainer();
    PIXI.ticker.shared.add(() => this.engineContainer.sortChildren());
    app.stage.addChild(this.engineContainer);

    let scene = null;
    if (settings.initialSceneName) {
      scene = this.createScene(settings.initialSceneName);
    } else if (sceneTemplates.length > 0) {
      scene = this.createScene(sceneTemplates[0].name);
    }
    if (scene) {
      this.setupScene(scene, settings.initialSceneParams || {}).then(() => {
        scene.gameScene.sceneContainer.zOrder = 1;
        scene.gameScene.onSceneReady();
        this.currentScene = scene;
      });
    }
  }

  createScene(sceneName) {
    const template = this.sceneTemplates.find((sceneTemplate) => {
      return sceneTemplate.name === sceneName;
    });
    if (template) {
      return {
        name: template.name,
        gameScene: template.gameScene(),
        onEnterSceneTransition: template.onEnterSceneTransition ? template.onEnterSceneTransition() : null,
        onLeaveSceneTransition: template.onLeaveSceneTransition ? template.onLeaveSceneTransition() : null,
      }
    }
    return null;
  }

  async sceneSwitcher(sceneName, params = {}) {
    const scene = this.createScene(sceneName);
    if (scene) {
      await this.setupScene(scene, params);
      this.currentScene.gameScene.setFinalizing(() => {
        const lastScene = this.currentScene;
        this.currentScene = scene;
        scene.gameScene.sceneContainer.zOrder = 1;
        lastScene.gameScene.sceneContainer.zOrder = 0;
        scene.gameScene.onSceneReady();
        lastScene.gameScene.destroy();
      });
    } else {
      console.error('SCENE NOT FOUND: ' + sceneName);
    }
  }

  async setupScene(scene, params = {}) {
    const gameScene = scene.gameScene;
    const sceneContainer = new PIXI.SortableContainer();
    PIXI.ticker.shared.add(() => sceneContainer.sortChildren());
    await gameScene.setup(
      this.app,
      this.sceneSwitcher.bind(this),
      sceneContainer,
      params
    );
    await gameScene.onSceneSetup();
    if (scene.onEnterSceneTransition) {
      await scene.onEnterSceneTransition.init(this.app, sceneContainer);
      gameScene.setOnEnterTransition(scene.onEnterSceneTransition);
    }
    if (scene.onLeaveSceneTransition) {
      await scene.onLeaveSceneTransition.init(this.app, sceneContainer);
      gameScene.setOnLeaveTransition(scene.onLeaveSceneTransition);
    }
    this.engineContainer.addChild(sceneContainer);
  }

  update(delta) {
    if (this.currentScene) {
      this.currentScene.gameScene.update(delta);
    }
  }
}

export class GameLoader {
  constructor(resources = []) {
    this.resources = resources;
  }

  add(type, data) {
    this.resources.push({ type, data });
    return this;
  }

  async _loadResource(resource) {
    if (resource.type == 'spritesheet') {
      const { json, image } = resource.data;
      return new Promise(async (resolve, reject) => {
        const texture = await PIXI.Texture.fromExpoAsync(image);
        const sheet = new PIXI.Spritesheet(texture.baseTexture, json);
        sheet.parse(() => resolve());
      });
    } else if (resource.type == 'bitmapfont') {
      const { fnt, image } = resource.data;
      return new Promise(async (resolve, reject) => {
        const texture = await PIXI.Texture.fromExpoAsync(image);
        const parser = new DOMParser();
        const dom = parser.parseFromString(fnt, 'application/xml');
        PIXI.extras.BitmapText.registerFont(dom, texture);
        resolve();
      });
    } else if (resource.type == 'sound') {
      const { name, file } = resource.data;
      return Sound.load(name, file);
    }
    return new Promise().resolve();
  }

  async load() {
    const loads = [];
    for (let i = 0; i < this.resources.length; i++) {
      const resource = this.resources[i];
      loads.push(this._loadResource(resource))
    }
    return Promise.all(loads);
  }
}


// -------
// extends

export class SimpleFadeInTransition extends GameSceneTransition {
  constructor(settings) {
    super(settings);
    this.transitionSprite = null;
  }

  async init(app, sceneContainer) {
    const { renderer } = app;
    const appWidth =  renderer.width / renderer.resolution;
    const appHeight =  renderer.height / renderer.resolution;
    this.app = app;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFFFFF);
    graphics.lineStyle(1, 0xFFFFFF);
    graphics.drawRect(0, 0, appWidth, appHeight);
    graphics.endFill();
    graphics.alpha = 1.0;
    this.transitionSprite = graphics;

    sceneContainer.addChild(this.transitionSprite, 999);
  }

  update(delta, callback) {
    if (this.transitionSprite.alpha > 0) {
      this.transitionSprite.alpha -= this.settings.step * delta;
    } else {
      callback();
    }
  }
}

export class SimpleFadeOutTransition extends GameSceneTransition {
  constructor(settings) {
    super(settings);
    this.transitionSprite = null;
  }

  async init(app, sceneContainer) {
    const { renderer } = app;
    const appWidth =  renderer.width / renderer.resolution;
    const appHeight =  renderer.height / renderer.resolution;
    this.app = app;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFFFFF);
    graphics.lineStyle(1, 0xFFFFFF);
    graphics.drawRect(0, 0, appWidth, appHeight);
    graphics.endFill();
    graphics.alpha = 0.0;
    this.transitionSprite = graphics;

    sceneContainer.addChild(this.transitionSprite, 999);
  }

  update(delta, callback) {
    if (this.transitionSprite.alpha < 1) {
      this.transitionSprite.alpha += this.settings.step * delta;
    } else {
      callback();
    }
  }
}

export class GameButton extends GameObject {
  constructor(props) {
    props.visible = props.visible ?? true;
    props.disabled = props.disabled ?? false;
    super(props);
  }

  async setup() {
    const { texture, scale } = this.props;
    const sprite = PIXI.Sprite.from(texture);
    sprite.anchor.set(0.5);
    if (scale != undefined) {
      sprite.scale.set(scale);
    }
    Pixi.setButtonBehaviour(sprite, this.props);
    await this.addChildren({ sprite });
  }

  get position() {
    return this.props.position;
  }
  set position(position) {
    this.setProps({ position });
  }

  get visible() {
    return this.props.visible;
  }
  set visible(visible) {
    this.setProps({ visible });
  }

  get disabled() {
    return this.props.disabled;
  }
  set disabled(disabled) {
    this.setProps({ disabled });
  }

  onUpdateProps(props) {
    const container = this.getContainer();
    const { visible, position, disabled } = props;

    if (position !== undefined) {
      const [ x, y ] = position;
      container.position.set(x, y);
    }

    if (visible !== undefined) {
      container.visible = visible;
    }

    if (disabled !== undefined) {
      container.alpha = disabled ? 0.5 : 1;
    }
  }
}
