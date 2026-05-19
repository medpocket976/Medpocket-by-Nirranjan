import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="drug-guide/index" options={{ headerShown: false }} />
      <Stack.Screen name="drug-guide/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="emergency/index" options={{ headerShown: false }} />
      <Stack.Screen name="emergency/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="lab-values/index" options={{ headerShown: false }} />
      <Stack.Screen name="calculators/index" options={{ headerShown: false }} />
      <Stack.Screen name="calculators/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="clinical-exam/index" options={{ headerShown: false }} />
      <Stack.Screen name="clinical-exam/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="notes/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="quiz/[subject]" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
