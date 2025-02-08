import React, { useState, useContext, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import {ThemeContext} from "../contexts/ThemeContext";

const DateSelect = ({label, value, onChange, required = true}) => {

  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
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
function createStyles(theme) {
  return StyleSheet.create({
    container: {
      width: 320, // Set width for the container
      marginBottom: 5,
    },
    label: {
      fontFamily: 'QuicksandMedium',
      fontSize: 14,
      marginBottom: 5,
      marginTop: 10,
      color: theme.text,
      alignSelf: 'center',
      textAlign: 'center',
      flexWrap: 'wrap',
      maxWidth: 320,
    },
    date: {
      borderRadius: 5,
      fontFamily: 'QuicksandMedium',
      alignSelf: "center",
      color: theme.text,
      minWidth: 135, // Ensure enough space for full month names
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