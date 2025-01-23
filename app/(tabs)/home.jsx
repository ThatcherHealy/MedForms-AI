  import { Text, View, Image, TextInput, Pressable, StyleSheet, Dimensions} from "react-native";
  import * as Font from 'expo-font';
  import { SafeAreaView } from "react-native-safe-area-context";
  import { useState, useEffect } from "react";
  import {SelectList} from 'react-native-dropdown-select-list';
  import React, {useContext} from "react";
  import { ThemeContext } from "../../contexts/ThemeContext";
  import FormInput from "@/Components/FormInput";
  import ModeSwapper from "@/Components/ModeSwapper";
  import DateSelect from "@/Components/DateSelect";
  import KeyboardAvoidingContainer from "@/Components/KeyboardAvoidingContainer";
  import Ionicons from "@expo/vector-icons/Ionicons";
  

  export default function Home() {
    
    const { theme } = useContext(ThemeContext);

    const styles = createStyles();
    const { width, height } = Dimensions.get('window');

    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selected, setSelected] = useState("");

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
      instructions3: "",
      warnings3: "",

      // 4 (Medical Leave of Absence Letter)
      startDateOfLeave4: new Date(),
      endDateOfLeave4: new Date(),
      reasonForMedicalLeave4: "",
      recommendationsForWorkModifications4: "",

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
      restrictionsOrLimitations7: "",

      // 8 (Vaccination Status Letter)
      vaccineType8: "",
      vaccinationDates8: "",
      vaccineBatch8: "",

      // 9 (Prescription Justification Letter)
      medicationRequested9: "",
      diagnosisBeingTreated9: "",
      justificationForUse9: "",
      alternativesConsidered9: "",
      durationDosage9: "",
    });
//'.../assets/fonts/Quicksand-Medium.ttf'
      //Loads Fonts
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'QuicksandMedium': require("../../assets/fonts/Quicksand-Medium.ttf"),
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
    {key: '8', value: 'Vaccination Status Letter'},
    {key: '9', value: 'Prescription Justification Letter'},
  ];
