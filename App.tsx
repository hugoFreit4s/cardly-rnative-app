import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/auth/AuthContext';
import { GoogleAuthConfigProvider } from './src/auth/GoogleAuthConfigContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import './global.css';

function ThemedApp() {
  const { scheme, colors } = useTheme();
  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaProvider>
        <GoogleAuthConfigProvider>
          <AuthProvider>
            <NavigationContainer
              documentTitle={{
                formatter: (options, route) => options?.title ?? route?.name ?? 'Cardly',
              }}
            >
              <RootNavigator />
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            </NavigationContainer>
            <Toast />
          </AuthProvider>
        </GoogleAuthConfigProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
