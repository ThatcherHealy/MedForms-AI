import React, {useContext, useMemo} from 'react';
import { useWindowDimensions } from 'react-native'
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeContext } from "../../contexts/ThemeContext";
export default function Layout() {

  const { theme } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const scaleFactor = useMemo(() => width / 390, [width]);
  const scaleFontSize = (size, scaleFactor) => {
        return size * scaleFactor; // Return the scaled font size
     };
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={scaleFontSize(22, scaleFactor)} color={color} />
          ),
          tabBarActiveTintColor: '#7bbf5c',
          tabBarInactiveTintColor: theme.icon,
          tabBarLabel: 'Home',
          tabBarLabelStyle: {
            fontSize: scaleFontSize(12, scaleFactor),  // Adjust the font size here
            fontWeight: 'bold',  // Customize font weight if needed
          },
          tabBarStyle: {
            backgroundColor: theme.background1,
            paddingTop: 5, // Lower the icons by adding padding to the bottom
            borderTopWidth: 0,
            height: height * 0.09
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} size={scaleFontSize(22, scaleFactor)} color={color} />
          ),
          tabBarActiveTintColor: '#7bbf5c',
          tabBarInactiveTintColor: theme.icon,
          tabBarLabel: 'Settings',
          tabBarLabelStyle: {
            fontSize: scaleFontSize(12, scaleFactor),  // Adjust the font size here
            fontWeight: 'bold',  // Customize font weight if needed
          },
          tabBarStyle: {
            backgroundColor: theme.background1,
            paddingTop: 5, // Lower the icons by adding padding to the bottom
            borderTopWidth: 0,
            height: height * 0.09
          },
        }}
      />
    </Tabs>
  );
}