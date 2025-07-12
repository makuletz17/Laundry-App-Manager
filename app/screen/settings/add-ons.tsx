import {
  deleteAddOn,
  getAllAddOns,
  insertAddOn,
} from "@/src/component/useDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ActivityIndicator, Snackbar } from "react-native-paper";

type AddOn = {
  id: string;
  name: string;
  price: number;
};

export default function AddOnScreen() {
  const router = useRouter();
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAddOnId, setSelectedAddOnId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const InputNameRef = useRef<TextInput>(null);
  const InputPriceRef = useRef<TextInput>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  useEffect(() => {
    const loadAddOns = async () => {
      try {
        const data = await getAllAddOns();
        setAddons(data);
      } catch (error) {
        console.error("Failed to load add-ons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAddOns();
  }, []);

  const reloadAddOns = async () => {
    const data = await getAllAddOns();
    setAddons(data);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("Add-on name is required.");
      return;
    }
    if (!price || isNaN(Number(price))) {
      Alert.alert("Price must be a number.");
      return;
    }
    try {
      await insertAddOn(name, parseFloat(price));
      setSnackbarMsg("Add-on added successfully!");
      await reloadAddOns();
      setName("");
      setPrice("");
      InputNameRef.current?.focus();
    } catch (err: any) {
      setSnackbarMsg(err.message || "Failed to add add-on.");
    } finally {
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Ons",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/screen/settings")}
              style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} />
            </Pressable>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Add-on Name</Text>
          <TextInput
            ref={InputNameRef}
            placeholder="e.g. Fabric Softener"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            onSubmitEditing={() => InputPriceRef.current?.focus()}
          />
          <Text style={styles.label}>Price (₱)</Text>
          <TextInput
            ref={InputPriceRef}
            placeholder="e.g. 20"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <Pressable style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>Add Add-on</Text>
          </Pressable>
        </View>

        <Text style={styles.listTitle}>Saved Add-ons</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={addons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onLongPress={() => {
                  setSelectedAddOnId(item.id);
                  setShowDeleteModal(true);
                }}
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && { backgroundColor: "#f1f5f9" },
                ]}>
                <Text style={styles.addonName}>{item.name}</Text>
                <Text style={styles.addonPrice}>₱ {item.price.toFixed(2)}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  marginTop: 16,
                }}>
                No add-ons added yet.
              </Text>
            }
          />
        )}

        {showDeleteModal && (
          <View style={StyleSheet.absoluteFillObject}>
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Delete Add-on</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to delete this add-on?
                </Text>
                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowDeleteModal(false);
                      setSelectedAddOnId(null);
                    }}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={async () => {
                      if (selectedAddOnId) {
                        await deleteAddOn(selectedAddOnId);
                        await reloadAddOns();
                      }
                      setShowDeleteModal(false);
                      setSelectedAddOnId(null);
                    }}>
                    <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarMsg.includes("already")
            ? "#DC2626" // red
            : "#16A34A", // green
          marginBottom: 25,
          marginHorizontal: 16,
          borderRadius: 8,
        }}>
        {snackbarMsg}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8fafc",
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  label: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    color: "#0f172a",
  },
  button: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addonName: {
    fontSize: 15,
    color: "#1e293b",
  },
  addonPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#16a34a",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  modalButtonText: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
});
