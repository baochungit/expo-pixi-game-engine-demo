
import { Dimensions } from 'react-native';
import { EventEmitter } from 'fbemitter';
import { TextDecoder, TextEncoder } from 'text-encoding';

import HTMLImageElement from './DOM/HTMLImageElement';
import HTMLCanvasElement from './DOM/HTMLCanvasElement';
import HTMLVideoElement from './DOM/HTMLVideoElement';
import Document from './DOM/Document';

import CanvasRenderingContext2D from 'expo-2d-context';

// import './performance';
if (!global.nativePerformanceNow) {
  global.nativePerformanceNow = global.nativePerformanceNow || global.performanceNow || require('fbjs/lib/performanceNow');
  global.performanceNow = global.performanceNow || global.nativePerformanceNow;
}

if (!window.performance || !window.performance.now) {
  window.performance = {
    timeOrigin: -1,
    timing: {
      connectEnd: -1,
      connectStart: -1,
      domComplete: -1,
      domContentLoadedEventEnd: -1,
      domContentLoadedEventStart: -1,
      domInteractive: -1,
      domLoading: -1,
      domainLookupEnd: -1,
      domainLookupStart: -1,
      fetchStart: -1,
      loadEventEnd: -1,
      loadEventStart: -1,
      navigationStart: -1,
      redirectEnd: -1,
      redirectStart: -1,
      requestStart: -1,
      responseEnd: -1,
      responseStart: -1,
      secureConnectionStart: -1,
      unloadEventEnd: -1,
      unloadEventStart: -1,
    },
    now() {
      // TODO: Bacon: Return DOMHighResTimeStamp
      return global.nativePerformanceNow();
    },
    toJSON() {
      return {
        timing: this.timing,
        navigation: this.navigation,
        timeOrigin: this.timeOrigin
      }
    },
    navigation: {
      redirectCount: -1,
      type: -1
    },
    memory: {
      jsHeapSizeLimit: -1,
      totalJSHeapSize: -1,
      usedJSHeapSize: -1
    },
    measure() {
      console.warn('window.performance.measure is not implemented')
    },
    mark() {
      console.warn('window.performance.mark is not implemented')
    },
    clearMeasures() {
      console.warn('window.performance.clearMeasures is not implemented')
    },
    clearMarks() {
      console.warn('window.performance.clearMarks is not implemented')
    },
    clearResourceTimings() {
      console.warn('window.performance.clearResourceTimings is not implemented')
    },
    setResourceTimingBufferSize() {
      console.warn('window.performance.setResourceTimingBufferSize is not implemented')
    },
    getEntriesByType() {
      console.warn('window.performance.getEntriesByType is not implemented')
      return [];
    },
    getEntriesByName() {
      console.warn('window.performance.getEntriesByName is not implemented')
      return [];
    },
    getEntries() {
      console.warn('window.performance.getEntries is not implemented')
    }
  }
}


global.HTMLImageElement = global.HTMLImageElement || HTMLImageElement;
global.Image = global.Image || HTMLImageElement;
global.ImageBitmap = global.ImageBitmap || HTMLImageElement;
global.HTMLVideoElement = global.HTMLVideoElement || HTMLVideoElement;
global.Video = global.Video || HTMLVideoElement;
global.HTMLCanvasElement = global.HTMLCanvasElement || HTMLCanvasElement;
global.Canvas = global.Canvas || HTMLCanvasElement;
global.CanvasRenderingContext2D =
  global.CanvasRenderingContext2D || CanvasRenderingContext2D;
global.WebGLRenderingContext = global.WebGLRenderingContext || function() {};

function checkEmitter() {
  if (
    !window.emitter ||
    !(
      window.emitter.on ||
      window.emitter.addEventListener ||
      window.emitter.addListener
    )
  ) {
    window.emitter = new EventEmitter();
  }
}

window.scrollTo = window.scrollTo || (() => ({}));

