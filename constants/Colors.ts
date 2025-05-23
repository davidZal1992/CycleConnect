/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Colors extracted from the original ride-together-social-hub repo (tailwind.config.ts)
 * These colors match the shadcn-ui and Tailwind CSS styling
 */

// Primary colors
const bikeBlue = '#3498DB';
const bikeGreen = '#2ECC71';
const bikeOrange = '#F39C12';

// Slate colors from Tailwind CSS
const slate50 = '#F8FAFC';
const slate100 = '#F1F5F9';
const slate200 = '#E2E8F0';
const slate300 = '#CBD5E1';
const slate400 = '#94A3B8';
const slate500 = '#64748B';
const slate600 = '#475569';
const slate700 = '#334155';
const slate800 = '#1E293B';
const slate900 = '#0F172A';
const slate950 = '#020617';

export const Colors = {
  light: {
    text: slate800,
    background: slate50,
    tint: bikeBlue, 
    icon: slate400,
    tabIconDefault: slate400,
    tabIconSelected: bikeBlue,
    border: slate200,
    card: '#FFFFFF',
    primary: bikeBlue,
    secondary: bikeGreen,
    accent: bikeOrange,
    muted: slate100,
    // Additional colors for forms and UI elements
    inputBg: '#FFFFFF',
    inputBorder: slate200,
    buttonHover: '#2980b9', // Darker shade of bikeBlue for hover states
    focusRing: 'rgba(52, 152, 219, 0.4)', // bikeBlue with opacity for focus
  },
  dark: {
    text: slate50,
    background: slate800,
    tint: bikeBlue,
    icon: slate400,
    tabIconDefault: slate400,
    tabIconSelected: bikeBlue,
    border: slate700,
    card: slate900,
    primary: bikeBlue,
    secondary: bikeGreen,
    accent: bikeOrange,
    muted: slate700,
    // Additional colors for forms and UI elements
    inputBg: slate900,
    inputBorder: slate700,
    buttonHover: '#2980b9', // Darker shade of bikeBlue for hover states
    focusRing: 'rgba(52, 152, 219, 0.4)', // bikeBlue with opacity for focus
  },
};
