import {useContext, useEffect, useState} from "react";
import { View, Appearance } from "react-native";
import {StatusBar} from "react-native";
import { Stack } from 'expo-router';
import { auth } from "@/firebaseSetup";
import { ThemeProvider, ThemeContext } from "@/contexts/ThemeContext";
import Login from "./login";

// Root layout with Tab and Stack navigation
export default function RootLayout() {
  const { theme } = useContext(ThemeContext);
  const [initialRoute, setInitialRoute] = useState("");
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

  useEffect(() => {
    const checkAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setInitialRoute("(tabs)"); // or whatever your home screen route is
      } else {
        setInitialRoute("login");
      }
    });

    return () => checkAuth();
  }, []);

if (!initialRoute) {
    return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#121212' : '#F7F7F7'}}>
          </View>); // or show a splash/loading screen
  }

  return (
    <ThemeProvider>
      <Stack
      initialRouteName = {initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        gestureEnabled: false,
      }}>
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }}/>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none'}} />
      </Stack>
    </ThemeProvider>
  );
}