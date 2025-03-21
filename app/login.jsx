import { ThemeContext } from "../contexts/ThemeContext";
import { View, Text, StyleSheet, Modal, SafeAreaView, TextInput, Keyboard, ScrollView, Pressable, ActivityIndicator, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext, useState, useEffect } from "react";
import { useNavigation } from "expo-router";
import { app, auth } from "@/firebaseSetup";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import {getOfferings, getCustomerInfo, purchaseSubscription, initializeRevenueCat, logInToRevenueCat, restorePurchases} from "@/RevenueCatConfig";


    export default function Login()
    {
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
    const router = useRouter();
    const [signUp, setSignUp] = useState(true);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState();
    const [showModal, setShowModal] = useState(false);

    const [offerings, setOfferings] = useState(null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [subscriptionPackage, setSubscriptionPackage] = useState(null);

    const styles = createStyles(theme);    

    //Just removes the header
    const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
      async function fetchRevenueCatValues()
      {
        await initializeRevenueCat();

        const fetchedOfferings = await getOfferings();
        setOfferings(fetchedOfferings);

        if (fetchedOfferings && fetchedOfferings.current && fetchedOfferings.current.availablePackages.length > 0) {
          setSubscriptionPackage(fetchedOfferings.current.availablePackages[0]);
        } else {
          console.warn('⚠️ No subscription package found.');
        }
      }
      fetchRevenueCatValues();
    }, []);

   useEffect(() => {
    // Check Auth Status
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          console.log("✅ User is signed in:", user.email);
          await logInToRevenueCatAndUpdateInfo(auth.currentUser.uid);
  
          if(await hasActiveSubscription(customerInfo))
          {
            router.replace("/home");
          }
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
        {displayForgotPassword()}
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


            <Modal
        visible={showModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

          <Ionicons
            style={{position: 'absolute', top: 15, right: 15, color: theme.lightText}}
            name="close-circle-outline"
            size= {30}
            onPress={() => setShowModal(false)}
          ></Ionicons>

            <Text style={styles.modalTitle}>Start your MedForms AI subscription!</Text>
            <Text style={styles.modalSubTitle}>1 Week Free • Then $9.99/Month</Text>

            <View style={styles.perksList} showsVerticalScrollIndicator={false}>
        <Text style={styles.perk}>✅ Instantly Generate Medical Forms</Text>
        <Text style={styles.perk}>✅ Save Time with Pre-Filled Templates</Text>
        <Text style={styles.perk}>✅ Utilize a Regularly Updated List of Letter Templates</Text>
        <Text style={styles.perk}>✅ Set Your Own Presets to Generate Exactly the Form You Need</Text>
        <Text style={styles.perk}>✅ Make Paperwork a Problem of the Past</Text>
        <Text style={styles.perk}>✅ Cancel your Subscription at any time</Text>
          </View>

          <Pressable style={styles.continueButton} onPress={() => handleSubscribe()}>
              <Text style={[styles.buttonText, {fontFamily: 'QuicksandBold'}]}>Continue</Text>
            </Pressable>
            <Pressable style={[styles.continueButton, { backgroundColor: "transparent", paddingHorizontal: 5}]} onPress={() => handleRestorePurchases()}>
              <Text style={[styles.buttonText, { color: theme.lightText}]}>Restore Purchases</Text>
            </Pressable>

            {/*<Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>*/}
          </View>
        </View>
      </Modal>


    </View>
    </>
    );

    function displayForgotPassword(){
      if(!signUp)
      {
        return(
          <Text style={[styles.signUpText, {alignSelf: "center", marginTop: 5}]} onPress={handlePasswordReset}>
            Forgot your password?
          </Text>
        )
      }
      else
      {
        return(
          <Text style={[styles.signUpText, {alignSelf: "center", marginTop: 5}]}>
            
          </Text>
        )
      }
    }

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
    
        // Sign in user automatically after sign-up
        setUser(userCredential.user);

        //Go home if there is an active subscription, show modal if there isnt
        if(await hasActiveSubscription(customerInfo))
        {
          router.replace("/home");
        }
        else
        {
          setShowModal(true);
        }
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

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const customerInfo = await getCustomerInfo(userCredential.user.uid);
        const subscribed = await hasActiveSubscription(customerInfo);

        if (subscribed) {
          router.replace("/home");
          console.log("Went home from sign-in")
        } else {
          setShowModal(true);
        }
  
      } catch (error) {
        console.error("❌ Sign-in failed:", error.code);
    
        // Handle different errors
        switch (error.code) {
          case "auth/user-not-found":
            alert("No user found with this email.");
            break;
            case "auth/invalid-email":
              alert("Invalid email format.");
              break;            
          case "auth/invalid-credential":
            alert("Invalid email or password.");
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

    async function  handleSubscribe() {
      
      if (!subscriptionPackage) {
        alert('No subscription package found.');
        return;
      }
  
      setLoading(true);
      newInfo = await purchaseSubscription(subscriptionPackage);
      console.log(`Active subscription status: ${newInfo.entitlements.active["Medforms AI"] ? "active" : "inactive"}`);
      setCustomerInfo(newInfo);
      setLoading(false);
  
      if (await hasActiveSubscription(newInfo)) 
      {
        console.log('✅ Subscription successful, routing to app');
        setModalVisible(false);
        router.replace('/home');
      } 
      else 
      {
        alert('Subscription failed or was cancelled.');
      }
    };

    async function handleRestorePurchases()
    {
      const restored = await restorePurchases();
      if (restored)
      {
        console.log('✅ Restoration successful, routing to app');
        setModalVisible(false);
        router.replace('/home');
      }
      else
      {
        alert('Restoration failed.');
      }
    }

    async function hasActiveSubscription (customerInfoToCheck) {
      try {   
        // Replace 'your_entitlement_id' with your actual entitlement identifier
        const entitlementId = 'MedForms AI';
        let isActive = false;

        if (!customerInfoToCheck) {
          console.warn('⚠️ customerInfo is undefined');
          return false;
        }
        
        if (customerInfoToCheck == null) {
          return false;
        } else if (customerInfoToCheck.entitlements == undefined) {
          return false;
        } else if (customerInfoToCheck.entitlements.active == undefined) {
          return false;
        } else {
          isActive = customerInfoToCheck.entitlements.active[entitlementId] !== undefined;
        }
    
        console.log(`🔎 Subscription status for ${entitlementId}:`, isActive);
    
        return isActive;
      } catch (error) {
        console.error('❌ Error fetching customer info:', error);
        return false; // Assume no access on error
      }
    };
    async function logInToRevenueCatAndUpdateInfo(UID) {
      await logInToRevenueCat(UID);
      const updatedCustomerInfo = await getCustomerInfo();
      setCustomerInfo(updatedCustomerInfo);
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
      modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      modalContent: {
        width: '100%',
        height: '75%', // Makes it almost full-screen
        backgroundColor: theme.background1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
      },
      modalTitle: {
        fontSize: 22,
        marginTop: 20,
        marginBottom: 20,
        color: theme.text, 
        fontFamily: "QuicksandBold",
        textAlign: 'center',
      },
      modalText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        color: theme.text, 
        fontFamily: "QuicksandMedium",  
      },
      continueButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        paddingHorizontal: 100,
        borderRadius: 25,
      },
      cancelText: {
        color: theme.lightText,
        marginTop: 10
      },
      perksList: {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 40,
      },
      perk: {
        fontSize: 16,
        marginBottom: 12,
        color: theme.text,
        fontFamily: "QuicksandMedium",
      },
      modalSubTitle: {
        fontSize: 18,
        marginBottom: 20,
        color: theme.lightText,
        fontFamily: "QuicksandMedium",
        textAlign: 'center',
      },
      
  });
}