  import { Text, View, Image, TextInput, Pressable, StyleSheet, Dimensions, ActivityIndicator, ScrollView, Clipboard} from "react-native";
  import * as Font from 'expo-font';
  import { SafeAreaView } from "react-native-safe-area-context";
  import { useState, useEffect, useMemo, useCallback } from "react";
  import {SelectList} from 'react-native-dropdown-select-list';
  import React, {useContext} from "react";
  import { ThemeContext } from "../../contexts/ThemeContext";
  import FormInput from "@/Components/FormInput";
  import ModeSwapper from "@/Components/ModeSwapper";
  import DateSelect from "@/Components/DateSelect";
  import KeyboardAvoidingContainer from "@/Components/KeyboardAvoidingContainer";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import OpenAI from "openai";  
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { useFocusEffect } from "@react-navigation/native"; 
  import { app } from "@/firebaseSetup";
  import {functions, httpsCallable} from "@/firebaseSetup"
  import { useWindowDimensions } from 'react-native';

  export default function Home() {
    const { theme } = useContext(ThemeContext);
    const { width, height } = useWindowDimensions();
    const scaleFactor = useMemo(() => width / 390, [width]);
    const scaleFontSize = (size, scaleFactor) => {
      return size * scaleFactor; // Return the scaled font size
    };
    const styles = createStyles();

    const [presetValues, setPresetValues] = useState({
      contactInfo: "",
      name: "",
    });

    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selected, setSelected] = useState("");
    const [selectedFormName, setSelectedFormName] = useState("");
    const [fetching, setFetching] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [response, setResponse] = useState("");
    const [formHeightLimited, setFormHeightLimited] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    const [instructionCount, setInstructionCount] = useState(1);
    const [warningCount, setWarningCount] = useState(1);
    const [restrictionCount4, setRestrictionCount4] = useState(1);
    const [restrictionCount7, setRestrictionCount7] = useState(1);

    const [formValues, setFormValues] = useState({
      // 1 (Insurance Appeal)
      deniedTreatment1: "",
      patientCondition1: "",
      previousTreatments1: "",
      reasonForAppeal1: "",

      // 2 (Medical Necessity Letter)
      patientDiagnosis2: "",
      requestedTreatment2: "",
      rationaleForTreatment2: "",
      previousTreatments2: "",

      // 3 (Patient Instruction Letter)
      conditionOrMedication3: "Condition",
      patientConditionName3: "",
      instructions3_1: "",
      instructions3_2: "",
      instructions3_3: "",
      instructions3_4: "",
      instructions3_5: "",
      instructions3_6: "",
      instructions3_7: "",
      instructions3_8: "",
      warnings3_1: "",
      warnings3_2: "",
      warnings3_3: "",
      warnings3_4: "",
      warnings3_5: "",
      warnings3_6: "",
      warnings3_7: "",
      warnings3_8: "",

      // 4 (Medical Leave of Absence Letter)
      startDateOfLeave4: new Date(),
      endDateOfLeave4: new Date(),
      reasonForMedicalLeave4: "",
      restrictions4_1: "",
      restrictions4_2: "",
      restrictions4_3: "",
      restrictions4_4: "",
      restrictions4_5: "",

      // 5 (Referral Letter)
      reasonForReferral5: "",
      relevantMedicalHistory5: "",
      servicesRequested5: "",

      // 6 (Disability Support Letter)
      patientCondition6: "",
      requestedAccommodation6: "",
      medicalJustificationForAccommodation6: "",
      durationOfSupport6: "",

      // 7 (Return-to-Work Letter)
      workOrSchool7: "Work",
      returnDate7: new Date(),
      patientStatusCondition7: "",
      restrictions7_1: "",
      restrictions7_2: "",
      restrictions7_3: "",
      restrictions7_4: "",
      restrictions7_5: "",

      //8 Custom Letter
      customPrompt8: "",

      //Whatever you add here, remember to also add to resetFormValues()
    });

    const { colorScheme } = useContext(ThemeContext);

    const storeReturnForm = async (value) => {
      try {
        await AsyncStorage.setItem('ReturnForm', value);
      } catch (e) {
        console.error('Failed to save the data to the storage', e);
      }
    };

    const fetchOpenAIKey = async () => {
      try {
        const getOpenAIKey = httpsCallable(functions, "getOpenAIKey"); // Cloud Function name
        const response = await getOpenAIKey(); // Call function
        return response.data.apiKey;
      } catch (error) {
        console.error("Error fetching OpenAI API key:", error);
        return null;
      }
    };

    useEffect(() => {
      const checkMyVariable = async () => {
        try {
          // Retrieve 'ReturnForm' from AsyncStorage
          const storedValue = await AsyncStorage.getItem('ReturnForm');
          
          if (storedValue !== null) {
            setSelected(storedValue);
          }
        } catch (e) {
          console.error('Failed to load the data from storage', e);
        }
      };
  
      // Run the check when the component mounts
      checkMyVariable();
    }, []);
    
    useEffect(() => {
      switch(selected) {
        case "1": setSelectedFormName("Insurance Appeal Letter")
        break;
        case "2": setSelectedFormName("Medical Necessity Letter")
        break;
        case "3": setSelectedFormName("Patient Instruction Letter")
        break;
        case "4": setSelectedFormName("Medical Leave of Absence Letter")
        break;
        case "5": setSelectedFormName("Referral Letter")
        break;
        case "6": setSelectedFormName("Disability Support Letter")
        break;
        case "7": {formValues["workOrSchool7"] === "Work" ? setSelectedFormName("Return to Work Letter") : setSelectedFormName("Return to School Letter")}
        break;
        case "8": setSelectedFormName("Custom Letter")
        break;
        default:
      setSelectedFormName("Insurance Appeal Letter");
      } 
      storeReturnForm(selected);
    }, [selected, formValues]);

    useFocusEffect(
      useCallback(() => {
    // Loads preset values from async storage
    async function loadPresetValues() {
      try {
        const storedName = await AsyncStorage.getItem("name");
        const storedContactInfo = await AsyncStorage.getItem("contactInfo");

        setPresetValues({
          name: storedName !== null ? storedName : "",
          contactInfo: storedContactInfo !== null ? storedContactInfo : "",
        });
      } catch (error) {
        console.error("Error loading preset values", error);
      }
    }
    loadPresetValues();
    }, [])
  )

  useEffect(() => {
    //Loads fonts
    async function loadFonts() {
      await Font.loadAsync({
        'QuicksandMedium': require("../../assets/fonts/Quicksand-Medium.ttf"),
      });
       await Font.loadAsync({
                QuicksandBold: require("../../assets/fonts/Quicksand-Bold.ttf"),
              });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);
  if (!fontsLoaded) {
    return ( // Render a loading screen or placeholder
    <SafeAreaView style={styles.logoImageContainer}>
      <Text>Loading fonts...</Text>
    </SafeAreaView>
  )}

  const dropdownData = [
    {key: '1', value: 'Insurance Appeal Letter'},
    {key: '2', value: 'Medical Necessity Letter'},
    {key: '3', value: 'Patient Instruction Letter'},
    {key: '4', value: 'Medical Leave of Absence Letter'},
    {key: '5', value: 'Referral Letter'},
    {key: '6', value: 'Disability Support Letter'},
    {key: '7', value: 'Return to Work/School Letter'},
    {key: '8', value: 'Custom Letter'},
  ];

    return (
        renderScreens()
    );

    function renderScreens()
    {
        if(!generated)
        {
          if(!fetching)
          {
            return renderMainScreen()
          }
          else
          {
            return renderGeneratingScreen()
          }
        }
        else
        {
          return renderGeneratedForm()
        }
      
    }
    function renderMainScreen()
    {
      return(
      <KeyboardAvoidingContainer>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
          <Image source = {colorScheme === 'dark' ? require('../../assets/images/medforms ai font.png') : require('../../assets/images/medforms ai font_blackpng.png') } style = {styles.logoImage}/>
            <SelectList 
            
              style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}
              data={dropdownData} 
              setSelected={setSelected}
              fontFamily='QuicksandMedium'
              maxHeight={dropdownData.length * 38 * scaleFactor}
              placeholder={selected ? dropdownData.find(item => item.key === selected)?.value : "Select a Document Type"}

              boxStyles={{
                width: width * 0.7, 
                height: height * 0.101, 
                paddingVertical: 22,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: theme.border,
                backgroundColor: theme.background1,
                alignSelf: 'center',
              }}

              dropdownTextStyles={{color: theme.text, fontSize: scaleFontSize(16, scaleFactor)}}
              dropdownStyles={{backgroundColor: theme.background1, borderColor: theme.border}}
              searchPlaceholder=""

              inputStyles={styles.dropdownText}

              arrowicon={<Ionicons name="chevron-down" size = {scaleFontSize(20, scaleFactor)} color={theme.text} style = {styles.dropdownDownIcon}/>}
              searchicon={<Ionicons name="search" size={scaleFontSize(16, scaleFactor)} color={theme.icon}  style = {{marginRight: 5}} />}
              closeicon={<Ionicons name="close" size={scaleFontSize(20, scaleFactor)} color={theme.icon} />}

            />
          </View>

            <View style={{ marginTop: 10, alignItems: "center" }}>
              {renderInputForms(selected)}
            </View>


            <View style={{ alignItems: "center" }}>
              {renderButton(selected)}
            </View>

            <View style={{ alignItems: 'center', marginTop: 1 }}>
              <Text style={styles.neverEnterText}>
                Never enter personally identifiable information into MedForms AI.
              </Text>
            </View>
          </KeyboardAvoidingContainer>
      )
    }

    function renderGeneratingScreen()
    {
      return(
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background2}}>
          <ActivityIndicator size="large" color = {theme.changingHighlight} />
          <Text style={[styles.highlightText, marginTop = -5]}>Generating Form...</Text>
        </SafeAreaView>
      )
    }

    function renderGeneratedForm()
    {
      const copy = () => {
        Clipboard.setString(response);
        alert('Copied to clipboard!');
      };

      const handleFocus = () => setIsTyping(true);
      const handleBlur = () => setIsTyping(false);

      return(
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background1 }}>

            <View style={[styles.header,{ marginLeft: 10}]}>                                    
              <Pressable 
                onPress={() => setGenerated(false)} 
                style={{ alignSelf: 'flex-start', marginLeft: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}
              >
                <Ionicons name="arrow-back" size={scaleFontSize(30, scaleFactor)} color={theme.changingHighlight} />
                <Text style={{ color: theme.changingHighlight, fontSize: scaleFontSize(22, scaleFactor), paddingHorizontal: 10,fontWeight: "bold",fontFamily: "QuicksandBold", paddingBottom:2}}>
                  Return to Document Selection
                </Text>
              </Pressable> 
            </View>

            <View style={{ flex: 1, backgroundColor: theme.background2, marginBottom: -35 }}>
              <ScrollView 
                contentContainerStyle={{flexGrow:1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background2}} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >            
                <View style={{ flex: 1, width: "100%", alignItems: 'center' , marginTop: 50}}>
                  <Text style={[styles.text, { fontSize: scaleFontSize(28, scaleFactor), fontWeight: "bold",fontFamily: "QuicksandBold", alignItems: 'center', textAlign: "center", color: theme.icon, marginBottom: 15 }]}>
                    {selectedFormName}
                  </Text>
                  <View style={{ flexDirection: 'column', width: "90%" }}>
                    <TextInput
                      multiline = {true}
                      textAlignVertical='top'
                      style={[styles.input, { height: formHeightLimited ? 300  : "auto"}]}
                      value={response}
                      onChangeText={setResponse}
                      scrollEnabled={true}
                      editable={true} //isEditable
                      onFocus={handleFocus} // Set isTyping to true when focused
                      onBlur={handleBlur} // Set isTyping to false when focus is lost
                    />
                  </View>
                  
                  <View style={{ flexDirection: "column", marginBottom: 0, alignItems: "center" }}>
                    <Ionicons 
                    onPress={() => setFormHeightLimited(!formHeightLimited)} 
                    name= {formHeightLimited ? "chevron-down-outline" : "chevron-up-outline"} 
                    size={scaleFontSize(30, scaleFactor)} color={theme.text}
                    style = {{marginBottom: 5, marginTop: -5}}>
                    </Ionicons>

                    <Pressable onPress={copy} style={[styles.addSubtractButton, {paddingVertical: 10, paddingHorizontal: 30, minHeight: 50}]}>
                      <Text style={{ color: theme.text, fontSize: scaleFontSize(22, scaleFactor), fontFamily: 'QuicksandMedium' }}>
                        {"Copy"}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ alignItems: 'center', marginTop: 1, marginBottom: isTyping ? 500 : 50}}>
                      <Text style={styles.neverEnterText}>
                      MedForms AI is not responsible for the documents it generates. Never send a document without first reading it through
                    </Text>
                </View>

                </View>
              </ScrollView>
        </View>
    </SafeAreaView>
    )}

    function handleInputChange(name, value) {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
      
      function renderInputForms(index) {
        const createInput = (label, placeholder, valueKey, scrollAllowed, required, scalable) => (
          <FormInput
            label={label}
            placeholder={placeholder}
            value={formValues[valueKey]}
            onChangeText={(text) => handleInputChange(valueKey, text.replace(/\n/g, ''))}
            scrollAllowed={scrollAllowed}
            required = {required}
            scalable = {scalable}
          />
        );
        const createModeSwapper = (mode1, mode2, valueKey, valueOption1, valueOption2) => (
          <ModeSwapper
          mode1={mode1}
          mode2={mode2}
          value = {formValues[valueKey]}
          onModeChange={(newMode) => handleInputChange(valueKey, newMode === mode1 ? valueOption1 : valueOption2)}
          />
        );
        const CreateDateSelect = (label, valueKey, required) => (
          <DateSelect
          label = {label}
          value = {formValues[valueKey]}
          onChange={(newDate) => handleInputChange(valueKey, newDate)}
          required = {required}
          />
        );

        function CreateAddButton(label, max, stateVar, setStateVar, valuekey){

          const addButton = (label, max, stateVar, setStateVar) => (
            <Pressable style={ styles.addSubtractButton}
            onPress={() => {
              if (stateVar < max) {
                setStateVar(stateVar + 1);
              }
            }}
          >
            <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row',}}>
              <Ionicons name="add" size={scaleFontSize(16, scaleFactor)} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: scaleFontSize(12, scaleFactor), marginLeft: 1, fontFamily: 'QuicksandMedium', }}>
                {label}
              </Text>
            </View>
          </Pressable>
          )

          const subtractButton = (label, max, stateVar, setStateVar, margin = false) => (
            <Pressable style={[ styles.addSubtractButton, {marginLeft: margin ? 3 : 0}]}
            onPress={() => {
              if (stateVar >= 2) {
                setStateVar(stateVar - 1);
              }
              setFormValues((prev) => ({ ...prev, [`${valuekey}${stateVar}`]: "" }))
            }}
          >
            <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row',}}>
              <Ionicons name="remove" size={scaleFontSize(16, scaleFactor)} color={theme.text} />
            </View>
          </Pressable>
          )
      if(stateVar < max)
      {
        if(stateVar <= 1)
        {
            return(addButton(label, max, stateVar, setStateVar));
        }
        else
        {
          return(
            <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row',}}>
            {addButton(label, max, stateVar, setStateVar) }
            {subtractButton(label, max, stateVar, setStateVar, true)}
            </View>
          );
        }
      }
      else
      {
        return(subtractButton(label, max, stateVar, setStateVar));
      }
    }
        

      switch (index) {
        case "1": // Insurance Appeal
          return (
            <>
             {createInput("Denied Treatment/Medication", "Enter the denied treatment/medication (e.g. botox injections)", "deniedTreatment1", true)}
             {createInput("Patient Condition", "Enter patient condition (e.g. chronic migraines)", "patientCondition1")}
             {createInput("Previous Treatments Attempted", "Enter previous treatments (e.g. topiramate)", "previousTreatments1", false, false)}
             {createInput("Reason for Appeal", "Enter reason for appeal (e.g. Patient continues to suffer from debilitating symptoms)", "reasonForAppeal1", false, false)}
           </>
          );
          case "2": // Medical Necessity Letter
          return (
            <>
              {createInput("Patient Diagnosis", "Enter patient diagnosis (e.g. sleep apnea)", "patientDiagnosis2", true)}
              {createInput("Requested Treatment/Medication", "Enter requested treatment or medication (e.g. BiPAP machine)", "requestedTreatment2")}
              {createInput("Rationale for Treatment Necessity", "Enter rationale for treatment (e.g. The BiPAP machine will help maintain adequate oxygenation, prevent complications such as cardiovascular strain, and significantly improve my patient’s sleep quality and overall health.)", "rationaleForTreatment2")}
              {createInput("Previous Attempted Treatments", "Enter previously attempted treatments and their results (e.g. CPAP therapy were unsuccessful due to patient intolerance and discomfort)", "previousTreatments2", false, false)}
            </>
          );
        case "3": // Patient Instruction Letter
          return (
            <>
              {createModeSwapper("Condition","Medication", "conditionOrMedication3", "Condition", "Medication")}
              {formValues["conditionOrMedication3"] === "Condition" ? createInput("Patient Condition", "Enter patient condition (e.g. Recovering from knee arthroscopy)", "patientConditionName3", true) : createInput("Patient Medication", "Enter patient medication (e.g. Dextromethorphan)", "patientConditionName3", true)}
              
              {Array.from({ length: instructionCount }, (_, idx) => (
              <React.Fragment key={`instruction-${idx}`}>
                {formValues["conditionOrMedication3"] === "Condition" ? createInput(idx === 0 ? "Instructions" : "", "Enter instruction (e.g. Rest your leg for 48 hours)", `instructions3_${idx + 1}`, false, idx === 0) : createInput(idx === 0 ? "Instructions" : "", "Enter instruction (e.g. Take one 10mg pill every 4 hours as needed)", `instructions3_${idx + 1}`, false, idx === 0)}
              </React.Fragment>
            ))}
              {CreateAddButton("Add Instruction", 8, instructionCount, setInstructionCount, 'instructions3_')} 

              {Array.from({ length: warningCount }, (_, idx) => (
              <React.Fragment key={`warning-${idx}`}>
                {formValues["conditionOrMedication3"] === "Condition" && createInput(idx === 0 ? "Warnings" : "", "Enter warning (e.g. Do not use a heating pad on your leg)", `warnings3_${idx + 1}`, false, false)}
              </React.Fragment>
            ))}
              {formValues["conditionOrMedication3"] === "Condition" && CreateAddButton("Add Warning", 8, warningCount, setWarningCount, 'warnings3_')}
            </>
          );
        case "4": // Medical Leave of Absence Letter
          return (
            <>
              {CreateDateSelect("Start Date of Leave", "startDateOfLeave4")}
              {CreateDateSelect("Expected End Date of Leave", "endDateOfLeave4")}
              {createInput("Reason for Medical Leave", "Enter reason for leave (e.g. Patient is recovering from back surgery)", "reasonForMedicalLeave4")}
              {Array.from({ length: restrictionCount4 }, (_, idx) => (
              <React.Fragment key={`restriction4-${idx}`}>
                {createInput(idx === 0 ? "Restrictions" : "", "Enter restrictions (e.g. patient should avoid heavy lifting for two weeks)", `restrictions4_${idx + 1}`, false, false)}
              </React.Fragment>
            ))}
            {CreateAddButton("Add Restriction", 5, restrictionCount4, setRestrictionCount4, 'restrictions4_')}
            </>
          );
        case "5": // Referral Letter 
          return (
            <>
              {createInput("Patient Condition", "Enter reason for referral (e.g. Chronic sinusitis)", "reasonForReferral5", true)}
              {createInput("Relevant Medical History or Background", "Enter relevant history (e.g. Patient has recieved 12 weeks of antibiotics, but continues to experience significant symptoms)", "relevantMedicalHistory5", false, false)}
              {createInput("Services Requested", "Enter services requested (e.g. Surgical intervention)", "servicesRequested5")}
            </>
          );
        case "6": // Disability Support Letter 
          return (
            <>
              {createInput("Patient Condition", "Enter condition (e.g. Rheumatoid arthritis)", "patientCondition6", true)}
              {createInput("Requested Accommodation", "Enter requested accommodation (e.g An adjustable workstation and reduced typing workload)", "requestedAccommodation6")}
              {createInput("Medical Justification for Accommodation", "Enter medical justification (e.g. Patient experiences joint pain and stiffness, making prolonged typing difficult)", "medicalJustificationForAccommodation6")}
              {createInput("Duration of Disability Support Needed", "Enter duration (e.g. Six months)", "durationOfSupport6", false, false)}
            </>
          );
        case "7": // Return-to-Work Letter
          return (
            <>
              {createModeSwapper("Work","School", "workOrSchool7", "Work", "School")}
              {CreateDateSelect("Return Date", "returnDate7")}
              {createInput("Patient Condition", "Enter the condition the patient recovered from: (e.g. pneumonia)", "patientStatusCondition7", true)}
              {Array.from({ length: restrictionCount7 }, (_, idx) => (
              <React.Fragment key={`restriction7-${idx}` }>
                {createInput(idx === 0 ? "Restrictions" : "", "Enter restrictions (e.g. patient should avoid cold environments for two weeks)", `restrictions7_${idx + 1}`, false, false, true)}
              </React.Fragment>
            ))}
            {CreateAddButton("Add Restriction", 5, restrictionCount7, setRestrictionCount7, 'restrictions7_')}
            </>
          );
          case "8": //Custom Letter
            return (
              <>
              {createInput("Custom Prompt", "Enter prompt (e.g. Generate a non-compliance letter explaining that my patient with hypertension is refusing to be treated with Lisinopril)", "customPrompt8")}
              </>
            );
        default:
          return (
            null
          );
      }
    }

  function renderButton(selected) {
    // Get the relevant keys for the selected section
    const relevantKeys = getRequiredKeys(selected);

    // Check if all the fields for the selected section are filled
    const allFieldsFilled = relevantKeys.every((key) => 
      formValues[key].toString()?.trim().length > 0
    );

    if(selected != "")
      {
    return (
      <Pressable
        style={[
          styles.button,
          !allFieldsFilled && { backgroundColor: theme.inactiveButton }, // Gray button if not all fields are filled
        ]}
        onPress={async() => {
          if (allFieldsFilled && !fetching) {
            const prompt = createPrompt(selected)
            console.log(prompt)
            const aiResponse = await generateLetter(prompt);
            setResponse(aiResponse);
            setGenerated(true);
            resetFormValues();
            setFormHeightLimited(true);
          }
        }}
        disabled={!allFieldsFilled} // Disable button if not all fields are filled
      >
        <Text style={styles.buttonText}>
          Generate
        </Text>
      </Pressable>
    );
  }
  }
  
  
  async function generateLetter(data)
  {
    //Make sure it is only generated once
    if(fetching) return;
    setFetching(true)

    try{
        const prompt = data;
        const OpenAI = require("openai");

        const initializeOpenAI = async () => {
          const apiKey = await fetchOpenAIKey();
          if (!apiKey) {
            console.error("Failed to fetch OpenAI API key.");
            return null;
          }
          return new OpenAI({ apiKey });
        };

        const openai = await initializeOpenAI();
        const aiModel = "gpt-4o";
    
        const aiSettings = [
          {
            role: "system",
            content: "You are an AI clinician's assistant who creates medical documents for clinicians. Your responses should be professional, precise, and concise."
          },
          {
            role: "user",
            content: prompt
          }
        ]
    
        const completion = await openai.chat.completions.create(
          {
            model: aiModel,
            messages: aiSettings,
            store: true,
          }
        )
    
        const aiResponse = completion.choices[0].message.content
        return aiResponse
      }
      catch(error){
        console.error("Error calling backend:", error);
        return "Error generating letter.";
      }
      finally{
        setFetching(false)
      }
  }
  function getRequiredKeys(index) { //Checks if all the required fields are filled out
    const keysMap = {
      "1": ["deniedTreatment1", "patientCondition1"],
      "2": ["patientDiagnosis2", "requestedTreatment2", "rationaleForTreatment2"],
      "3": ["patientConditionName3", "instructions3_1"],
      "4": ["startDateOfLeave4", "endDateOfLeave4", "reasonForMedicalLeave4"],
      "5": ["reasonForReferral5",  "servicesRequested5"],
      "6": ["patientCondition6", "requestedAccommodation6", "medicalJustificationForAccommodation6"],
      "7": ["returnDate7", "patientStatusCondition7"],
      "8": ["customPrompt8"],
    };
    

    return keysMap[index] || [];
  }

  function resetFormValues() {
    setFormValues({
      // 1 (Insurance Appeal)
      deniedTreatment1: "",
      patientCondition1: "",
      previousTreatments1: "",
      reasonForAppeal1: "",
  
      // 2 (Medical Necessity Letter)
      patientDiagnosis2: "",
      requestedTreatment2: "",
      rationaleForTreatment2: "",
      previousTreatments2: "",
  
      // 3 (Patient Instruction Letter)
      conditionOrMedication3: "Condition",
      patientConditionName3: "",
      instructions3_1: "",
      instructions3_2: "",
      instructions3_3: "",
      instructions3_4: "",
      instructions3_5: "",
      instructions3_6: "",
      instructions3_7: "",
      instructions3_8: "",
      warnings3_1: "",
      warnings3_2: "",
      warnings3_3: "",
      warnings3_4: "",
      warnings3_5: "",
      warnings3_6: "",
      warnings3_7: "",
      warnings3_8: "",
  
      // 4 (Medical Leave of Absence Letter)
      startDateOfLeave4: new Date(),
      endDateOfLeave4: new Date(),
      reasonForMedicalLeave4: "",
      restrictions4_1: "",
      restrictions4_2: "",
      restrictions4_3: "",
      restrictions4_4: "",
      restrictions4_5: "",
  
      // 5 (Referral Letter)
      reasonForReferral5: "",
      relevantMedicalHistory5: "",
      servicesRequested5: "",
  
      // 6 (Disability Support Letter)
      patientCondition6: "",
      requestedAccommodation6: "",
      medicalJustificationForAccommodation6: "",
      durationOfSupport6: "",
  
      // 7 (Return-to-Work Letter)
      workOrSchool7: "Work",
      returnDate7: new Date(),
      patientStatusCondition7: "",
      restrictions7_1: "",
      restrictions7_2: "",
      restrictions7_3: "",
      restrictions7_4: "",
      restrictions7_5: "",

      //8 Custom Letter
      customPrompt8: "",
    });
  };

  function createPrompt(index)
  {
    let prompt = "";
    switch(index){
      case "1":
        /*prompt = (
          `Generate an Insurance Appeal Letter for a clinician that is appealing the 
          use of ${formValues["deniedTreatment1"]} for a patient with ${formValues["patientCondition1"]}.`
        );
        if(formValues["previousTreatments1"] != "")
        {
          prompt += `\nMention that ${formValues["previousTreatments1"]} were attempted but ineffective`
        }
        if(formValues["reasonForAppeal1"] != "")
        {
           prompt += `\n${formValues["reasonForAppeal1"]} is the reason for the appeal`
        }*/

        prompt = (
          `
You are a board-certified medical specialist generating a formal letter of medical necessity or insurance appeal. Use the structured patient and treatment information provided below to write a professional, persuasive letter appropriate for submission to a health insurance company.



Use condition-aware logic based on the specialty and diagnosis provided. Integrate relevant details such as:



FDA approval status and indications of the requested treatment
Mechanism of action and how it differs from previously tried treatments
Pharmacological interactions or safety concerns, especially if the patient is on other therapies
Specialty-specific standards of care or clinical guidelines (e.g., APA for psychiatry, ACC/AHA for cardiology, NCCN for oncology, etc.)
Why the insurance-preferred treatment is not appropriate or may pose clinical risk




Format the letter as follows:



Date and provider header
Patient demographics: name, DOB, insurance ID
Summary of condition and clinical context
List of previous treatments and outcomes (including intolerances, lack of efficacy, or contraindications)
Clinical justification for the requested treatment including pharmacology, safety, and relevance to the patient’s current regimen
Formal closing paragraph requesting approval or reconsideration, and offering to provide further documentation or peer-to-peer review




Do not use complex formatting. Use clean, professional language suitable for copy/paste into an EHR, fax, or portal. Leave placeholders for date, provider name, and contact info to make editing easier.



Structured Inputs Provided:



Patient Condition: ${formValues["patientCondition1"]}
Treatments Tried and Outcomes: ${formValues["previousTreatments1"]}
Current Medications or Treatment Plan: ${formValues["deniedTreatment1"]}
Insurance Denial Reason: ${formValues["reasonForAppeal1"]}`
        );

        

        /*prompt += `\n\nUse this example letter as a guide:
        [Date]

        To Whom It May Concern,

        I am writing to formally appeal the denial of [Denied Treatment] for my patient with [patient condition]. 
        [Make an argument for why the treatment should be approved using the reason for appeal and previously attempted treatments if provided].


        Thank you for reconsidering this request. Please feel free to contact me for additional information.

        Sincerely,
        [Clinician's Name]`*/
      break;

      case "2":
      prompt = (
        `Generate a Medical Necesssity Letter to provide medical justification to use ${formValues["requestedTreatment2"]}
        for a patient with ${formValues["patientDiagnosis2"]}. Because: "${formValues["rationaleForTreatment2"]}"`
      );
      if(formValues["previousTreatments2"] != "")
        {
          prompt += `\nMention that ${formValues["previousTreatments2"]} were attempted but ineffective`
        }

        /*prompt += `\n\nUse this example letter as a guide:
        
        [Date]

        To Whom It May Concern,

        I am writing to provide medical justification for the use of [requested treatment] for my patient diagnosed with [patient diagnosis]. 
        [provide the rationale, including previously attempted treatments if they exist, but skipping not including them if no previous treatments were attempted].

        Please do not hesitate to reach out for additional information or clarification.

        Sincerely,
        [Clinician's Name]`*/
      break;

      case "3":
        if(formValues["conditionOrMedication3"] === "Condition")
        {
          prompt = (
            `Generate a Patient Instruction Letter for a patient that has the condition: ${formValues['patientConditionName3']}`
          );

          for(let i =1; i<9; i++)
            {
               if(formValues[`instructions3_${i}`] != "")
               {
                prompt += `\nInstruction ${i}: ${formValues[`instructions3_${i}`]}`
               }
            }

            for(let i =1; i<9; i++)
            {
                 if(formValues[`warnings3_${i}`] != "")
                 {
                  prompt += `\nWarning ${i}: ${formValues[`warnings3_${i}`]}`
                 }
            }

            /*prompt += `\n\nUse this example letter as a guide:
            [Date]

            Dear [Patient's Name],

            This letter is to provide instructions regarding [patient's condition if applicable, or rephrase to fit recovery], please adhere to the following instructions to [why that would help]:

            - [instruction]
            ... *add more if there are more instructions*

            [list warnings]

            [Kind message that fits with the letter]

            Best regards,
            [Clinician's Name]`*/
        }
        else
        {
          prompt = (
            `Generate a Patient Instruction Letter for a patient using the medication: ${formValues['patientConditionName3']}`
          );

          for(let i =1; i<9; i++)
            {
               if(formValues[`instructions3_${i}`] != "")
               {
                prompt += `\nInstruction ${i}: ${formValues[`instructions3_${i}`]}`
               }
            }

            /*prompt += `\n\nUse this example letter as a guide:
            [Date]

            Dear [Patient's Name],

            This letter is to provide instructions regarding the use of [patient's medication], [list instructions]

            [Kind message that fits with the letter]

            Best regards,
            [Clinician's Name]`*/
        }
        
      break;

      case "4":
      prompt = (
        `Generate a Medical Leave of Absence Letter to confirm that the patient requires a medical
        leave of absence starting on ${formValues["startDateOfLeave4"].toDateString()} and they are expected to return 
        on ${formValues["endDateOfLeave4"].toDateString()}. This leave necessary because: ${formValues["reasonForMedicalLeave4"]}`
      );

      if(formValues["restrictions4_1"] != ""){
        for(let i =1; i<6; i++)
          {
             if(formValues[`restrictions4_${i}`])
             {
              prompt += `\nRestriction ${i} is: ${formValues[`restrictions4_${i}`]}`
             }
             if (formValues[`restrictions4_${i+1}`])
             {
              prompt += " and,"
             }
          }}

       /*prompt += `\n\nUse this example letter as a guide:
       [Date]

      To Whom It May Concern,

      This letter serves to confirm that [Patient's Name] requires a medical leave of absence starting [start date] and is expected to return to work on [return date]. [Justify using the reason for necessity].

      [Restrictions]

      Thank you for your understanding.

      Sincerely,
      [Clinician's Name]`*/
      break;

      case "5":
        prompt = (
        `Generate a Referral Letter referring a patient with ${formValues['reasonForReferral5']} to a specialist. 
        You are requesting ${formValues['servicesRequested5']}`
      );
      if(formValues["relevantMedicalHistory5"] != "")
        {
          prompt += `\nMention the patient's relevant history: ${formValues["relevantMedicalHistory5"]}`
        }

        /*prompt += `\n\nUse this example letter as a guide:
        
        [Date]

        Dear [Specialist’s Name],

        I am referring [Patient's Name] for [management of reason for referral]. [Mention relevant history if it has been provided]

        I kindly request [request].

        Please contact me for further information.

        Best regards,
        [Clinician's Name]`*/
      break;

      case "6":
        prompt = (
        `Generate a Disability Support Letter that expresses support for the accommodation: ${formValues['requestedAccommodation6']}
        for a patient with ${formValues["patientCondition6"]}. The justification is: ${formValues['medicalJustificationForAccommodation6']}`
      );

        /*prompt += `\n\nUse this example letter as a guide. Word everything in a way that flows correctly
        [Date]

        To Whom It May Concern,

        I am writing to support [Patient's Name]'s request for [requested accomodation] due to [patient condition]. [Support using the justification above]
        
        Thank you for your consideration.

        Sincerely,
        [Clinician's Name]`*/

        if(formValues["durationOfSupport6"] != "")
          {
            prompt += `\nMention that the patient will need their acommadation for: ${formValues["durationOfSupport6"]}`
          }

      break;

      case "7":
        prompt = (
        `Generate a Return to ${formValues["workOrSchool7"]} Letter expressing that the patient is cleared to return on ${formValues["returnDate7"].toDateString()}
        following recovery from ${formValues['patientStatusCondition7']}`
      );

      if(formValues["restrictions7_1"] != ""){
      for(let i =1; i<6; i++)
        {
           if(formValues[`restrictions7_${i}`])
           {
            prompt += `\nThe patient should avoid: ${formValues[`restrictions7_${i}`]}`
           }
           if (formValues[`restrictions7_${i+1}`])
           {
            prompt += " and,"
           }
        }}

        /*prompt += `\n\nUse this example letter as a guide:
        
        [Date]

        To Whom It May Concern,

        [Patient's Name *In your output keep patient's name in square brackets*] has been medically cleared to return to ${formValues["workOrSchool7"]}*- lowercase*  starting [return date] following recovery from *${formValues['patientStatusCondition7']} - make lowercase*. [If things to avoid have been listed previously in this prompt, add them here]

        Please feel free to reach out for further information or clarification.

        Best regards,
        [Clinician's Name]`*/
      break;
      case "8":
        prompt = (
          `${formValues["customPrompt8"]}`
        );
      break;
    }

    if(presetValues["name"] && presetValues["contactInfo"])
      {
        prompt += `\nClose the email with the name: ${presetValues["name"]}, and the clinic's contact info: ${presetValues["contactInfo"]}`
      }
      else
      {
        if(presetValues["name"])
          prompt += `\nClose the email with the name: ${presetValues["name"]}`
        if(presetValues["contactInfo"])
          prompt += `\nClose the email with the clinic's contact info: ${presetValues["contactInfo"]}`
      }

    console.log("Here")
    prompt += `
    \n\n
    *Rules -
    *Ensure the letter is professional, persuasive, concise, and follows proper formatting for clinician communications.
    *Today's date is ${new Date().toDateString()}, place it at the top of the letter 
    *Format all dates like [full month] [day], [full year]. For example, change "Feb 08 2025" would become "February 8, 2025"
    *Make sure the patient is never gendered and all references to them should be with [Patient's Name]
    *Keep your response as short as the letter allows.
    `
    return prompt
  }

  function createStyles() {
    return StyleSheet.create({
      logoImageContainer: {
        flex: 1,
        justifyContent: 'flex-start', // Align items to the top
        alignItems: 'center', // Center the image horizontally
        backgroundColor: '#fff',
      },
      logoImage: {
        height: height * 0.11,
        width:  width * 0.9,
        resizeMode: 'contain', //Allow image to ignore its aspect ratio
      },
      text:{
        fontFamily: 'QuicksandMedium',
        paddingHorizontal: 30,
        fontSize: scaleFontSize(18, scaleFactor),
        marginTop: 10,
        marginBottom: 5,
        color: theme.text,
      },
      highlightText:{
        fontFamily: 'QuicksandMedium',
        paddingHorizontal: 30,
        fontSize: scaleFontSize(18, scaleFactor),
        marginTop: 10,
        marginBottom: 5,
        color: theme.changingHighlight
      },
      neverEnterText: {
        color: 'orange', 
        fontSize: scaleFontSize(12, scaleFactor), 
        fontFamily: 'QuicksandMedium', 
        textAlign: 'center', 
        padding: 10, 
        maxWidth: width * 0.75 
      },
      dropdownText: {
        fontSize: scaleFontSize(16, scaleFactor),
        color: theme.text, // Darker text color for the search input
        fontFamily: 'QuicksandMedium',
      },
      dropdownDownIcon: {
        marginLeft: 10,
        paddingTop: 3,
      },
      button: {
        backgroundColor: '#4CAF50', // Green background
        borderRadius: 5,
        paddingVertical: 12, // Vertical padding for button
        paddingHorizontal: 50, // Horizontal padding
        marginTop: 20, // Space between input fields and button
        alignItems: 'center', // Center text horizontally
        justifyContent: 'center', // Center text vertically
        width: 'auto', // Allow the button to adjust its width based on content
        minWidth: width * 0.5, // Set a minimum width to ensure button is wide enough
        flexDirection: 'row', // Align text horizontally
        textAlign: 'center', // Ensure text is centered
      },
      disabledButton: {
        backgroundColor: theme.inactiveButton, // Light grays
        borderRadius: 5,
        paddingVertical: 12, // Vertical padding for button
        paddingHorizontal: 50, // Horizontal padding
        marginTop: 20, // Space between input fields and button
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
      scrollView: {
        flex: 1,
        padding: 10,
      },
      addSubtractButton: {
        backgroundColor: theme.background1,
        borderWidth: width > 400 ? 2 : 1,
        borderColor: theme.border,
        borderRadius: 5,
        paddingHorizontal: 5, // Add padding for dynamic width
        height: height * 0.05, // Fixed height
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
       },
       input: {
        borderWidth: width > 400 ? 2 : 1,
        borderColor: theme.border,
        borderRadius: 5,
        padding: 10,
        marginBottom: 5,
        fontFamily: 'QuicksandMedium',
        color: theme.text,
        backgroundColor: theme.background1,
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
    })
  }
  }