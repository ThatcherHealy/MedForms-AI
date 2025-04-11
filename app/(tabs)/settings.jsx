import React, { useState, useEffect, useContext, useMemo } from "react";
import { View, Text, StyleSheet, Switch, SafeAreaView, TextInput, Keyboard, ScrollView, useWindowDimensions, Pressable } from "react-native";
import * as Font from "expo-font";
import { ThemeContext } from "../../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { auth } from "@/firebaseSetup";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";  
import { ManageSubscription} from "@/RevenueCatConfig";

export default function Settings() {

  const router = useRouter();
  const user = auth.currentUser;
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { width, height } = useWindowDimensions();
  const scaleFactor = useMemo(() => width / 390, [width]);
  const scaleFontSize = (size, scaleFactor) => {
     return size * scaleFactor; // Return the scaled font size
  };
  const styles = createStyles(theme, width, height, scaleFontSize, scaleFactor);
  const [presetValues, setPresetValues] = useState({
    contactInfo: "",
    name: "",
  });

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          QuicksandMedium: require("../../assets/fonts/Quicksand-Medium.ttf"),
        });
        await Font.loadAsync({
          QuicksandBold: require("../../assets/fonts/Quicksand-Bold.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts", error);
      }
    }

    loadFonts();
  }, []);

    useEffect(() => {
    // Load preset values from AsyncStorage when the component mounts
    async function loadPresetValues() {
      try {
        const storedName = await AsyncStorage.getItem("name");
        const storedContactInfo = await AsyncStorage.getItem("contactInfo");

        if (storedName) {
          setPresetValues((prev) => ({ ...prev, name: storedName }));
        }
        if (storedContactInfo) {
          setPresetValues((prev) => ({ ...prev, contactInfo: storedContactInfo }));
        }
      } catch (error) {
        console.error("Error loading preset values", error);
      }
    }

    loadPresetValues();
  }, []); // Empty dependency array ensures this runs once on component mount

    // Save preset values to AsyncStorage whenever they change
    useEffect(() => {
      const savePresetValues = async () => {
        try {
          await AsyncStorage.setItem("name", presetValues.name);
          await AsyncStorage.setItem("contactInfo", presetValues.contactInfo);
        } catch (error) {
          console.error("Error saving preset values", error);
        }
        console.log( await AsyncStorage.getItem("name"))
      };
  
      savePresetValues();
    }, [presetValues]); // This effect runs whenever presetValues change

  // Fallback while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: "#fff" }}>Loading fonts...</Text>
      </SafeAreaView>
    );
  }

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      e.preventDefault();
      setTimeout(() => {
        Keyboard.dismiss();
      }, 100);
    }
  };

  const toggleSwitch = () => {
    const newColorScheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newColorScheme);
  };

  function handleInputChange(name, value) {
    setPresetValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
       <View style={{ flex: 1, backgroundColor: theme.background2, marginBottom: -35 }}>
              <ScrollView 
                contentContainerStyle={{flexGrow:1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background2}} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >  

      <View style={[styles.lowerContainer, {marginBottom: 400}]}>


        <Text style={styles.themeLabel}>Account</Text>

        <View style={[styles.toggleContainer, {flexDirection: "column"}]}>
          <View style={[styles.toggleContainer, {borderRadius: 0, width: width * 0.8, paddingVertical: 0, paddingHorizontal: 10}]}>
            <Text style={styles.settingText}>
              Email
            </Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={[styles.settingText, {width: width * 0.7, color: theme.lightText, flexShrink: 1, textAlign: "right"}]}
                        numberOfLines={1} 
                        ellipsizeMode="middle"
                        >
                {user.email}
              </Text>
            </View>
          </View>
            <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
            <Pressable style={[styles.logoutButton]} onPress={handleManageSubscription}>
                <Text style={styles.logoutText}>Manage Subscription</Text>
              </Pressable>

              <Pressable style={[styles.logoutButton, { marginLeft: 20}]} onPress={handleSignOut}>
                <Text style={styles.logoutText}>Log Out</Text>
              </Pressable>

            </View>
        </View>

        <Text style={styles.themeLabel}>Theme</Text>

        <View style={styles.toggleContainer}>
          <Text style={styles.settingText}>
            Dark Mode
          </Text>
          <Switch
            style={{
              transform: [
                { scaleX: 1 * scaleFactor },
                { scaleY: 1 * scaleFactor },
              ],
              marginRight: width > 400 ? 15 * scaleFactor : 0
            }}
            trackColor={{
              false: theme.background1,
              true: theme.highlight,
            }}
            thumbColor={colorScheme === "dark" ? "green" : theme.background1}
            ios_backgroundColor={theme.background1}
            value={colorScheme === "dark"}
            onValueChange={toggleSwitch}
          />
        </View>


        <Text style={styles.themeLabel}>Presets</Text>

        <View style={styles.toggleContainer}>
          <Text style={styles.settingText}>Clinician's Name</Text>
          <TextInput
            multiline={true}
            textAlignVertical="top"
            style={[
              styles.input,
              { color: presetValues.name ? theme.text : theme.lightText },
            ]}
            placeholder={"Dr. Jane Smith"}
            placeholderTextColor={theme.lightText}
            scrollEnabled={true}
            value={presetValues.name}
            returnKeyType="done"
            onKeyPress={handleKeyPress}
            onChangeText={(text) => handleInputChange("name", text.replace(/\n/g, ""))}
          />
        </View>

        <View style={[styles.toggleContainer]}>
          <Text style={[styles.settingText, { alignSelf: "flex-start", paddingTop: 5 }]}>
            Clinic Contact Information
          </Text>
          <TextInput
            multiline={true}
            textAlignVertical="top"
            style={[
              styles.input,
              { color: presetValues.contactInfo ? theme.text : theme.lightText },
            ]}
            placeholder={
              "Dr. John Smith \nMD, ENT Specialist \nHealthy Life Clinic \n123 Wellness Avenue \nSpringfield, IL 62704 \nPhone: (555) 123-4567 \nFax: (555) 123-8901 \nEmail: dr.jane.smith@healthylifeclinic.com"
            }
            placeholderTextColor={theme.lightText}
            scrollEnabled={true}
            value={presetValues.contactInfo}
            onChangeText={(text) =>
              handleInputChange("contactInfo", text)
            }
          />
        </View>
      </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );

  async function handleSignOut() {
    try {
      await signOut(auth);
      console.log("✅ User signed out");
      router.replace("/login"); // Redirect to login screen
    } catch (error) {
      console.error("❌ Sign out error:", error.message);
    }
  }

  async function handleManageSubscription() {
    try {
      await ManageSubscription();
    } catch (error) {
      console.error("❌ Manage subscription error:", error.message);
    }
  }
}

