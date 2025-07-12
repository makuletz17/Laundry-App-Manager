import { StyleSheet, View } from "react-native";

export default function PaginationDots({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <View style={styles.pagination}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.dot,
            step === currentStep ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#007aff",
  },
  inactiveDot: {
    backgroundColor: "#ffffff88",
  },
});
