import { PixelRatio, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';


const contextStack = [];

const createNewReservedContext = async () => {
  const gl = await GLView.createContextAsync();
  const w = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('window').width);
  const h = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('window').height);
  gl.viewport(0, 0, w, h);
  gl.drawingBufferWidth = w;
  gl.drawingBufferHeight = h;
  return add(gl);
};

const bulkCreate = async (amount) => {
  const contextStackPromise = [];
  for (var i = 0; i < amount; i++) {
    contextStackPromise.push(createNewReservedContext());
  }
  await Promise.all([...contextStackPromise]);
}

export const get = () => {
  let context = null;
  if (contextStack.length > 0) {
    context = contextStack.pop();
  }
  if (contextStack.length < 5) {
    bulkCreate(5);
  }
  return context;
};


export const add = (context) => {
  contextStack.push(context);
};


export const init = async () => {
  // await bulkCreate(5);
};
