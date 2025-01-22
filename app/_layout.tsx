import {useContext} from "react";
import {StatusBar} from "react-native";
import { Stack } from 'expo-router';
import { ThemeProvider } from "@/contexts/ThemeContext";

// Root layout with Tab and Stack navigation
export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }}/>
      </Stack>
    </ThemeProvider>
  );
}