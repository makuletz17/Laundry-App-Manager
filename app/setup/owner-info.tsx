import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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

export default function OwnerInfo() {
  const params = useLocalSearchParams();
  const businessName = params.businessName;

  const router = useRouter();
  const [shopAddress, setShopAddress] = useState("");
  const [contact, setContact] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const contactInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const ownerInputRef = useRef<TextInput>(null);

  const handleNext = async () => {
    await SecureStore.setItemAsync("ownerName", ownerName);
    await SecureStore.setItemAsync("contact", contact);
    await SecureStore.setItemAsync("shopAddress", shopAddress);
    router.push("/setup/weight-unit");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <PaginationDots currentStep={2} />

        <View style={styles.content}>
          <Text style={styles.shopName}>{businessName}</Text>
          <Text style={styles.title}>Owner & Business Info</Text>

          <TextInput
            ref={addressInputRef}
            placeholder="Shop Address"
            placeholderTextColor="#ccc"
            value={shopAddress}
            onChangeText={setShopAddress}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => contactInputRef.current?.focus()}
          />
          <TextInput
            ref={contactInputRef}
            placeholder="Shop Contact No."
            placeholderTextColor="#ccc"
            value={contact}
            onChangeText={setContact}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => ownerInputRef.current?.focus()}
          />
          <TextInput
            ref={ownerInputRef}
            placeholder="Owner Name"
            placeholderTextColor="#ccc"
            value={ownerName}
            onChangeText={setOwnerName}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            !(ownerName && shopAddress && contact) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!(ownerName && shopAddress && contact)}>
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
  content: {
    flex: 1,
    justifyContent: "center",
  },
  shopName: {
    fontSize: 30,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
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
    marginBottom: 16,
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
});
