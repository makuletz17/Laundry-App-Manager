import {
  getDashboardCounts,
  getTodayCustomers,
  getUnclaimedServiceCountByCustomerId,
} from "@/src/component/useDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Dashboard({ info }: { info: any }) {
  const router = useRouter();
  const [counts, setCounts] = useState({
    customersToday: 0,
    pending: 0,
    finished: 0,
    unpaid: 0,
    paid: 0,
    claimed: 0,
    unclaimed: 0,
  });
  const [showTodayCustomers, setShowTodayCustomers] = useState(false);
  const [todayCustomersList, setTodayCustomersList] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      const [counts, todayCustomers] = await Promise.all([
        getDashboardCounts(),
        getTodayCustomers(),
      ]);

      setCounts(counts);
      setTodayCustomersList(todayCustomers);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const ViewTodayCustomers = ({ customers }: { customers: any[] }) => {
    const [unclaimedCounts, setUnclaimedCounts] = useState<{
      [key: string]: number;
    }>({});

    useEffect(() => {
      const loadCounts = async () => {
        const counts: { [key: string]: number } = {};
        for (const c of customers) {
          const count = await getUnclaimedServiceCountByCustomerId(c.id);
          counts[c.id] = count;
        }
        setUnclaimedCounts(counts);
      };
      loadCounts();
    }, [customers]);

    return (
      <View style={{ marginTop: 12, width: "100%" }}>
        {customers.length > 0 ? (
          customers.map((c, index) => (
            <Pressable
              key={index}
              onPress={() => {
                router.push({
                  pathname: "/screen/customer-details",
                  params: {
                    id: c.id,
                    name: c.name,
                    contact: c.contact,
                    screen: "dashboard",
                  },
                });
              }}
              style={{
                backgroundColor: "#F8F8F8",
                padding: 12,
                borderRadius: 8,
                marginBottom: 5,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <View>
                  <Text style={{ fontWeight: "bold" }}>{c.name}</Text>
                  <Text>{c.contact}</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {unclaimedCounts[c.id] ?? "-"}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={{ color: "#888" }}>No customers today.</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Dashboard",
          headerRight: () => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/common/add-customer",
                  params: { from: "dashboard" },
                })
              }
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.6 : 1,
                  marginRight: 15,
                },
              ]}>
              <MaterialIcons name="person-add" size={28} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to {info.business}!</Text>

        <View
          style={[
            styles.card,
            showTodayCustomers && { alignItems: "flex-start" },
          ]}>
          <Pressable
            onPress={() => {
              setShowTodayCustomers((prev) => !prev);
              loadDashboardData();
            }}
            style={{
              width: "100%",
              alignItems: "center",
            }}>
            <MaterialIcons name="people" size={30} color="#447D9B" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Today Customer</Text>
              <Text style={styles.cardValue}>{counts.customersToday}</Text>
            </View>
            {showTodayCustomers && (
              <ViewTodayCustomers customers={todayCustomersList} />
            )}
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <MaterialIcons
              name="local-laundry-service"
              size={24}
              color="#447D9B"
            />
            <Text style={styles.cardTitle}>Pending Laundry</Text>
            <Text style={styles.cardValue}>{counts.pending}</Text>
          </View>
          <View style={styles.cardSmall}>
            <MaterialIcons name="done-all" size={24} color="#447D9B" />
            <Text style={styles.cardTitle}>Completed Laundry</Text>
            <Text style={styles.cardValue}>{counts.finished}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <MaterialIcons name="money-off" size={24} color="#447D9B" />
            <Text style={styles.cardTitle}>Unpaid Laundry</Text>
            <Text style={styles.cardValue}>{counts.unpaid}</Text>
          </View>
          <View style={styles.cardSmall}>
            <MaterialIcons name="payment" size={24} color="#447D9B" />
            <Text style={styles.cardTitle}>Paid Laundry</Text>
            <Text style={styles.cardValue}>{counts.paid}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <MaterialIcons
              name="assignment-returned"
              size={24}
              color="#447D9B"
            />
            <Text style={styles.cardTitle}>Claim Laundry</Text>
            <Text style={styles.cardValue}>{counts.claimed}</Text>
          </View>
          <View style={styles.cardSmall}>
            <MaterialIcons name="assignment-late" size={24} color="#447D9B" />
            <Text style={styles.cardTitle}>Unclaimed Laundry</Text>
            <Text style={styles.cardValue}>{counts.unclaimed}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    margin: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 24,
    color: "#447D9B",
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
});