//<Image source={require('../assets/images/Placeholder.jpg')} style = {styles.logoImage}/>
    return (
        <KeyboardAvoidingContainer>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <SelectList 
              style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}
              data={dropdownData} 
              setSelected={setSelected}
              fontFamily='QuicksandMedium'
              maxHeight={320}
              placeholder="Select a Document Type"

              boxStyles={{
                width: 300, 
                height: 70, 
                paddingVertical: 22,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: theme.border,
                backgroundColor: theme.background1,
              }}

              dropdownTextStyles={{color: theme.text}}
              dropdownStyles={{backgroundColor: theme.background1, borderColor: theme.border}}
             searchPlaceholder=""

              inputStyles={{
                fontSize: 18,
                color: theme.text, // Darker text color for the search input
                fontFamily: 'QuicksandMedium',
              }}

              arrowicon={<Ionicons name="chevron-down" size={20} color={theme.text} style = {{marginLeft: 10, paddingTop: 3}}/>}
              searchicon={<Ionicons name="search" size={16} color={theme.icon}  style = {{marginRight: 5}} />}
              closeicon={<Ionicons name="close" size={20} color={theme.icon} />}

            />
          </View>

            <View style={{ marginTop: 10, alignItems: "center" }}>
              {renderInputForms(selected)}
            </View>


            <View style={{ alignItems: "center" }}>
              {renderButton(selected)}
            </View>

            <View style={{ alignItems: 'center', marginTop: 1 }}>
              <Text style={{ 
                color: 'orange', 
                fontSize: 12, 
                fontFamily: 'QuicksandMedium', 
                textAlign: 'center', 
                padding: 10, 
                maxWidth: 300 
              }}>
                Never enter personally identifiable information into MedForms AI.
              </Text>
            </View>
          </KeyboardAvoidingContainer>
        //</SafeAreaView>
    );

    function handleInputChange(name, value) {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
      
      function renderInputForms(index) {

        const createInput = (label, placeholder, valueKey, scrollAllowed, required) => (
          <FormInput
            label={label}
            placeholder={placeholder}
            value={formValues[valueKey]}
            onChangeText={(text) => handleInputChange(valueKey, text.replace(/\n/g, ''))}
            scrollAllowed={scrollAllowed}
            required = {required}
          />
        );
        const createModeSwapper = (mode1, mode2, valueKey, valueOption1, valueOption2) => (
          <ModeSwapper
          mode1={mode1}
          mode2={mode2}
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
        

      switch (index) { //                || means expandable  +- means optional     / means swappable
        case "1": // Insurance Appeal
          return (
            <>
             {createInput("Denied Treatment/Medication", "Enter the denied treatment/medication (e.g. botox injections)", "deniedTreatment1", true)}
             {createInput("Patient Condition", "Enter patient condition (e.g. chronic migraines)", "patientCondition1")}
             {createInput("Previous Treatments Attempted", "Enter previous treatments (e.g. topiramate)", "previousTreatments1")}
             {createInput("Reason for Appeal", "Enter reason for appeal (e.g. Patient continues to suffer from debilitating symptoms)", "reasonForAppeal1")}
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
        case "3": // Patient Instruction Letter             ||instructions
          return (
            <>
              {createModeSwapper("Condition","Medication", "conditionOrMedication3", "Condition", "Medication")}
              {formValues["conditionOrMedication3"] === "Condition" ? createInput("Patient Condition", "Enter patient condition (e.g. Recovering from knee arthroscopy)", "patientConditionName3", true) : createInput("Patient Medication", "Enter patient medication (e.g. Dextromethorphan)", "patientConditionName3", true)}
              {formValues["conditionOrMedication3"] === "Condition" ? createInput("Instructions", "Enter instructions (e.g. Rest your leg for 48 hours)", "instructions3") : createInput("Instructions", "Enter instructions (e.g. Take one 10mg pill every 4 hours as needed)", "instructions3")}
              {formValues["conditionOrMedication3"] === "Condition" && createInput("Warnings", "Enter warnings (e.g. Do not use a heating pad on your leg)", "warnings3", false, false)}
            </>
          );
        case "4": // Medical Leave of Absence Letter
          return (
            <>
              {CreateDateSelect("Start Date of Leave", "startDateOfLeave4")}
              {CreateDateSelect("Expected End Date of Leave", "endDateOfLeave4")}
              {createInput("Reason for Medical Leave", "Enter reason for leave (e.g. Patient is recovering from back surgery)", "reasonForMedicalLeave4")}
              {createInput("Recommendations for Work Modifications", "Enter recommendations (e.g. Patient should avoid heavy lifting)", "recommendationsForWorkModifications4", false, false)}
            </>
          );
        case "5": // Referral Letter 
          return (
            <>
              {createInput("Patient Condition", "Enter reason for referral (e.g. Chronic sinusitis)", "reasonForReferral5", true)}
              {createInput("Relevant Medical History or Background", "Enter relevant history (e.g. Patient has recieved 12 months of antibiotics, but continues to experience significant symptoms)", "relevantMedicalHistory5")}
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
              {createInput("Restrictions", "Enter restrictions (e.g. patient should avoid cold environments for two weeks)", "restrictionsOrLimitations7")}
            </>
          );
        case "8": // Vaccination Status Letter    ||vaccination dates
          return (
            <>
              {createInput("Vaccine Type", "Enter vaccine type (e.g. COVID-19 Vaccine - Pfizer)", "vaccineType8", true)}
              {createInput("Vaccination Dates", "Enter vaccination dates", "vaccinationDates8")}
              {createInput("Vaccine Batch Number (if applicable)", "Enter batch number (e.g. #12345)", "vaccineBatch8", false, false)}
            </>
          );
        case "9": // Prescription Justification Letter
          return (
            <>
              {createInput("Medication Requested", "Enter medication requested (e.g. Methotrexate)", "medicationRequested9", true)}
              {createInput("Diagnosis for Prescription", "Enter diagnosis (e.g. moderate-to-severe rheumatoid arthritis)", "diagnosisBeingTreated9")}
              {createInput("Justification for Medication", "Enter justification (e.g. Methotrexate is a foundational therapy in rheumatoid arthritis management and has strong evidence supporting its efficacy)", "justificationForUse9")}
              {createInput("Alternatives Considered", "Enter alternatives (e.g. leflunomide)", "alternativesConsidered9", false, false)}
              {createInput("Duration and Dosage of Prescription", "Enter dosage details (e.g. Take 15mg pill once each week as long as treatment remains effective)", "durationDosage9", false, false)}
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
        onPress={() => {
          if (allFieldsFilled) {
            alert('Generate clicked!');
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
  function getRequiredKeys(index) { //Checks if all the required fields are filled out
    const keysMap = {
      "1": ["deniedTreatment1", "patientCondition1", "previousTreatments1", "reasonForAppeal1"],
      "2": ["patientDiagnosis2", "requestedTreatment2", "rationaleForTreatment2"],
      "3": ["patientConditionName3", "instructions3"],
      "4": ["startDateOfLeave4", "endDateOfLeave4", "reasonForMedicalLeave4"],
      "5": ["reasonForReferral5", "relevantMedicalHistory5", "servicesRequested5"],
      "6": ["patientCondition6", "requestedAccommodation6", "medicalJustificationForAccommodation6"],
      "7": ["returnDate7", "patientStatusCondition7", "restrictionsOrLimitations7"],
      "8": ["vaccineType8", "vaccinationDates8"],
      "9": ["medicationRequested9", "diagnosisBeingTreated9", "justificationForUse9"],
    };

    return keysMap[index] || [];
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
        width: 350, // Set the width of the image
        height: 100, // Set the height of the image
        marginTop: 20, 
        resizeMode: 'stretch', //Allow image to ignore its aspect ratio
        marginBottom: 30,
      },
      text:{
        fontFamily: 'QuicksandMedium',
        paddingHorizontal: 30,
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5,
        color: theme.text,
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
        minWidth: 150, // Set a minimum width to ensure button is wide enough
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
        width: 1000, // Allow the button to adjust its width based on content
        minWidth: 150, // Set a minimum width to ensure button is wide enough
        flexDirection: 'row', // Align text horizontally
        textAlign: 'center', // Ensure text is centered
      },
      buttonText: {
        color: theme.buttonText, // White text color
        fontSize: 18,
        fontFamily: 'QuicksandMedium',
      },
      scrollView: {
        flex: 1,
        padding: 10,
      },
    })
  }
  }