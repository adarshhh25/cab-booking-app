// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AccountScreen from '../screens/AccountScreen';
import ContactScreen from '../screens/ContactScreen';
import SettingsScreen from '../screens/SettingsScreen';


// 👇 Step 1: Define the type for your stack navigator
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Account: undefined;
  Contact: undefined;
  Settings: undefined;
  // Add more screens here as needed
};

// 👇 Step 2: Create the stack with typing
const Stack = createNativeStackNavigator<RootStackParamList>();

// 👇 Step 3: Define the navigator
export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Settings"component={SettingsScreen}options={{ headerShown: false }}/>
  </Stack.Navigator>
);