window.addEventListener = (eventName, listener) => {
  checkEmitter();
  const addListener = () => {
    if (window.emitter.on) {
      window.emitter.on(eventName, listener);
    } else if (window.emitter.addEventListener) {
      window.emitter.addEventListener(eventName, listener);
    } else if (window.emitter.addListener) {
      window.emitter.addListener(eventName, listener);
    }
  };

  addListener();

  if (eventName.toLowerCase() === 'load') {
    if (window.emitter && window.emitter.emit) {
      setTimeout(() => {
        window.emitter.emit('load');
      }, 1);
    }
  }
};

window.removeEventListener = (eventName, listener) => {
  checkEmitter();
  if (window.emitter.off) {
    window.emitter.off(eventName, listener);
  } else if (window.emitter.removeEventListener) {
    window.emitter.removeEventListener(eventName, listener);
  } else if (window.emitter.removeListener) {
    window.emitter.removeListener(eventName, listener);
  }
};

window.DOMParser = window.DOMParser || require('xmldom-qsa').DOMParser;
global.TextDecoder = global.TextDecoder || TextDecoder;
global.TextEncoder = global.TextEncoder || TextEncoder;

const agent = 'chrome';
global.userAgent = global.userAgent || agent;
global.navigator.userAgent = global.navigator.userAgent || agent;
global.navigator.product = 'ReactNative';
global.navigator.platform = global.navigator.platform || [];
global.navigator.appVersion = global.navigator.appVersion || 'OS10';
global.navigator.maxTouchPoints = global.navigator.maxTouchPoints || 5;
global.navigator.standalone =
  global.navigator.standalone === null ? true : global.navigator.standalone;

window['chrome'] = window['chrome'] || {
  extension: {},
};
///https://www.w3schools.com/js/js_window_location.asp
window.location = window.location || {
  href: '', //  window.location.href returns the href (URL) of the current page
  hostname: '', //window.location.hostname returns the domain name of the web host
  pathname: '', //window.location.pathname returns the path and filename of the current page
  protocol: 'https', //window.location.protocol returns the web protocol used (http: or https:)
  assign: null, //window.location.assign loads a new document
};

if (global.document) {
  global.document.readyState = 'complete';
}


// import './resize';
const { width, height, scale } = Dimensions.get('window');
window.devicePixelRatio = scale;
window.innerWidth = width;
window.clientWidth = width;
window.innerHeight = height;
window.clientHeight = height;
window.screen = window.screen || {};
window.screen.orientation =
  window.screen.orientation || window.clientWidth < window.clientHeight ? 0 : 90;

if (!global.__EXPO_BROWSER_POLYFILL_RESIZE) {
  global.__EXPO_BROWSER_POLYFILL_RESIZE = true;
  Dimensions.addEventListener('change', ({ screen: { width, height, scale } }) => {
  window.devicePixelRatio = scale;
  window.innerWidth = width;
  window.clientWidth = width;
  window.innerHeight = height;
  window.clientHeight = height;

  window.screen.orientation = width < height ? 0 : 90;
  if (window.emitter && window.emitter.emit) {
    window.emitter.emit('resize');
  }
  });
}


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


// import './process';
process.browser = true;

// import './console';
if (!console.count) {
  const counts = {};

  console.count = ((label = '<no label>') => {
    if (!counts[label])
      counts[label] = 0;
    counts[label]++;
    console.log(`${label}: ${counts[label]}`);
  });
}

const startTimes = {};

if (!console.time) {
  console.time = (label => {
    startTimes[label] = window.performance.now();
  });
}

if (!console.timeEnd) {
  console.timeEnd = (label => {
    const endTime = window.performance.now();
    if (startTimes[label]) {
      const delta = endTime - startTimes[label];
      console.log(`${label}: ${delta.toFixed(3)}ms`);
      delete startTimes[label];
    } else {
      console.warn(`Warning: No such label '${label}' for console.timeEnd()`);
    }
  });
}

window.document = window.document || new Document();
