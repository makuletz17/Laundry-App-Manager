import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { renderBackdrop } from "../common";

type BottomSheetWrapperProps = {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
};

export default function BottomSheetWrapper({
  visible,
  onDismiss,
  children,
  snapPoints = ["70%", "90%"],
  enablePanDownToClose = true,
}: BottomSheetWrapperProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={{ backgroundColor: "#9CA3AF" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}>
        <BottomSheetView style={styles.sheet}>{children}</BottomSheetView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 16,
    flex: 1,
  },
});
