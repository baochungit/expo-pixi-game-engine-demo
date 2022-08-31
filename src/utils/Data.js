import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';


const data = {};

const init = async (namespace, fields, options = {}) => {
  data[namespace] = {
    fields,
    options
  };
  const prefix = namespace + '.';
  try {
    const keys = [];
    for (const fieldName of Object.keys(data[namespace].fields)) {
      keys.push(prefix + fieldName);
    }
    await AsyncStorage.multiGet(keys, (err, stores) => {
      stores.map((result, i, store) => {
        const fieldName = store[i][0].replace(prefix, '');
        const value = store[i][1];
        if (value != null) {
          if (options.plainFields && options.plainFields.includes(fieldName)) {
            data[namespace].fields[fieldName] = value;
          } else {
            data[namespace].fields[fieldName] = JSON.parse(value);
          }
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const setFields = (namespace, fields) => {
  const options = data[namespace].options;
  const prefix = namespace + '.';
  const storage = [];
  for (const fieldName in fields) {
    const value = fields[fieldName];
    if (!options.tempFields || !options.tempFields.includes(fieldName)) {
      if (options.plainFields && options.plainFields.includes(fieldName)) {
        storage.push([prefix + fieldName, value]);
      } else {
        storage.push([prefix + fieldName, JSON.stringify(value)]);
      }
    }
    data[namespace].fields[fieldName] = value;
  }
  if (!_.isEmpty(storage)) {
    AsyncStorage.multiSet(storage);
  }
};

const setField = (namespace, fieldName, value) => {
  const object = {};
  object[fieldName] = value;
  setFields(namespace, object);
};

const getField = (namespace, fieldName) => {
  return data[namespace].fields[fieldName];
};

export default {
  init,
  setFields,
  setField,
  getField
};