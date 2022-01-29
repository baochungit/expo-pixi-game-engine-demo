import Element from './Element';
import CanvasRenderingContext2D from 'expo-2d-context';
import * as ReservedContext from 'libs/reserved-gl-context';


class HTMLCanvasElement extends Element {

  get data() {
    if (this._context2d) {
      return this._context2d.getImageData(0, 0, this.width, this.height).data;
    }
    return null;
  }

  constructor(tagName) {
    super(tagName);
    this._context = ReservedContext.get();
    if (this._context) {
      this._context.canvas = this;
    }
    this._context2d = null;
  }

  getContext(contextType, contextOptions) {
    if (this._context) {
      if (contextType === 'webgl') {
        return this._context;
      }
      if (contextType === '2d') {
        if (!this._context2d) {
          this._context2d = new CanvasRenderingContext2D(this._context, { renderWithOffscreenBuffer: true });
        }
        return this._context2d;
      }
    }

    return {
      fillText: (text, x, y, maxWidth) => ({}),
      measureText: text => ({
        width: (text || '').split('').length * 6,
        height: 24,
      }),
      fillRect: () => ({}),
      drawImage: () => ({}),
      getImageData: () => ({ data: new Uint8ClampedArray([255, 0, 0, 0]) }),
      getContextAttributes: () => ({
        stencil: true,
      }),
      getExtension: () => ({
        loseContext: () => {},
      }),
      putImageData: () => ({}),
      createImageData: () => ({}),
    };
  }

  toBlob() {
    console.log('toBlob');
  }

  toDataURL() {
    console.log('toDataURL');
  }

  captureStream() {
    console.log('captureStream');
  }

  transferControlToOffscreen() {
    console.log('transferControlToOffscreen');
  }

}
export default HTMLCanvasElement;
