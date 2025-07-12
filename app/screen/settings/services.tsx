import BottomSheetWrapper from "@/src/component/BottomSheetWrapper";
import {
  deleteServiceType,
  getServiceTypes,
  saveServiceType,
  ServiceType,
  updateServiceType,
} from "@/src/component/useDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import uuid from "react-native-uuid";

export default function ServicesScreen() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const serviceInputRef = useRef<TextInput>(null);
  const priceInputRef = useRef<TextInput>(null);
  const weightInputRef = useRef<TextInput>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const loadServiceTypes = async () => {
    try {
      const serviceTypes = await getServiceTypes();
      setServiceTypes(serviceTypes);
    } catch (error) {
      console.error("Failed to load service types", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServiceType = async () => {
    if (!name.trim()) {
      Alert.alert("Missing fields", "Please enter a service name.");
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert("Invalid price", "Please enter a valid price per kilo.");
      return;
    }

    if (
      !minWeight ||
      isNaN(parseFloat(minWeight)) ||
      parseFloat(minWeight) <= 0
    ) {
      Alert.alert(
        "Invalid minimum weight",
        "Please enter a valid minimum weight."
      );
      return;
    }

    const service: ServiceType = {
      id: editingId || uuid.v4().toString(),
      name: name.trim(),
      price: parseFloat(price),
      minWeight: parseFloat(minWeight),
    };

    try {
      if (editingId) {
        await updateServiceType(service); // 👈 now accepts 1 argument
      } else {
        await saveServiceType(service); // 👈 now accepts 1 argument
      }

      setSnackbarMsg("Add-on added successfully!");
      await loadServiceTypes();
      setVisible(false);
      setName("");
      setPrice("");
      setMinWeight("");
      setEditingId(null);
    } catch (err: any) {
      setSnackbarMsg(err.message || "Failed to add add-on.");
    } finally {
      setSnackbarVisible(true);
    }
  };

  const handleDeleteServiceType = (id: string) => {
    setPendingDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      deleteServiceType(pendingDeleteId);
      await loadServiceTypes();
    } catch (err) {
      console.error("Failed to delete service type", err);
    } finally {
      setShowConfirmModal(false);
      setPendingDeleteId(null);
      setEditingId(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadServiceTypes();
    }, [])
  );

  const renderItem = ({ item }: { item: ServiceType }) => {
    const isEditing = editingId === item.id;

    return (
      <Pressable
        onPress={() => {
          setEditingId(isEditing ? null : item.id);
        }}
        style={({ pressed }) => [
          styles.card,
          pressed && { backgroundColor: "#E5E7EB" },
          isEditing && styles.expandedCard,
        ]}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          ₱ {item.price.toFixed(2)} per kilo
        </Text>
        {item.minWeight && (
          <Text style={styles.cardSubtitle}>
            Min weight: {item.minWeight} kg
          </Text>
        )}
        {isEditing && (
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setEditingId(item.id);
                setName(item.name);
                setPrice(item.price.toString());
                setMinWeight(item.minWeight?.toString() || "");
                setVisible(true);
              }}>
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.buttonText}>Edit</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
              onPress={() => handleDeleteServiceType(item.id)}>
              <MaterialIcons name="delete" size={18} color="#fff" />
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Service Types",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/screen/settings")}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.6 : 1,
                  paddingHorizontal: 10,
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}>
              <MaterialIcons name="arrow-back" size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                setVisible(true);
                serviceInputRef.current?.focus();
              }}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 20,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.6 : 1,
                },
              ]}>
              <MaterialIcons name="add" size={24} />
            </Pressable>
          ),
        }}
      />

      <BottomSheetWrapper
        visible={visible}
        onDismiss={() => {
          setVisible(false);
          setEditingId(null);
          setName("");
          setPrice("");
          setMinWeight("");
        }}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>
            {editingId ? "Update Service" : "Add New Service"}
          </Text>
          <Pressable
            onPress={() => {
              setEditingId(null);
              setName("");
              setPrice("");
              setMinWeight("");
              setVisible(false);
            }}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.6 : 1,
              },
            ]}>
            <MaterialIcons
              name="close"
              size={24}
              color="#6B7280"
              style={{ marginBottom: 12 }}
            />
          </Pressable>
        </View>
        <Text>Service Name</Text>
        <TextInput
          ref={serviceInputRef}
          style={styles.input}
          placeholder="Service Name"
          placeholderTextColor={"#9CA3AF"}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => priceInputRef.current?.focus()}
        />
        <Text>Price per load (₱)</Text>
        <TextInput
          ref={priceInputRef}
          style={styles.input}
          placeholder="₱ 0.00"
          value={price}
          onChangeText={setPrice}
          placeholderTextColor={"#9CA3AF"}
          keyboardType="decimal-pad"
          blurOnSubmit={false}
          returnKeyType="next"
          onSubmitEditing={() => weightInputRef.current?.focus()}
        />
        <Text>Minimum kilo</Text>
        <TextInput
          ref={weightInputRef}
          style={styles.input}
          placeholderTextColor={"#9CA3AF"}
          placeholder="Minimum kilo"
          value={minWeight}
          onChangeText={setMinWeight}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={() => {
            handleSaveServiceType();
            setVisible(false);
          }}>
          <Text style={styles.saveButtonText}>
            {editingId ? "Update" : "Save Service Type"}
          </Text>
        </Pressable>
      </BottomSheetWrapper>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : (
          <FlatList
            data={serviceTypes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.empty}>No services found.</Text>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      <BottomSheetWrapper
        visible={showConfirmModal}
        onDismiss={() => {
          setShowConfirmModal(false);
          setPendingDeleteId(null);
          setEditingId(null);
        }}>
        <Text style={styles.modalTitle}>
          Are you sure you want to delete this service type?
        </Text>
        <View style={styles.modalActions}>
          <Pressable
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setShowConfirmModal(false);
              setPendingDeleteId(null);
              setEditingId(null);
            }}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.modalButton, styles.deleteButtonModal]}
            onPress={confirmDelete}>
            <Text style={[styles.modalButtonText, { color: "#fff" }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </BottomSheetWrapper>
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
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    color: "#1F2937",
    marginBottom: 20,
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
  deleteButtonModal: {
    backgroundColor: "#EF4444",
  },
  modalButtonText: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1F2937",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  expandedCard: {
    backgroundColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingVertical: 10,
    gap: 20,
    borderTopColor: "#ccc",
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 20,
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
});
