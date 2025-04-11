import React, { useState, useContext, useMemo} from 'react';
import { Text, StyleSheet, TextInput, View, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import {ThemeContext} from "../contexts/ThemeContext";
import { useWindowDimensions } from 'react-native';

const FormInput = ({ label, placeholder, value, onChangeText, scrollAllowed = false, required = true, scalable = false}) => {

  
  const { theme } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const scaleFactor = useMemo(() => width / 390, [width]);
  const scaleFontSize = (size, scaleFactor) => {
      return size * scaleFactor; // Return the scaled font size
    };
  const styles = createStyles(theme, width, height, scaleFontSize, scaleFactor, scalable);

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      // Prevent the default behavior (creating a new line)
      e.preventDefault();
      // Dismiss the keyboard after pressing Enter
      Keyboard.dismiss();
    }
  };
  

  return (
    <View style = {styles.container}>
      <Text style={[styles.label, {marginTop: label === "" ? 0 : 10}, {marginBottom: label === "" ? -15 : 5}]}>
        {label}
        {required && <Text style={{color: 'red'}}> *</Text>}
      </Text>
      
      <View style = {{flexDirection: 'column', flexGrow: 1}}>
        <TextInput
            multiline={true}
            textAlignVertical='top'
            style={[
            styles.input,
            { color: value ? theme.text : theme.lightText },
            { borderColor: value ? '#4CAF50' : theme.lightText },
            ]}
            placeholder={placeholder}
            placeholderTextColor = {theme.lightText}
            value={value}
            onChangeText={(text) => {onChangeText(text);}}
            scrollEnabled={scrollAllowed} //First input: true, to avoid wrapping errors. Others: false, to allow scroll
            returnKeyType="done" // Sets return key to "done"
            onKeyPress={handleKeyPress}
            />
      </View>
    </View>
  );
};

FormInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  scrollAllowed: PropTypes.bool,
  required: PropTypes.bool,
};

function createStyles(theme, width, height, scaleFontSize, scaleFactor, scalable) {
  return StyleSheet.create({
    container: {
      width: width * 0.75, // Set width for the container
      flexDirection: 'column',
      flexGrow: 1, // Allow the container to grow
    },
    label: {
      fontFamily: 'QuicksandMedium',
      fontSize: scaleFontSize(14, scaleFactor),
      marginBottom: 5,
      marginTop: 10,
      color: theme.text,
      alignSelf: 'center',
      textAlign: 'center',
      flexWrap: 'wrap',
      maxWidth: width * 0.65,
    },
    input: {
      borderWidth: width > 400 ? 2 : 1,
      borderColor: theme.lightText,
      fontSize: scaleFontSize(14, scaleFactor),
      borderRadius: 5,
      padding: 10,
      marginBottom: scalable && width > 400 ? height * 0.02 : 5,
      fontFamily: 'QuicksandMedium',
      color: theme.lightText,
      backgroundColor: theme.background1,
      //flexGrow: 1, // Allow the TextInput to grow dynamically
    },
  });
}

export default FormInput;
