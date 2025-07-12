import {
  clearShopConfig,
  getShopConfig,
  saveShopConfig,
} from "@/src/shopConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";

type Settings = {
  message: string;
  businessName: string;
  contact: string;
  ownerName: string;
  weightUnit: string;
  shopAddress: string;
};

const defaultSettings: Settings = {
  message: "Welcome to our shop!",
  businessName: "",
  contact: "",
  ownerName: "",
  shopAddress: "",
  weightUnit: "",
};

export default function ShopInfo() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getShopConfig();
        setSettings({
          businessName: config.businessName,
          contact: config.contact,
          ownerName: config.ownerName,
          shopAddress: config.shopAddress,
          weightUnit: config.weightUnit,
          message: config.message,
        });
      } catch (error) {
        console.error("Failed to load add-ons:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const saveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveShopConfig({
      businessName: newSettings.businessName,
      contact: newSettings.contact,
      ownerName: newSettings.ownerName,
      weightUnit: newSettings.weightUnit,
      shopAddress: newSettings.shopAddress,
      message: newSettings.message,
    });
    Alert.alert("Saved", "Settings have been saved.");
  };

  const clearAll = async () => {
    clearShopConfig();
    setSettings(defaultSettings);
    Alert.alert("Cleared", "All data has been cleared.");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Shop Info",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.replace("/screen/settings");
                setEditMode(false);
              }}
              style={{
                paddingHorizontal: 10,
                flexDirection: "row",
                alignItems: "center",
              }}>
              <MaterialIcons name="arrow-back" size={24} color="#1976D2" />
            </Pressable>
          ),
          headerRight: () =>
            !editMode ? (
              <Pressable
                onPress={() => setEditMode(true)}
                style={{ paddingHorizontal: 10 }}
                accessibilityLabel="Edit">
                <MaterialIcons name="edit" size={24} color="#1976D2" />
              </Pressable>
            ) : (
              <Pressable
                onPress={async () => {
                  await saveSettings(settings);
                  setEditMode(false);
                }}
                style={{ paddingHorizontal: 10 }}
                accessibilityLabel="Save">
                <MaterialIcons name="save" size={24} color="#1976D2" />
              </Pressable>
            ),
        }}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled">
              <View style={styles.container}>
                {/* your input cards remain the same */}
                <View style={styles.card}>
                  <Text style={styles.header}>Shop Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Shop Name"
                    placeholderTextColor="#9CA3AF"
                    value={settings.businessName}
                    editable={editMode}
                    onChangeText={(text) =>
                      setSettings((s) => ({ ...s, businessName: text }))
                    }
                  />
                  <Text style={styles.header}>Shop Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Shop Address"
                    placeholderTextColor="#9CA3AF"
                    value={settings.shopAddress}
                    editable={editMode}
                    onChangeText={(text) =>
                      setSettings((s) => ({ ...s, shopAddress: text }))
                    }
                  />
                  <Text style={styles.header}>Shop Contact</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contact"
                    placeholderTextColor="#9CA3AF"
                    value={settings.contact}
                    editable={editMode}
                    onChangeText={(text) =>
                      setSettings((s) => ({ ...s, contact: text }))
                    }
                  />
                  <Text style={styles.header}>Weight-Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Weight Unit (e.g. kg, lb)"
                    placeholderTextColor="#9CA3AF"
                    value={settings.weightUnit}
                    editable={editMode}
                    onChangeText={(text) =>
                      setSettings((s) => ({ ...s, weightUnit: text }))
                    }
                  />
                </View>
                <View style={styles.card}>
                  <Text style={styles.header}>Owner</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Owner Name"
                    placeholderTextColor="#9CA3AF"
                    value={settings.ownerName}
                    editable={editMode}
                    onChangeText={(text) =>
                      setSettings((s) => ({ ...s, ownerName: text }))
                    }
                  />
                </View>
                <View style={styles.card}>
                  <Text style={styles.header}>Message</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { height: 100, textAlignVertical: "top" },
                    ]}
                    multiline
                    numberOfLines={4}
                    placeholder="Message (e.g. Welcome to our shop!)"
                    placeholderTextColor="#9CA3AF"
                    value={settings.message}
                    editable={editMode}
                    onChangeText={(text) =>
                      setSettings((s) => ({ ...s, message: text }))
                    }
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  header: {
    fontSize: 14,
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  info: { fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: "#90CAF9",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#F7FBFC",
  },
  addonInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#E57373",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  clearButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  scrollContainer: {
    padding: 10,
    flexGrow: 1, // ensures scrollable content
    justifyContent: "flex-start",
  },
});
