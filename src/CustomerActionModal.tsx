import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { renderBackdrop } from "./common";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onCall: () => void;
  onMessage: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function CustomerActionModal({
  visible,
  onDismiss,
  onCall,
  onMessage,
  onEdit,
  onDelete,
}: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["35%"]}
      onClose={onDismiss}
      enablePanDownToClose
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.sheet}>
        <Button
          icon="phone"
          mode="text"
          onPress={onCall}
          style={styles.actionButton}
          labelStyle={styles.labelStyle}>
          Call
        </Button>
        <Button
          icon="message"
          mode="text"
          onPress={onMessage}
          style={styles.actionButton}
          labelStyle={styles.labelStyle}>
          Message
        </Button>
        <Button
          icon="pencil"
          mode="text"
          onPress={onEdit}
          style={styles.actionButton}
          labelStyle={styles.labelStyle}>
          Edit
        </Button>
        <Button
          icon="delete"
          mode="text"
          onPress={onDelete}
          style={[styles.actionButton, styles.deleteButton]}
          labelStyle={[styles.labelStyle, styles.deleteLabel]}>
          Delete
        </Button>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  actionButton: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  labelStyle: {
    backgroundColor: "#f8fafc",
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginLeft: 12,
    marginRight: 12,
    color: "#0f172a",
    fontWeight: "500",
    width: "87%",
    textAlign: "left",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
  },
  deleteLabel: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },
});
