import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PaginationDots from "../common/paginationDot";

export default function WeightUnit() {
  const router = useRouter();

  const handleSelect = async (unit: string) => {
    await SecureStore.setItemAsync("weightUnit", unit);
    router.replace("/");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <PaginationDots currentStep={3} />
        <View style={styles.content}>
          <Text style={styles.title}>Select Weight Unit</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSelect("kg")}>
            <Text style={styles.buttonText}>Kilograms (kg)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSelect("lbs")}>
            <Text style={styles.buttonText}>Pounds (lbs)</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a0e9f7",
    padding: 20,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007aff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
