import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.5}
    pressBehavior="close"
    style={{ backgroundColor: "transparent" }}>
    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
  </BottomSheetBackdrop>
);

export const number_format = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const computeGross = (
  price: number,
  weight: number,
  load: number,
  minWeight: number,
  addonsTotal: number
): number => {
  let basePrice = 0;
  if (load === 1) {
    if (weight <= minWeight) basePrice = price * load;
    else basePrice = Math.ceil(price / 100) * 100;
  } else {
    basePrice = price * load;
  }
  return basePrice + addonsTotal;
};
