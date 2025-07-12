import { number_format } from "@/src/common";
import {
  getLaundryStatusReport,
  getWeightUnit,
  Service,
} from "@/src/component/useDatabase";
import { getStatusLabel, getStatusStyle } from "@/src/getStatusLabel";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function isWithinRange(date: string, from: string, to: string) {
  if (!from && !to) return true;
  const d = new Date(date).setHours(0, 0, 0, 0);
  const fromD = from ? new Date(from).setHours(0, 0, 0, 0) : undefined;
  const toD = to ? new Date(to).setHours(0, 0, 0, 0) : undefined;
  if (fromD && d < fromD) return false;
  if (toD && d > toD) return false;
  return true;
}

export default function LaundryStatus() {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 86400000).toISOString() // 1 day ago
  );
  const [toDate, setToDate] = useState(new Date().toISOString());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [weightUnit, setWeightUnit] = useState("kg");

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const storedServices = await getLaundryStatusReport();
          setServices(storedServices);

          const unit = await getWeightUnit();
          if (unit) {
            setWeightUnit(unit);
          }
        } catch (error) {
          console.error("Failed to load services:", error);
        }
      };
      loadData();
    }, [])
  );

  const filterByStatus = (): Service[] => {
    let filtered = services;
    switch (selectedStatus) {
      case "Pending":
        filtered = filtered.filter((s) => !s.isFinished);
        break;
      case "Finished":
        filtered = filtered.filter((s) => s.isFinished);
        break;
      case "Paid":
        filtered = filtered.filter((s) => s.isPaid);
        break;
      case "Unpaid":
        filtered = filtered.filter((s) => !s.isPaid);
        break;
      case "Claimed":
        filtered = filtered.filter((s) => s.isClaimed);
        break;
      case "Unclaimed":
        filtered = filtered.filter((s) => s.isFinished && !s.isClaimed);
        break;
    }
    filtered = filtered.filter((s) =>
      isWithinRange(s.createdAt, fromDate, toDate)
    );
    return filtered;
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Left Section */}
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.serviceType}</Text>
          <Text style={styles.cardWeight}>
            Weight: {item.weight} {weightUnit}
          </Text>
          <Text style={styles.cardDate}>
            Date: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>

        {/* Right Section */}
        <View style={styles.cardRight}>
          {selectedStatus === "All" && (
            <View style={[styles.statusBadge, getStatusStyle(item)]}>
              <Text style={styles.statusText}>{getStatusLabel(item)}</Text>
            </View>
          )}
          <Text style={styles.cardAmount}>₱ {number_format(item.gross)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>Status</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            style={[
              styles.picker,
              Platform.OS === "ios" ? styles.pickerIOS : styles.pickerAndroid,
            ]}
            itemStyle={styles.pickerItem}>
            {[
              "All",
              "Pending",
              "Finished",
              "Paid",
              "Unpaid",
              "Claimed",
              "Unclaimed",
            ].map((status) => (
              <Picker.Item label={status} value={status} key={status} />
            ))}
          </Picker>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>From</Text>
            <Pressable
              onPress={() => setShowFromPicker(true)}
              style={styles.dateInput}>
              <Text>
                {fromDate
                  ? new Date(fromDate).toLocaleDateString()
                  : "Select date"}
              </Text>
            </Pressable>
            {showFromPicker && (
              <DateTimePicker
                value={fromDate ? new Date(fromDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowFromPicker(false);
                  if (selectedDate) {
                    setFromDate(selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>To</Text>
            <Pressable
              onPress={() => setShowToPicker(true)}
              style={styles.dateInput}>
              <Text>
                {toDate ? new Date(toDate).toLocaleDateString() : "Select date"}
              </Text>
            </Pressable>
            {showToPicker && (
              <DateTimePicker
                value={toDate ? new Date(toDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowToPicker(false);
                  if (selectedDate) {
                    setToDate(selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>
        </View>
      </View>
      <FlatList
        data={filterByStatus()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No records found.</Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  filterBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterLabel: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  picker: {
    width: "100%",
    color: "#0f172a",
  },
  pickerIOS: {
    height: 60,
  },
  pickerAndroid: {
    height: 50,
  },
  pickerItem: {
    fontSize: 16,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    fontSize: 15,
    color: "#0f172a",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardWeight: {
    fontSize: 14,
    color: "#334155",
    marginTop: 2,
  },
  cardDate: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 32,
  },
  listContent: {
    paddingBottom: 32,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
});
