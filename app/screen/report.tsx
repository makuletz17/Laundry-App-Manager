import { number_format } from "@/src/common";
import {
  getToCollect,
  getTodayIncome,
  getTotalIncome,
  getUnclaimedTotal,
} from "@/src/component/useDatabase";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ReportScreen() {
  const [todayIncome, setTodayIncome] = useState(0);
  const [amountToCollect, setAmountToCollect] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [unclaimedTotal, setUnclaimedTotal] = useState<number>(0);

  useEffect(() => {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfToday = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    const loadData = async () => {
      const incomeRes = await getTotalIncome();
      const todayRes = await getTodayIncome(startOfToday, endOfToday);
      const collectRes = await getToCollect();
      const unclaimedRes = await getUnclaimedTotal();

      setTotalIncome(incomeRes);
      setTodayIncome(todayRes);
      setAmountToCollect(collectRes);
      setUnclaimedTotal(unclaimedRes);
    };
    loadData();
  }, []);

  const cashFlow = totalIncome - totalExpense;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.label}>Today’s Income</Text>
          <Text style={styles.amount}>₱ {number_format(todayIncome)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Amount to Collect</Text>
          <Text style={styles.amount}>₱ {number_format(amountToCollect)}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Unclaimed</Text>
          <Text style={styles.amount}>₱ {number_format(unclaimedTotal)}</Text>
        </View>
      </View>
      <View style={styles.cardWide}>
        <Text style={styles.label}>Cash Flow</Text>
        <Text style={styles.amount}>₱ {number_format(cashFlow)}</Text>
        <Text style={styles.subtext}>
          Income: ₱ {number_format(totalIncome)} | Expense: ₱{" "}
          {number_format(totalExpense)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  cardWide: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtext: {
    marginTop: 6,
    fontSize: 12,
    color: "#94a3b8",
  },
});
