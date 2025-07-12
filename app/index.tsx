import { useFocusEffect } from "@react-navigation/native"; // or from expo-router
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Dashboard from "./screen/dashboard";
import SetupWelcome from "./setup";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          const owner = await SecureStore.getItemAsync("ownerName");
          const business = await SecureStore.getItemAsync("businessName");
          const contact = await SecureStore.getItemAsync("contact");
          const unit = await SecureStore.getItemAsync("weightUnit");

          if (!isActive) return;

          if (!owner || !business || !contact || !unit) {
            setShowSetup(true);
            setInfo(null);
          } else {
            setShowSetup(false);
            setInfo({ owner, business, contact, unit });
          }
        } catch (error) {
          console.error("Error loading setup data:", error);
          setShowSetup(true);
          setInfo(null);
        } finally {
          setLoading(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }
  if (showSetup) {
    return <SetupWelcome />; // Only show setup when needed
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Dashboard info={info} />
    </>
  );
}
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
