import { number_format } from "@/src/common";
import { getCustomersWithUnpaidTotal } from "@/src/component/useDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";

type Customer = {
  id: string;
  name: string;
  contact: string;
  unpaidTotal?: number;
};

export default function Customer() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const customerData = await getCustomersWithUnpaidTotal();
        if (customerData) {
          setCustomers(customerData);
        }
        setLoading(false);
      };
      setSearch("");
      load();
    }, [])
  );

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Customers",
          headerRight: () => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/common/add-customer",
                  params: { from: "customer" }, // Or 'dashboard'
                })
              }
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.6 : 1,
                marginRight: 15,
              })}>
              <MaterialIcons name="person-add" size={28} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} />
          <TextInput
            placeholder="Search Customers"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Customer List */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#63C8FF"
            style={{ marginTop: 40 }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Pressable
                  key={customer.id}
                  onPress={() =>
                    router.push({
                      pathname: "/screen/customer-details",
                      params: {
                        name: customer.name,
                        contact: customer.contact,
                        id: customer.id,
                        screen: "customer",
                      },
                    })
                  }
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                      backgroundColor: pressed ? "#ccc" : "#FFFFFF",
                    },
                    styles.card, // static styles last so they override if needed
                  ]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardTitle}>{customer.name}</Text>
                      <Text style={styles.cardSubtitle}>
                        {customer.contact}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      {customer.unpaidTotal !== undefined &&
                        customer.unpaidTotal > 0 && (
                          <Text style={styles.amountToCollect}>
                            ₱ {number_format(customer.unpaidTotal)}
                          </Text>
                        )}
                    </View>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: "#273F4F" }}>
                No customers found.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 5,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  detailsButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#447D9B",
    borderRadius: 6,
  },
  detailsText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  amountToCollect: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    fontWeight: "bold",
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    overflow: "hidden",
  },
});
