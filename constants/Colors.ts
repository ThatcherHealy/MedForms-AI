/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#333333',            // Dark grey text for better readability
    lightText: '#888',
    background1: '#FFFFFF',     // White background for a clean look
    background2: '#F7F7F7',     // Very light grey for subtle contrast
    highlight: '#81C784',       // Soft Green
    icon: '#121212',            
    button: '#81C784',      
    border: '#121212',    
    inactiveButton: '#d3d3d3',
    buttonText: 'white',
    modeSwapperActive: '#4CAF50',
  },
  dark: {
    text: '#BDBDBD',            // Medium-light grey for primary text
    lightText: '#757575',       // Subtle grey for secondary text (placeholder, etc.)
    background1: '#121212',     // Very dark grey (close to black) for the main background
    background2: '#1E1E1E',     // Slightly lighter dark grey for secondary background
    highlight: '#81C784',       // Soft Green
    icon: '#F7F7F7',            // White
    button: '#81C784', 
    border: '#757575',  
    inactiveButton: '#2A2A2A',
    buttonText: 'black',
    modeSwapperActive: 'green',
  },
};
