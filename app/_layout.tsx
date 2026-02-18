import React from "react";
import { Stack } from "expo-router";

import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/src/redux/store";

import { ConvexProvider, ConvexReactClient } from "convex/react";

import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

import AuthSync from "@/src/components/AuthSync";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.log("SecureStore getToken error:", err);
      return null;
    }
  },

  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.log("SecureStore saveToken error:", err);
    }
  },

  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.log("SecureStore clearToken error:", err);
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <ConvexProvider client={convex}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AuthSync />
              <Stack screenOptions={{ headerShown: false }} />
            </PersistGate>
          </Provider>
        </ConvexProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
