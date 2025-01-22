import React, {useContext} from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeContext } from "../../contexts/ThemeContext";
export default function Layout() {

  const { theme } = useContext(ThemeContext);

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: theme.icon,
          tabBarLabel: 'Home',
          tabBarStyle: {
            backgroundColor: theme.background1,
            paddingTop: 5, // Lower the icons by adding padding to the bottom
            borderTopWidth: 0,
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} size={size} color={color} />
          ),
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: theme.icon,
          tabBarLabel: 'Settings',
          tabBarStyle: {
            backgroundColor: theme.background1,
            paddingTop: 5, // Lower the icons by adding padding to the bottom
            borderTopWidth: 0,
          },
        }}
      />
    </Tabs>
  );
}
