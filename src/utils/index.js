import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';


export const EventEmitter = new NativeEventEmitter(NativeModules.MyPackage);

export const sleep = m => new Promise(r => setTimeout(r, m));

export function shallowUpdateListItem(originalList, index, what) {
  let list = [ ...originalList ];
  let updatedItem = { ...list[index], ...what };
  list[index] = updatedItem;
  return list;
}

export function getExpireDate(expireInMinutes) {
  const now = new Date();
  let expireTime = new Date(now);
  expireTime.setMinutes(now.getMinutes() + expireInMinutes);
  return expireTime;
}

export function removeAccents(str) {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/\s+/g, ' ')
            .trim();
}

export function standardizeText(str) {
  return str.replace(/\s+/g, ' ')
            .trim();
}


export function degreesToRadians(deg) {
  return (deg / 180) * Math.PI;
}

export function percentToRadians(percentage) {
  // convert the percentage into degrees
  let degrees = percentage * 360 / 100;
  // and so that arc begins at top of circle (not 90 degrees) we add 270 degrees
  return degreesToRadians(degrees + 270);
}

export function wordwrap( str, width, brk ) {
  brk = brk || "\n";
  width = width || 75;
  const lines = [];
  str_arr = str.split("\n");
  for (let j = 0; j < str_arr.length; j++) {
    let line = '';
    const words = str_arr[j].split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i].trim();
      if (word.length > 0) {
        if (line.length + word.length + 1 > width) {
          lines.push(line);
          line = word;
        } else {
          line += (line.length > 0 ? ' ' : '') + word;
        }
      }
    }
    lines.push(line);
  }
  return lines.join(brk);
}