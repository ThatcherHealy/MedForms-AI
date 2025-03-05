import { ThemeContext } from "../contexts/ThemeContext";
import { View, Text, StyleSheet, Switch, SafeAreaView, TextInput, Keyboard, ScrollView, Pressable, ActivityIndicator, Image } from "react-native";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "expo-router";
import { app, auth } from "@/firebaseSetup";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";


    export default function Login()
    {
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
    const router = useRouter();
    const [signUp, setSignUp] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState();

    const styles = createStyles(theme);

    //Just removes the header
    const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, [navigation]);

   useEffect(() => {
    console.log("🔥 Firebase App Name:", app.name);
    console.log("✅ Firebase Auth Object:", auth);

    // Check Auth Status
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ User is signed in:", user.email);
        router.replace("/home");
      } else {
        console.log("⚠️ No user signed in");
      }
    });
  }, []);

    useEffect(() => {
        //Loads fonts
        async function loadFonts() {
          await Font.loadAsync({
            'QuicksandMedium': require("../assets/fonts/Quicksand-Medium.ttf"),
          });
           await Font.loadAsync({
                    QuicksandBold: require("../assets/fonts/Quicksand-Bold.ttf"),
                  });
          setFontsLoaded(true);
        }
    
        loadFonts();
      }, []);
  function loadingScreen()
      {
        return(
          <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background2}}>
            <ActivityIndicator size="large" color = {theme.changingHighlight} />
          </SafeAreaView>
        )
      }

      if (!fontsLoaded || loading) {
        return loadingScreen();
      }

    return(
    <>
        <SafeAreaView style = {styles.upperContainer}>
          <Image source = {colorScheme === 'dark' ? require('../assets/images/medforms ai font.png') : require('../assets/images/medforms ai font_blackpng.png') } style = {styles.logoImage}/>
        </SafeAreaView>

          <View style={styles.container}>

            {/* Email Input */}
            <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { color: email ? theme.text : theme.lightText }]}
          placeholder="Enter your email"
          placeholderTextColor={theme.lightText}
          value={email}
          onChangeText={setEmail}
          returnKeyType="done"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, { color: password ? theme.text : theme.lightText }]}
          placeholder="Enter your password"
          placeholderTextColor={theme.lightText}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
        />
        <Text style={[styles.signUpText, {alignSelf: "center", marginTop: 5}]} onPress={handlePasswordReset}>
          Forgot your password?
        </Text>
      </View>

       <Pressable
              style={[
                styles.button,
                (!password || !email) && { backgroundColor: theme.inactiveButton }, // Gray button if not all fields are filled
              ]}
              disabled={(!email || !password)} // Disable button if not all fields are filled
              onPress={signUp ? handleSignUp : handleSignIn}
            >
              <Text style={styles.buttonText}>
                {signUp ? "Sign Up" : "Sign In"}
              </Text>
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {signUp ? `Already have an account?${" "}` : `Don't have an account?${" "}`}
                    <Text style={[styles.signUpText]} onPress={() => setSignUp(!signUp)}>
                    {signUp ? "Sign in here" : "Sign up here"}
                    </Text>
                </Text>
            </View>
            
    </View>
    </>
    );

    async function handleSignUp() {
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
    
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ Account created:", userCredential.user.email);
        alert("Account created successfully!");
    
        // Optionally sign in user automatically after sign-up
        setUser(userCredential.user);

        //Go home
        router.replace("/home");

      } catch (error) {
        
        if (error.code === 'auth/email-already-in-use') {
          alert('That email address is already in use!');
        }
        else if (error.code === 'auth/invalid-email') {
          alert('That email address is invalid!');
        }
        else
        {
          alert("⚠️ Sign-up error:", error.message);
        }      
      } finally {
        setLoading(false);
      }
    }

    async function handleSignIn() {      
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
    
      try {
        setLoading(true);
        
        console.log("Attempting sign-in with:", email, password);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Signed in:", userCredential.user.email);
    
        // Navigate to home screen after successful sign-in
        router.replace("/home");
      } catch (error) {
        console.error("❌ Sign-in failed:", error.message);
    
        // Handle different errors
        switch (error.code) {
          case "auth/user-not-found":
            alert("No user found with this email.");
            break;
          case "auth/wrong-password":
            alert("Incorrect password. Please try again.");
            break;
          case "auth/invalid-email":
            alert("Invalid email format.");
            break;
          default:
            alert("Sign-in failed. Please try again.");
        }
      } finally {
        setLoading(false); // Hide loading state
      }
    }

    async function handlePasswordReset() {
      if (!email) {
        alert("Enter your email to reset your password.");
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        alert("📩 Password reset email sent!");
      } catch (error) {
        console.error("❌ Password reset error:", error.message);
      }
    }
}

function createStyles(theme = {}) {
  return StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        backgroundColor: theme.background2,
      },
      upperContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: theme.background2,
      },
      logoImage: {
        height: 100,
        width: 350,
        resizeMode: 'contain', //Allow image to ignore its aspect ratio
        marginTop: 50,
        marginBottom: 50,
      },
      title: {
        fontSize: 48, // Increased size
        fontWeight: "bold",
        fontFamily: "QuicksandBold",
        color: theme.text,
        alignSelf: "center",
        marginTop: 50, // Moves title higher
        marginBottom: 100,
        width: "auto"

      },
      inputContainer: {
        width: 320,
        marginBottom: 15,
      },
      label: {
        fontSize: 18,
        fontFamily: "QuicksandBold",
        color: theme.text,
        marginBottom: 5,
        marginLeft: 10,
        alignSelf: "flex-start",
        textAlign: "center",
        maxWidth: 320,
      },
      input: {
        borderWidth: 1,
        borderColor: theme.lightText,
        borderRadius: 5,
        padding: 10,
        fontFamily: "QuicksandMedium",
        backgroundColor: theme.background1,
      },
      button: {
        width: "100%",
        marginTop: 10,
      },
      button: {
        backgroundColor: '#4CAF50', // Green background
        borderRadius: 100,
        paddingVertical: 12, // Vertical padding for button
        paddingHorizontal: 50, // Horizontal padding
        marginTop: 10, // Space between input fields and button
        alignItems: 'center', // Center text horizontally
        justifyContent: 'center', // Center text vertically
        width: 'auto', // Allow the button to adjust its width based on content
        minWidth: 200, // Set a minimum width to ensure button is wide enough
        flexDirection: 'row', // Align text horizontally
        textAlign: 'center', // Ensure text is centered
      },
      buttonText: {
        color: theme.buttonText, // White text color
        fontSize: 18,
        fontFamily: 'QuicksandMedium',
      },
      footer: {
        position: "absolute",
        bottom: 40, // Adjusts the text position at the bottom
        alignSelf: "center",
        alignContent: "space-between",
      },
      footerText: {
        fontSize: 16,
        fontFamily: "QuicksandMedium",
        color: theme.lightText,
      },
      signUpText: {
        color: theme.highlight, // Use the primary text color for emphasis
        textDecorationLine: "underline",
        fontFamily: "QuicksandMedium",
      },
      
  });
}