import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PaginationDots from "../common/paginationDot";

export default function SetupWelcome() {
  const [businessName, setBusinessName] = useState("");
  const shopName = useRef<TextInput>(null);
  const router = useRouter();

  const handleNext = async () => {
    await SecureStore.setItemAsync("businessName", businessName);
    router.push({
      pathname: "/setup/owner-info",
      params: { businessName: businessName }, // You can add more params as needed
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <PaginationDots currentStep={1} />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
          </View>

          <Text style={styles.title}>Enter your shop name</Text>

          <TextInput
            ref={shopName}
            placeholder="Shop Name"
            placeholderTextColor="#ccc"
            value={businessName}
            onChangeText={setBusinessName}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !businessName.trim() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!businessName.trim()}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a0e9f7",
    padding: 20,
    justifyContent: "space-between",
  },
  iconContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#ffffffcc",
    color: "#333",
  },
  button: {
    backgroundColor: "#007aff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#88cfff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bubbles: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
});
