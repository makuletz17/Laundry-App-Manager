import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import BottomSheetWrapper from "./component/BottomSheetWrapper";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  customerId: string;
  name: string;
  contact: string;
  onSave: (updated: { name: string; contact: string }) => void;
}

export default function EditCustomerModal({
  visible,
  onDismiss,
  customerId,
  name,
  contact,
  onSave,
}: Props) {
  const [newName, setNewName] = useState(name);
  const [newContact, setNewContact] = useState(contact);
  const inputRef = useRef<TextInput>(null);

  // Sync fields and control modal open/close
  useEffect(() => {
    setNewName(name);
    setNewContact(contact);
  }, [name, contact]);

  return (
    <BottomSheetWrapper
      visible={visible}
      onDismiss={onDismiss}
      snapPoints={["30", "75"]}>
      <Text style={styles.title}>Edit Customer</Text>

      <TextInput
        ref={inputRef}
        placeholder="Name"
        placeholderTextColor="#9CA3AF"
        value={newName}
        onChangeText={setNewName}
        style={styles.input}
      />
      <TextInput
        placeholder="Contact"
        value={newContact}
        onChangeText={setNewContact}
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <View style={styles.buttons}>
        <Pressable onPress={onDismiss} style={[styles.button, styles.cancel]}>
          <Text>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (!newName.trim()) return;
            onSave({ name: newName.trim(), contact: newContact.trim() });
          }}
          style={[styles.button, styles.save]}>
          <Text style={{ color: "white" }}>Save</Text>
        </Pressable>
      </View>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
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
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancel: {
    backgroundColor: "#eee",
  },
  save: {
    backgroundColor: "#1976D2",
  },
});
