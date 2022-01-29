import Constants from 'expo-constants';

export default
  Constants.appOwnership == 'expo' ?
    require('./config.dev').default :
    require('./config.prod').default;