function createStyles(theme, width, height, scaleFontSize, scaleFactor) {
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
      marginBottom: 15,
      alignItems: "flex-start",
      fontWeight: "bold",
    },
    headerText: {
      fontSize: scaleFontSize(32, scaleFactor),
      fontWeight: "bold",
      fontFamily: "QuicksandBold",
      color: theme.text,
      marginLeft: 25,
    },
    themeLabel: {
      fontSize: scaleFontSize(18, scaleFactor),
      color: "#81C784", // Green color for the "Theme" label
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 0,
      marginLeft: 25,
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      marginTop: 10,
      backgroundColor: theme.background1,
      borderRadius: 25,
      marginLeft: 15,
      marginRight: 5,
      width: width * 0.85,
    },
    settingText: {
      fontSize: scaleFontSize(18, scaleFactor),
      color: theme.text,
      fontFamily: "QuicksandMedium",
      width: width * 0.4,
      marginLeft: 5
    },
    input: {
      borderWidth: 1,
      borderColor: theme.lightText,
      borderRadius: 5,
      padding: 10,
      marginBottom: 5,
      fontFamily: "QuicksandMedium",
      fontSize: scaleFontSize(14, scaleFactor),
      color: theme.lightText,
      backgroundColor: theme.background1,
      flexGrow: 1,
      maxWidth: "60%",
      flexShrink: 1,
    },
    logoutButton: {
      backgroundColor: theme.background2, // Soft red for contrast
      paddingHorizontal: 15,
      borderRadius: 5,
      marginTop: 10, // Ensures spacing below email
      alignSelf: "center", // Aligns with email text
      height: height * 0.04,
      justifyContent: "center",
    },
    
    logoutText: {
      color: theme.text,
      fontSize: scaleFontSize(16, scaleFactor),
      fontFamily: "QuicksandMedium",
      alignSelf: "center",
    },
  });
}
