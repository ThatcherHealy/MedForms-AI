import React, { useState, useContext, useEffect, useMemo } from 'react'
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import {ThemeContext} from "../contexts/ThemeContext";

const DateSelect = ({label, value, onChange, required = true}) => {

  const { theme } = useContext(ThemeContext);
      const { width, height } = useWindowDimensions();
        const scaleFactor = useMemo(() => width / 390, [width]);
        const scaleFontSize = (size, scaleFactor) => {
            return size * scaleFactor; // Return the scaled font size
          };
  const styles = createStyles(theme, width, height, scaleFontSize, scaleFactor);
  const today = new Date();

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      if (onChange) onChange(selectedDate); // Notify parent component
    }
  };

  return ( 
  <View style = {styles.container}>
    <Text style={styles.label}>
       {label}
       {required && <Text style={{color: 'red'}}> *</Text>}
    </Text>

  <View
  style = {[styles.dateInput, {borderColor: value.toDateString() === today.toDateString() ? theme.lightText : '#4CAF50'}]}
  >
      <DateTimePicker
      themeVariant= {theme.date}
      mode = "date"
      display = "default"
      value = {value || new Date()}
      onChange={handleDateChange}
      alignSelf='center'
      style = {[styles.date]}
      accentColor= {'#4CAF50'}
      />
    </View>

  </View>
  )
}
function createStyles(theme, width, height, scaleFontSize, scaleFactor) {
  return StyleSheet.create({
    container: {
      width: width * 0.75, // Set width for the container
      marginBottom: 5,
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
      maxWidth: width * 0.75,
    },
    date: {
      borderRadius: 5,
      fontFamily: 'QuicksandMedium',
      alignSelf: "center",
      color: theme.text,
      minWidth: width * 0.34, // Ensure enough space for full month names
      textAlign: 'center', // Keep the text centered
      paddingHorizontal: 2,
    },
    dateInput: {
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 5,
      padding: 5,
      alignSelf: 'center',
      width: 'auto',
      backgroundColor: theme.background1,
    },
  });
}
export default DateSelect;