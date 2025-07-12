import { computeGross, number_format } from "@/src/common";
import BottomSheetWrapper from "@/src/component/BottomSheetWrapper";
import {
  getAllAddOns,
  getServiceTypes,
  newCustomer,
  newCustomerService,
  ServiceType,
} from "@/src/component/useDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Divider, Snackbar } from "react-native-paper";
import uuid from "react-native-uuid";

export default function AddCustomerScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [addons, setAddons] = useState<
    { id: string; name: string; price: number }[]
  >([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]); // array of addon ids or names
  const [addonItems, setAddonItems] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [instructions, setInstructions] = useState("");
  const [load, setLoad] = useState("");
  const [gross, setGross] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const contactInputRef = useRef<TextInput>(null);
  const weightInputRef = useRef<TextInput>(null);
  const loadInputRef = useRef<TextInput>(null);
  const instructionsInputRef = useRef<TextInput>(null);
  const [showNoServiceModal, setShowNoServiceModal] = useState(false);
  const [showServiceSheet, setShowServiceSheet] = useState(false);
  const [showAddonSheet, setShowAddonSheet] = useState(false);
  const [selectedServiceLabel, setSelectedServiceLabel] = useState<
    string | null
  >(null);
  const [selectedAddOnLabel, setSelectedAddOnLabel] = useState<any[]>([]);
  const { from } = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      const fetchServicesAndAddons = async () => {
        const storedServices = await getServiceTypes();
        if (!storedServices) {
          alertIt();
          return;
        }
        setServiceTypes(storedServices);

        const storedAddons = await getAllAddOns();
        setAddons(storedAddons);
      };
      fetchServicesAndAddons();
    }, [])
  );

  // 🧠 Update items when serviceTypes change
  React.useEffect(() => {
    const mappedServices = serviceTypes.map((s) => ({
      label: `${s.name} - ₱${number_format(s.price)}/kg (Min: ${
        s.minWeight
      }kg)`,
      value: s.name,
    }));
    const mappedAddOns = addons.map((a) => ({
      label: `${a.name} - ₱${number_format(a.price)}`,
      value: a.id, // or use a.name if no id
    }));
    setItems(mappedServices);
    setAddonItems(mappedAddOns);
  }, [serviceTypes, addons]);

  // 💰 Recalculate amount
  React.useEffect(() => {
    const selected = serviceTypes.find((s) => s.name === selectedService);
    const weightNum = parseFloat(weight);
    const loadNum = parseFloat(load);

    const selectedAddonObjs = addons.filter((a) =>
      selectedAddons.includes(a.id)
    );
    const addonsTotal = selectedAddonObjs.reduce(
      (acc, cur) => acc + cur.price,
      0
    );

    if (selected && !isNaN(weightNum) && !isNaN(loadNum)) {
      const result = computeGross(
        selected.price,
        weightNum,
        loadNum,
        selected.minWeight || 0,
        addonsTotal
      );
      setGross(result);
    } else {
      setGross(0);
    }
  }, [selectedService, weight, load, serviceTypes, selectedAddons, addons]);

  const alertIt = () => {
    setShowNoServiceModal(true);
  };

  const cleanInput = () => {
    setName("");
    setContact("");
    setSelectedService(null);
    setSelectedServiceLabel(null);
    setWeight("");
    setInstructions("");
    setLoad("");
    setSelectedAddons([]);
    setSelectedAddOnLabel([]);
    setGross(0);
    setShowServiceSheet(false);
    setShowAddonSheet(false);
  };

  const goBack = () => {
    if (from === "customer") {
      router.replace("/screen/customer");
    } else {
      router.back();
    }
  };

  const saveCustomer = async () => {
    if (!name || !contact) return alert("Please fill in all customer details.");
    if (!selectedService) return alert("Please select a service type.");
    if (!/^\d+$/.test(contact)) return alert("Contact number must be numeric.");

    const selected = serviceTypes.find((s) => s.name === selectedService);
    if (!selected) return alert("Selected service type not found.");
    if (!selected.price || isNaN(selected.price))
      return alert("Invalid kilo rate.");

    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      return alert("Please enter a valid weight.");
    }

    if (!load || isNaN(parseFloat(load)) || parseFloat(load) <= 0) {
      return alert("Please enter a valid load.");
    }
    setIsSaving(true);
    try {
      const customerId = uuid.v4() as string;
      const serviceId = uuid.v4() as string;
      const createdAt = new Date().toISOString();
      const weightNum = parseFloat(weight);
      const loadNum = parseFloat(load);

      const selectedAddonObjs = addons.filter((a) =>
        selectedAddons.includes(a.id)
      );
      const addonsTotal = selectedAddonObjs.reduce(
        (sum, cur) => sum + cur.price,
        0
      );
      const gross = computeGross(
        selected.price,
        weightNum,
        loadNum,
        selected.minWeight ?? 0,
        addonsTotal
      );
      if (isNaN(gross)) return alert("Calculation failed.");

      await newCustomer({
        id: customerId,
        name,
        contact,
        createdAt: new Date().toISOString(),
      });

      await newCustomerService({
        id: serviceId,
        customerId,
        serviceType: selectedService,
        weight: weightNum,
        load: loadNum,
        instructions,
        addons: JSON.stringify(selectedAddons),
        gross,
        createdAt,
      });

      setSnackbarMsg(`Customer "${name}" added successfully!`);
      setSnackbarVisible(true);
      cleanInput();
      nameInputRef.current?.focus();
    } catch (err: any) {
      setIsSaving(false);
      if (err.message?.includes("already exists")) {
        setSnackbarMsg(err.message);
      } else {
        console.error("Unexpected error:", err);
        setSnackbarMsg("An error occurred while saving. Please try again.");
      }
      setSnackbarVisible(true);
      nameInputRef.current?.focus();
      return;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Customer",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                goBack();
                cleanInput();
              }}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.6 : 1,
                },
                styles.backButton,
              ]}>
              <MaterialIcons name="arrow-back" size={24} />
            </Pressable>
          ),
        }}
      />
      {isSaving && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </Modal>
      )}
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        style={{ backgroundColor: "#fff" }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <TextInput
              ref={nameInputRef}
              placeholder="Customer Name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => contactInputRef.current?.focus()}
            />
            <TextInput
              ref={contactInputRef}
              placeholder="Contact Number"
              placeholderTextColor="#9CA3AF"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                setShowServiceSheet(true);
              }}
            />
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Service Details</Text>

            <Pressable
              style={styles.input}
              onPress={() => {
                Keyboard.dismiss();
                setShowServiceSheet(true);
              }}>
              <Text style={{ color: selectedService ? "#0f172a" : "#9CA3AF" }}>
                {selectedServiceLabel || "Select Service Type"}
              </Text>
            </Pressable>

            <BottomSheetWrapper
              visible={showServiceSheet}
              snapPoints={["30", "75"]}
              onDismiss={() => {
                setShowServiceSheet(false);
                weightInputRef.current?.focus();
              }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    marginBottom: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc",
                  },
                ]}>
                Select Services
              </Text>
              <BottomSheetFlatList
                data={items}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = selectedService === item.value;
                  return (
                    <Pressable
                      onPress={() => {
                        setSelectedService(item.value);
                        setSelectedServiceLabel(item.label);
                        setShowServiceSheet(false);
                        weightInputRef.current?.focus();
                      }}
                      style={{
                        paddingVertical: 14,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: "#e5e7eb",
                      }}>
                      <Text style={{ fontSize: 16 }}>{item.label}</Text>
                      {isSelected && <MaterialIcons name="check" size={18} />}
                    </Pressable>
                  );
                }}
                contentContainerStyle={{ marginBottom: 14 }}
              />
            </BottomSheetWrapper>

            <TextInput
              ref={weightInputRef}
              placeholder="Weight (kg)"
              placeholderTextColor="#9CA3AF"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => loadInputRef.current?.focus()}
            />
            <TextInput
              ref={loadInputRef}
              placeholder="Load"
              placeholderTextColor="#9CA3AF"
              value={load}
              onChangeText={setLoad}
              keyboardType="numeric"
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => {
                setShowAddonSheet(true);
                Keyboard.dismiss();
              }}
            />

            <Pressable
              style={styles.input}
              onPress={() => {
                setShowAddonSheet(true);
                Keyboard.dismiss();
              }}
              accessibilityRole="button">
              <Text
                style={{
                  color: selectedAddons.length ? "#0f172a" : "#9CA3AF",
                }}>
                {selectedAddOnLabel.length > 0
                  ? selectedAddOnLabel.join(", ")
                  : "Add Add-ons"}
              </Text>
            </Pressable>

            <BottomSheetWrapper
              visible={showAddonSheet}
              snapPoints={["30", "75"]}
              onDismiss={() => setShowAddonSheet(false)}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  marginBottom: 10,
                }}>
                <Text style={styles.sectionTitle}>Select Add-ons</Text>
                <Pressable
                  onPress={() => {
                    setShowAddonSheet(false);
                    instructionsInputRef.current?.focus();
                  }}>
                  <Text style={styles.doneButton}>Done</Text>
                </Pressable>
              </View>
              <FlatList
                data={addonItems}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = selectedAddons.includes(item.value);
                  return (
                    <Pressable
                      onPress={() => {
                        if (isSelected) {
                          // Remove both id and label
                          setSelectedAddons((prev) =>
                            prev.filter((id) => id !== item.value)
                          );
                          setSelectedAddOnLabel((prev) =>
                            prev.filter((label) => label !== item.label)
                          );
                        } else {
                          // Add both id and label
                          setSelectedAddons((prev) => [...prev, item.value]);
                          setSelectedAddOnLabel((prev) => [
                            ...prev,
                            item.label,
                          ]);
                        }
                      }}
                      style={{
                        paddingVertical: 14,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: "#e5e7eb",
                      }}>
                      <Text style={{ fontSize: 16 }}>{item.label}</Text>
                      {isSelected && <MaterialIcons name="check" size={18} />}
                    </Pressable>
                  );
                }}
              />
            </BottomSheetWrapper>
            <TextInput
              ref={instructionsInputRef}
              placeholder="Special Instructions"
              placeholderTextColor="#9CA3AF"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              returnKeyType="done"
            />
            <Text style={styles.amountText}>
              AMOUNT: ₱ {number_format(gross)}
            </Text>
            <Button
              mode="contained"
              onPress={saveCustomer}
              style={styles.button}
              contentStyle={{ paddingVertical: 8, paddingHorizontal: 15 }}
              buttonColor="#007AFF"
              labelStyle={{ fontSize: 16, fontWeight: "bold" }}>
              Save Customer
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          {
            backgroundColor:
              snackbarMsg.includes("error") || snackbarMsg.includes("exists")
                ? "#DC2626" // red for error
                : "#16A34A", // green for success
            marginBottom: 25, // padding bottom
            marginLeft: 15,
          },
        ]}>
        {snackbarMsg}
      </Snackbar>
      {showNoServiceModal && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>No Service Types Found</Text>
              <Text style={styles.modalMessage}>
                You need to add at least one service type before adding a
                customer.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowNoServiceModal(false);
                    goBack();
                  }}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.goBtn]}
                  onPress={() => {
                    setShowNoServiceModal(false);
                    router.replace("/screen/settings/services");
                  }}>
                  <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                    Go
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
  },
  backButton: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#0f172a",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 14,
  },
  button: {
    marginTop: 18,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  amountText: {
    color: "#6b7280",
    fontSize: 20,
    marginTop: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  modalMessage: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  goBtn: {
    backgroundColor: "#007AFF",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  doneButton: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
