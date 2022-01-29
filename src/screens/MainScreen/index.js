import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
} from 'react-native';

import { PIXI } from 'libs/expo-pixi';
import { GLView } from 'expo-gl';

import { GameEngine, SimpleFadeInTransition, SimpleFadeOutTransition } from 'utils/Game';

import LoadingScene from './scenes/LoadingScene';
import LobbyScene from './scenes/LobbyScene';


const main = async (context) => {
  const app = new PIXI.Application({ context });

  const engine = new GameEngine(app, [
    {
      name: 'loading',
      gameScene: () => new LoadingScene(),
      // onEnterSceneTransition: () => new SimpleFadeInTransition({ step: 0.02 }),
      onLeaveSceneTransition: () => new SimpleFadeOutTransition({ step: 0.02 })
    }, {
      name: 'lobby',
      gameScene: () => new LobbyScene(),
      onEnterSceneTransition: () => new SimpleFadeInTransition({ step: 0.02 })
    }
  ], {
    initialSceneName: 'loading'
  });

  app.ticker.add((delta) => engine.update(delta));

  return app;
};


export default class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: null,
      elements: []
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        const event = this._transformEvent({ ...evt.nativeEvent });
        this._emit('touchstart', event);
      },
      onPanResponderMove: (evt, gestureState) => {
        const event = this._transformEvent({ ...evt.nativeEvent });
        this._emit('touchmove', event);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const event = this._transformEvent({ ...evt.nativeEvent });
        this._emit('touchend', event);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        const event = this._transformEvent({ ...evt.nativeEvent });
        this._emit('touchcancel', event);
      },
    });

    this.extras = React.createRef();
  }

  _onLayout = (event) => {
    const { x: left, y: top, width, height } = event.nativeEvent.layout;
    if (!this.state.screen) {
      this.setState({ screen: { left, top, width, height } });
    }
  };

  _emit = (type, event) => {
    const { interaction } = this.app.renderer.plugins;
    interaction.interactionDOMElement.emitter.emit(type, event);
  };

  _transformEvent = (nativeEvent) => {
    const { interaction } = this.app.renderer.plugins;
    // transfer NativeEvent to TouchEvent
    const event = new TouchEvent();
    const props = Object.getOwnPropertyNames(nativeEvent);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      event[prop] = nativeEvent[prop];
    }

    event.clientX = event.locationX;
    event.clientY = event.locationY;
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      if (touch.clientX == undefined) {
        touch.clientX = touch.locationX;
        touch.clientY = touch.locationY;
      }
    }
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (touch.clientX == undefined) {
        touch.clientX = touch.locationX;
        touch.clientY = touch.locationY;
      }
    }
    event.target = interaction.interactionDOMElement;
    return event;
  }

  render() {
    const { screen } = this.state;
    return (
      <View style={styles.container} onLayout={this._onLayout}>
        {screen ? 
        <GLView
          style={[styles.glview, screen]}
          onContextCreate={async (context) => {
            // let's start the app
            this.app = await main(context);
            this.app.handler = this;
            // to fix issue of getting BoundingClientRect
            const { interaction } = this.app.renderer.plugins;
            interaction.interactionDOMElement.parentElement = {};
          }}
          {...this.panResponder.panHandlers}
        /> : null}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  glview: {
    position: 'absolute',
  }
});
