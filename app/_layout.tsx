import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
  <>
    <Stack>
        <Stack.Screen name="index" options={{headerShown: false, title:"home"}} />
        <Stack.Screen name="RegisterScreen" options={{headerShown: false, title:"Register"}} />
        <Stack.Screen name="login" options={{headerShown: false, title:"Login"}} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
    </Stack>
    <StatusBar style="light" />
  </>
);
}
