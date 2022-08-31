import 'react-native-gesture-handler';
import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Splash from 'expo-splash-screen';

import MainScreen from 'screens/MainScreen';


const Stack = createStackNavigator();

// keep the Splash visible until loaded
Splash.preventAutoHideAsync();


export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MainScreen" headerMode="none" >
          <Stack.Screen name="MainScreen" component={MainScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
