import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {ThemeContext} from "../contexts/ThemeContext";


const ModeSwapper = ({ mode1, mode2, onModeChange }) => {

    const { theme } = useContext(ThemeContext);
    const styles = createStyles(theme)

    const [currentMode, setCurrentMode] = useState(mode1); // Set the default mode passed in

    useEffect(() => {
        setCurrentMode(mode1);
    }, [mode1]);

  // Function to toggle modes
  const toggleMode = (isMode1) => {
    const newMode = isMode1 ? mode1 : mode2; // Toggle between mode1 and mode2
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode); // Pass the selected mode to the parent component (optional)
    }
  };

  return (
    <View style={styles.container}>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          currentMode === mode1 && styles.activeButton, // Active button style for mode1
          currentMode !== mode1 && styles.inactiveButton, // Inactive button style for mode1
        ]}
        onPress={() => toggleMode(true)} // Pressing this sets mode1
      >
        <Text style={styles.buttonText}>{mode1}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          currentMode === mode2 && styles.activeButton, // Active button style for mode2
          currentMode !== mode2 && styles.inactiveButton, // Inactive button style for mode2
        ]}
        onPress={() => toggleMode(false)} // Pressing this sets mode2
      >
        <Text style={styles.buttonText}>{mode2}</Text>
      </TouchableOpacity>
    </View>
    {/* Optionally show the current mode */}
  </View>
  );
};

function createStyles(theme) {
    return StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  label: {
    fontSize: 18,
    color: 'theme.text',
  },
  buttonContainer: {
    flexDirection: "row",
      width: "75%", // Ensure the pill stretches across the container
      height: 50, // Set the height of the pill container
      backgroundColor: theme.background1, // Background color of the pill (unselected state)
      borderRadius: 25, // Make the container pill-shaped
      overflow: "hidden", // Hide overflow to make rounded edges
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 10,
      marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    flex: 1, // Each button takes up 50% of the container
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background1, // Default background for inactive buttons
    borderRadius: 25, // Ensure the button itself is pill-shaped
    height: "100%", // Full height of the container
  },
  activeButton: {
    backgroundColor: theme.modeSwapperActive, // Active button color (green)
  },
  buttonText: {
    color: theme.text,
    fontSize: 16,
  },
  selectedMode: {
    fontSize: 16,
    color: theme.text,
  },
});
}

export default ModeSwapper;
