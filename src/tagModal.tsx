import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Divider } from "react-native-paper";
import BottomSheetWrapper from "./component/BottomSheetWrapper";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  selectedService: any;
  onUpdateTag: (service: any, updates: any) => void;
};

export default function TagModalAction({
  visible,
  onDismiss,
  selectedService,
  onUpdateTag,
}: Props) {
  if (!selectedService) return null;

  const options = [];

  if (!selectedService.isFinished) {
    options.push({ label: "Mark as Finished", update: { isFinished: true } });
    if (!selectedService.isPaid)
      options.push({ label: "Mark as Paid", update: { isPaid: true } });
  } else {
    if (!selectedService.isPaid)
      options.push({ label: "Mark as Paid", update: { isPaid: true } });
    if (!selectedService.isClaimed)
      options.push({ label: "Mark as Claimed", update: { isClaimed: true } });
  }

  return (
    <BottomSheetWrapper visible={visible} onDismiss={onDismiss}>
      <Text style={styles.title}>Update Status</Text>
      <Divider style={styles.divider} />

      <View style={styles.buttonGroup}>
        {options.map((opt, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              onUpdateTag(selectedService, opt.update);
              onDismiss();
            }}>
            <Text style={styles.buttonText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.cancelBtn,
          pressed && { opacity: 0.7 },
        ]}>
        <Text style={styles.cancelText}>Close</Text>
      </Pressable>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
    color: "#0f172a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonPressed: {
    backgroundColor: "#e2e8f0",
  },
  buttonText: {
    fontSize: 16,
    color: "#1e3a8a",
    fontWeight: "500",
    textAlign: "center",
  },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b91c1c",
    textAlign: "center",
  },
});
