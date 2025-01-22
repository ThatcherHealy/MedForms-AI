import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Switch, StatusBar, SafeAreaView } from "react-native";
import * as Font from "expo-font";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function Settings() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        QuicksandMedium: require("../../assets/fonts/Quicksand-Medium.ttf"),
      });
      await Font.loadAsync({
        QuicksandBold: require("../../assets/fonts/Quicksand-Bold.ttf"),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  // Fallback while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: "#fff" }}>Loading fonts...</Text>
      </SafeAreaView>
    );
  }

  const toggleSwitch = () => {
    const newColorScheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newColorScheme);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      {/* Divider */}
      {/*<View style={styles.separator} />*/}

      <View style = {styles.lowerContainer}>
        {/* Theme Label */}
        <Text style={styles.themeLabel}>Theme</Text>

        {/* Capsule Container for Day Mode */}
        <View style={styles.toggleContainer}>
            <Text style={styles.settingText}>
            {colorScheme === "dark" ? "Dark Mode" : "Light Mode"}
            </Text>
            <Switch
            trackColor={{
                false: theme.background1,
                true: theme.highlight,
            }}
            thumbColor={colorScheme === "dark" ? 'green' : theme.background1}
            ios_backgroundColor={theme.background1}
            value={colorScheme === "dark"}
            onValueChange={toggleSwitch}
            />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background1,
      transition: "background-color 0.3s ease", // Smooth background color transition
    },
    lowerContainer: {
        flex: 1,
        backgroundColor: theme.background2,
        transition: "background-color 0.3s ease", // Smooth background color transition
      },
    header: {
      marginTop: 10,
      marginBottom: 15, // Adjusted to bring divider closer to "Settings"
      alignItems: "flex-start", // Aligning text to the left
      fontWeight: 'bold',
    },
    headerText: {
      fontSize: 32,
      fontWeight: "bold",
      fontFamily: "QuicksandBold",
      color: theme.text,
      marginLeft: 25, // Adjusted for better positioning (moved a bit left)
    },
    separator: {
      height: 1,
      marginTop: 10, // Reduced margin to bring it closer to "Settings"
      backgroundColor: theme.icon,
    },
    themeLabel: {
      fontSize: 18,
      color: '#81C784', // Green color for the "Theme" label
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 0,
      marginLeft: 25, // Adjusted for alignment with other text
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      marginTop: 10,
      backgroundColor: theme.background1, // Set the background color to background1
      borderRadius: 25, // Capsule rounded corners
      marginLeft: 15, // Adjusted for alignment with other text
      marginRight: 5, // Adjusted for alignment with other text
      width: 340,
    },
    settingText: {
      fontSize: 18,
      color: theme.text,
      fontFamily: "QuicksandMedium",
    },
  });
}
