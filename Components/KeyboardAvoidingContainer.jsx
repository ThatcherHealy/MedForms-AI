import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, {useContext} from "react";
import { Platform } from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";


const KeyboardAvoidingContainer = ({ children }) => {
  
  const { theme } = useContext(ThemeContext);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff",justifyContent: 'flex-start', alignItems: 'center', backgroundColor: theme.background2, paddingBottom: -35}}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="never"
        enableOnAndroid={true}
        contentContainerStyle={{
          paddingHorizontal: 25, // Add horizontal padding
        }}
      >
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default KeyboardAvoidingContainer;