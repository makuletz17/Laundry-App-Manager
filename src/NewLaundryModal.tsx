import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Button, Divider, Text } from "react-native-paper";
import uuid from "react-native-uuid";
import { computeGross, number_format } from "./common";
import BottomSheetWrapper from "./component/BottomSheetWrapper";
import {
  getAllAddOns,
  getServiceTypes,
  getWeightUnit,
  newCustomerService,
  ServiceType,
} from "./component/useDatabase";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  customerId: string;
  onSaveSuccess: (message?: string) => void;
};

export default function NewLaundryModal({
  visible,
  onDismiss,
  customerId,
  onSaveSuccess,
}: Props) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [addons, setAddons] = useState<
    { id: string; name: string; price: number }[]
  >([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]); // array of addon ids or names
  const [addonItems, setAddonItems] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState("");
  const [weight, setWeight] = useState("");
  const [instructions, setInstructions] = useState("");
  const [load, setLoad] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [showServiceSheet, setShowServiceSheet] = useState(false);
  const [showAddonSheet, setShowAddonSheet] = useState(false);
  const [selectedServiceLabel, setSelectedServiceLabel] = useState<
    string | null
  >(null);
  const [selectedAddOnLabel, setSelectedAddOnLabel] = useState<any[]>([]);
  const weightInputRef = useRef<TextInput>(null);
  const loadInputRef = useRef<TextInput>(null);
  const instructionsInputRef = useRef<TextInput>(null);

  // 🟡 Fetch configs on focus
  useFocusEffect(
    useCallback(() => {
      const fetchWeightUnit = async () => {
        const unit = await getWeightUnit();
        setWeightUnit(unit);
      };

      const fetchServicesAndAddons = async () => {
        const storeServiceTypes = await getServiceTypes(); // make sure this is async
        setServiceTypes(storeServiceTypes);
        setServiceType("");

        const storedAddons = await getAllAddOns();
        setAddons(storedAddons);
      };

      fetchServicesAndAddons();
      fetchWeightUnit();
    }, [])
  );

  // 🟡 Convert serviceTypes to dropdown format
  useEffect(() => {
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

  const saveService = async () => {
    const selected = serviceTypes.find((s) => s.name === serviceType);
    if (!selected) return alert("Selected service type not found.");
    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)
      return alert("Please enter a valid weight.");
    if (!load || isNaN(parseFloat(load)) || parseFloat(load) <= 0)
      return alert("Please enter a valid load.");
    if (!serviceType) return alert("Please select a service type.");
    if (!selected.price || isNaN(selected.price))
      return alert("Please set a valid price for the service type.");

    try {
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

      await newCustomerService({
        id: serviceId,
        customerId,
        serviceType,
        weight: weightNum,
        load: loadNum,
        instructions,
        addons: JSON.stringify(selectedAddons),
        gross,
        createdAt,
      });

      onSaveSuccess(`"${serviceType}" added successfully!`);
      cleanInput();
      onDismiss();
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        alert(err.message);
      } else {
        console.error("Unexpected error:", err);
        alert("An error occurred while saving. Please try again.");
      }
      return;
    }
  };

  const cleanInput = () => {
    setServiceType("");
    setWeight("");
    setInstructions("");
    setLoad("");
    setSelectedAddons([]);
  };

  return (
    <BottomSheetWrapper visible={visible} onDismiss={onDismiss}>
      <Text variant="titleLarge" style={styles.title}>
        New Laundry Service
      </Text>
      <Divider style={styles.divider} />
      <Text variant="labelLarge" style={styles.label}>
        Service Details
      </Text>
      <Pressable style={styles.input} onPress={() => setShowServiceSheet(true)}>
        <Text style={{ color: serviceType ? "#0f172a" : "#9CA3AF" }}>
          {selectedServiceLabel || "Select Service Type"}
        </Text>
      </Pressable>

      <BottomSheetWrapper
        visible={showServiceSheet}
        snapPoints={["30", "75"]}
        onDismiss={() => setShowServiceSheet(false)}>
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
            const isSelected = serviceType === item.value;
            return (
              <Pressable
                onPress={() => {
                  setServiceType(item.value);
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
        placeholder={`Weight (${weightUnit})`}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => loadInputRef.current?.focus()}
      />
      <TextInput
        ref={loadInputRef}
        placeholder="Load"
        value={load}
        onChangeText={setLoad}
        placeholderTextColor="#9CA3AF"
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
                    setSelectedAddOnLabel((prev) => [...prev, item.label]);
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
        placeholderTextColor="#9CA3AF"
        placeholder="Special Instructions"
        value={instructions}
        onChangeText={setInstructions}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[styles.input, styles.instructionsInput]}
        returnKeyType="done"
      />
      <Button
        mode="contained"
        onPress={saveService}
        style={[
          styles.saveButton,
          !serviceType || !weight ? styles.disabledButton : {},
        ]}
        contentStyle={styles.buttonContent}
        disabled={!serviceType || !weight}
        labelStyle={styles.buttonLabel}>
        Save
      </Button>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 16,
    flex: 1,
  },
  instructionsInput: {
    height: 100,
  },
  title: {
    marginBottom: 8,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  divider: {
    marginBottom: 18,
    backgroundColor: "#e2e8f0",
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155",
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
  saveButton: {
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    elevation: 3,
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#0f172a",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 8,
  },
  doneButton: {
    fontSize: 18,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
