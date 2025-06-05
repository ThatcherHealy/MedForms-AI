import { ThemeContext } from "../contexts/ThemeContext";
import { View, Text, StyleSheet, Modal, SafeAreaView, TextInput, Keyboard, ScrollView, Pressable, ActivityIndicator, Image, useWindowDimensions, Alert, Linking } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext, useState, useEffect, useMemo, useRef } from "react";
import { useNavigation } from "expo-router";
import { app, auth, deleteUser } from "@/firebaseSetup";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import {getOfferings, getCustomerInfo, purchaseSubscription, initializeRevenueCat, logInToRevenueCat, restorePurchases} from "@/RevenueCatConfig";
import KeyboardAvoidingContainer from "@/Components/KeyboardAvoidingContainer";



    export default function Login()
    {
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
    const router = useRouter();
    const [signUp, setSignUp] = useState(true);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState();
    const [showModal, setShowModal] = useState(false);
    const deletingRef = useRef(false);

    const [offerings, setOfferings] = useState(null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [subscriptionPackage, setSubscriptionPackage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



      const { width, height } = useWindowDimensions();
      const scaleFactor = useMemo(() => width / 390, [width]);
      const scaleFontSize = (size, scaleFactor) => {
         return size * scaleFactor; // Return the scaled font size
      };
    const styles = createStyles(theme, width, height, scaleFontSize, scaleFactor);    

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

          await logInToRevenueCatAndUpdateInfo(user.uid); 
          const customerInfo = await getCustomerInfo(user.uid);
          const subscribed = await hasActiveSubscription(customerInfo);

          if(subscribed)
          {
            if(!deletingRef.current)
            {
            console.log("✅ User is signed in and subscribed:", user.email);
            router.replace("/home");
            }
          }
          else
          {
            console.log("User is signed in but not subscribed:", user.email);
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
    <KeyboardAvoidingContainer scrollEnabled = {false}>

    <View style = {{backgroundColor: theme.background2, flex: 1}}>
        <SafeAreaView style = {styles.upperContainer}>
          <Image source = {colorScheme === 'dark' ? require('../assets/images/medforms ai font.png') : require('../assets/images/medforms ai font_blackpng.png') } style = {styles.logoImage}/>
          <View style = {{flexDirection: "row", marginBottom: 50, marginTop: -15, width: "100%", alignItems: "center", justifyContent: "center"}}>
            <Text style = {[styles.highlightText, {paddingHorizontal: 0, marginTop: 0}]}>By Clinicians,</Text>
            <Text style = {[styles.highlightText, {color: theme.text, paddingHorizontal: 0, marginTop: 0}]}> For Clinicians</Text>
          </View>
        </SafeAreaView>

          <View style={styles.container}>

            {/* Email Input */}
            <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { color: email ? theme.text : theme.lightText, fontSize: scaleFontSize(14, scaleFactor)  }]}
          placeholder="Enter your email"
          placeholderTextColor={theme.lightText}
          value={email}
          onChangeText={setEmail}
          returnKeyType="done"
        />
      </View>

      {/* Password Input */}
      <View style={[styles.inputContainer]}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, { color: password ? theme.text : theme.lightText, fontSize: scaleFontSize(14, scaleFactor), paddingRight: 20  }]}
          placeholder="Enter your password"
          placeholderTextColor={theme.lightText}
          secureTextEntry = {!showPassword}
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
        />
         <Pressable onPress={() => setShowPassword(!showPassword)} style={{ 
      position: 'absolute',
      size: scaleFontSize(20, scaleFactor),
      right: 10,
      top: height * 0.048,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
          <Ionicons 
            name={showPassword ? 'eye' : 'eye-off'} 
            size={scaleFontSize(20, scaleFactor)} 
            color={theme.lightText} 
          />
        </Pressable>
        {displayForgotPassword()}
      </View>

      {displayConfirmPassword()}

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


            <Modal
        visible={showModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>

          <View style={styles.modalContent}>
          <ScrollView 
      contentContainerStyle={[ styles.modalContent, {flexGrow: 1} ]} 
      showsVerticalScrollIndicator={true}
    >
          <Ionicons
            style={{position: 'absolute', top: 0, right: 0, color: theme.lightText}}
            name="close-circle-outline"
            size= {scaleFontSize(30, scaleFactor)}
            onPress={() => {
              setShowModal(false)
              deleteAccount()}}
          ></Ionicons>


            <Text style={styles.modalTitle}>Start your MedForms AI subscription!</Text>
            <Text style={styles.modalSubTitle}>1 Week Free • Then $4.99/Month</Text>

            <View style={styles.perksList} showsVerticalScrollIndicator={false}>
        <Text style={styles.perk}>✅ Instantly Generate Medical Forms</Text>
        <Text style={styles.perk}>✅ Save Time with Pre-Filled Templates</Text>
        <Text style={styles.perk}>✅ Utilize a Regularly Updated List of Letter Templates</Text>
        <Text style={styles.perk}>✅ Set Your Own Presets to Generate Exactly the Form You Need</Text>
        <Text style={styles.perk}>✅ Make Paperwork a Problem of the Past</Text>
        <Text style={styles.perk}>✅ Cancel your Subscription at any time</Text>
          </View>

          <Pressable style={styles.continueButton} onPress={() => handleSubscribe()}>
              <Text style={[styles.buttonText, {fontFamily: 'QuicksandBold'}]}>Subscribe</Text>
            </Pressable>
            <Pressable style={[styles.continueButton, { backgroundColor: "transparent", paddingHorizontal: 5}]} onPress={() => handleRestorePurchases()}>
              <Text style={[styles.buttonText, { color: theme.lightText}]}>Restore Purchases</Text>
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>


    </View>
    </View>
    </KeyboardAvoidingContainer>

    <View style={styles.footer}>
                    <View style={{flexDirection: "row", gap: 20, marginBottom: 10, alignItems: "center", justifyContent: "center"}}>
                  <Text style = {styles.link} onPress={() => Linking.openURL('https://sites.google.com/view/medforms-ai-eula/home')}>
                    Terms of Use
                  </Text>
                  <Text style={styles.link} onPress={() => Linking.openURL('https://sites.google.com/view/medforms-ai-privacy-policy-i/home')}>
                    Privacy Policy
                  </Text> 
                    </View>
                <Text style={styles.footerText}>
                    {signUp ? `Already have an account?${" "}` : `Don't have an account?${" "}`}
                    <Text style={[styles.signUpText]} onPress={() => setSignUp(!signUp)}>
                    {signUp ? "Sign in here" : "Sign up here"}
                    </Text>
                </Text>
            </View>
    </>
    );

    function displayForgotPassword(){
      if(!signUp)
      {
        return(
          <>
          <Text style={[styles.signUpText, {alignSelf: "center", marginTop: 5}]} onPress={handlePasswordReset}>
            Forgot your password?
          </Text>
          <Text style={[styles.signUpText, {alignSelf: "center", marginTop: 5/*, color: theme.lightText*/}]} onPress={handleDeleteAccount}>
          Need to delete your account?
        </Text>
        </>
        )
      }
    }

    function displayConfirmPassword(){
      if(signUp)
        {
          return(
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={[styles.input, { color: password ? theme.text : theme.lightText, fontSize: scaleFontSize(14, scaleFactor), paddingRight: 20 }]}
        placeholder="Enter the same password"
        placeholderTextColor={theme.lightText}
        secureTextEntry = {!showConfirmPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        returnKeyType="done"
      />
      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ 
      position: 'absolute',
      size: scaleFontSize(20, scaleFactor),
      right: 10,
      top: height * 0.048,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
          <Ionicons 
            name={showConfirmPassword ? 'eye' : 'eye-off'} 
            size={scaleFontSize(20, scaleFactor)} 
            color={theme.lightText} 
          />
        </Pressable>
      {displayForgotPassword()}
    </View>
          )
        }
    }

    async function handleSignUp() {
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
      else if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ Account created:", userCredential.user.email);
    
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
        else if (error.code === 'auth/weak-password') {
          alert('Password must contain at least 6 characters.');
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
    async function handleDeleteAccount() {
      deletingRef.current = true;
      if (!email || !password) {
        alert("Please enter the email and password of the account you wish to delete.");
        setDeleting(false);
      }
      else{
      try{
        await signInWithEmailAndPassword(auth, email, password);
            console.log("Deleting account...");
            Alert.alert("Warning",
              "Deleting your account will not cancel your subscription if it's active. To stop being charged, cancel your subscription by pressing Manage Subscription or going to: Settings App > Apple Account > Subscriptions.",
              [
                {
                  text: "Back",
                  style: "cancel",
                },
                {
                  text: "Delete Account",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const user = auth.currentUser;
                      if (user) {
                        await deleteUser(user);
                        alert("User account successfully deleted.");
                        router.replace("/login");
                      }
                    } catch (error) {
                      alert(error.message);
                    }
                  },
                },
              ],
              { cancelable: true }
            );
            

      }
      catch (error) {
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
            alert("Couldn't find account. Please try again.");
        }
      }
      finally{
        deletingRef.current = false;
      }
    }
    }
    async function deleteAccount() {
      let payingUser = false;
      if(await hasActiveSubscription(customerInfo))
        {
          payingUser = true;
        }
      if (user && !payingUser) {
        try {
          const user = auth.currentUser;
          if (user) {
            await deleteUser(user);}
          console.log('🗑️ Deleted user account due to no subscription.');
        } catch (deleteError) {
          console.log('❌ Failed to delete user:', deleteError.message);
        }
      }
    }

    async function  handleSubscribe() {
      
      if (!subscriptionPackage) {
        alert('No subscription package found.');
        return;
      }
      try{
      setLoading(true);
      const newInfo = await purchaseSubscription(subscriptionPackage);
      setCustomerInfo(newInfo);
      setLoading(false);

      const refreshedInfo = await getCustomerInfo(); // or RevenueCat.getCustomerInfo() if using the SDK
      setCustomerInfo(refreshedInfo);
  
      if (await hasActiveSubscription(refreshedInfo)) 
      {
        console.log('✅ Subscription successful, routing to app');
        setShowModal(false);
        router.replace("/home");
      } 
      else 
      {
          alert('Subscription failed or was cancelled.');
          deleteAccount();
      }
    }
    catch (error) {
      console.error('❌ Subscription error:', error.message);
      deleteAccount();
    }
    finally
    {
      setLoading(false);
    }
    };

    async function handleRestorePurchases()
    {
      const restored = await restorePurchases();
      if (restored)
      {
        console.log('✅ Restoration successful, routing to app');
        setShowModal(false);
        router.replace("/home");
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

function createStyles(theme, width, height, scaleFontSize, scaleFactor) {
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
        resizeMode: "contain",
      },
      logoImage: {
        height: height * 0.11,
        width:  width * 0.9,
        aspectRatio: 3.9,
        resizeMode: "stretch", //Allow image to ignore its aspect ratio
        marginTop: 50,
        marginBottom: 0,
      },
      title: {
        fontSize: scaleFontSize(48, scaleFactor), // Increased size
        fontWeight: "bold",
        fontFamily: "QuicksandBold",
        color: theme.text,
        alignSelf: "center",
        marginTop: 50, // Moves title higher
        marginBottom: 100,
        width: "auto"

      },
      inputContainer: {
        width: width * 0.75,
        marginBottom: 15,
      },
      label: {
        fontSize: scaleFontSize(18, scaleFactor),
        fontFamily: "QuicksandBold",
        color: theme.text,
        marginBottom: 5,
        marginLeft: 10,
        alignSelf: "flex-start",
        textAlign: "center",
        maxWidth: width * 0.7,
      },
      input: {
        borderWidth: width > 400 ? 2 : 1,
        height: height * 0.05,
        borderColor: theme.lightText,
        borderRadius: 5,
        padding: 10,
        fontFamily: "QuicksandMedium",
        backgroundColor: theme.background1,
      },
      link: {
        fontSize: scaleFontSize(14, scaleFactor),
        marginTop: 10,
        color: theme.lightText,
        fontFamily: "QuicksandMedium",
        textAlign: "center",
        textDecorationLine: "underline",
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
        minWidth: width * 0.5, // Set a minimum width to ensure button is wide enough
        flexDirection: 'row', // Align text horizontally
        textAlign: 'center', // Ensure text is centered
      },
      buttonText: {
        color: theme.buttonText, // White text color
        fontSize: scaleFontSize(18, scaleFactor),
        fontFamily: 'QuicksandMedium',
      },
      footer: {
        position: "absolute",
        bottom: 40, // Adjusts the text position at the bottom
        alignSelf: "center",
        alignContent: "space-between",
      },
      footerText: {
        fontSize: scaleFontSize(16, scaleFactor),
        fontFamily: "QuicksandMedium",
        color: theme.lightText,
      },
      signUpText: {
        color: theme.highlight, // Use the primary text color for emphasis
        textDecorationLine: "underline",
        fontFamily: "QuicksandMedium",
        fontSize: scaleFontSize(14, scaleFactor),
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      modalContent: {
        width: '100%',
        height: '78%', // Makes it almost full-screen
        backgroundColor: theme.background1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 15,
        alignItems: 'center',
        elevation: 10,
      },
      modalTitle: {
        fontSize: scaleFontSize(22, scaleFactor),
        marginTop: 0,
        marginBottom: 20,
        color: theme.text, 
        fontFamily: "QuicksandBold",
        textAlign: 'center',
      },
      modalText: {
        fontSize: scaleFontSize(16, scaleFactor),
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
        width: '95%',
        paddingHorizontal: 10,
        marginBottom: 30,
      },
      perk: {
        fontSize: scaleFontSize(16, scaleFactor),
        marginBottom: 12,
        color: theme.text,
        fontFamily: "QuicksandMedium",
      },
      modalSubTitle: {
        fontSize: scaleFontSize(18, scaleFactor),
        marginBottom: 20,
        color: theme.lightText,
        fontFamily: "QuicksandMedium",
        textAlign: 'center',
      },
      highlightText:{
        fontFamily: 'QuicksandMedium',
        paddingHorizontal: 30,
        fontSize: scaleFontSize(18, scaleFactor),
        marginTop: 10,
        marginBottom: 5,
        color: theme.changingHighlight
      },
      
  });
}