import { number_format } from "@/src/common";
import {
  getCustomerServices,
  getSavedMessage,
  getWeightUnit,
  tagService,
} from "@/src/component/useDatabase";
import CustomerActionModal from "@/src/CustomerActionModal";
import EditCustomerModal from "@/src/EditCustomerModal";
import {
  getAmountStyle,
  getStatusLabel,
  getStatusStyle,
} from "@/src/getStatusLabel";
import NewLaundryModal from "@/src/NewLaundryModal";
import TagModalAction from "@/src/tagModal";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Divider, Snackbar } from "react-native-paper";

export default function CustomerDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const customerId = params.id;
  const customerName = params.name as string;
  const customerContact = params.contact as string;
  const [services, setServices] = useState<any[]>([]);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [savedMessage, setSavedMessage] = useState("");
  const [customerAction, setCustomerAction] = useState(false);
  const [laundryVisible, setNewLaundryVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [taggingVisible, setTaggingVisible] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      const services = await getCustomerServices(String(customerId));
      const unit = await getWeightUnit();
      const message = await getSavedMessage();

      setServices(services);
      setWeightUnit(unit);
      setSavedMessage(message);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCounts = () => {
    let counts = 0;

    services.forEach(() => {
      counts += 1;
    });

    return counts;
  };

  const counts = getCounts();

  const updateTag = async (service: any, updates: any) => {
    try {
      await tagService(service.id, updates);
      const refreshed = await getCustomerServices(String(customerId));
      setServices(refreshed);
      setTaggingVisible(false);
      setSelectedServiceId(null);
    } catch (err) {
      console.error("Error updating service tag:", err);
    }
  };

  const handleCustomerEdit = async (updated: {
    name: string;
    contact: string;
  }) => {
    const customerData = SecureStore.getItem("customers");
    const parsed = customerData ? JSON.parse(customerData) : [];

    const updatedCustomers = parsed.map((c: any) =>
      String(c.id) === String(customerId) ? { ...c, ...updated } : c
    );

    SecureStore.setItem("customers", JSON.stringify(updatedCustomers));

    // Update name/contact locally
    params.name = updated.name;
    params.contact = updated.contact;

    setEditModalVisible(false);
    router.replace({
      pathname: "/screen/customer-details",
      params: {
        id: customerId as string,
        name: updated.name,
        contact: updated.contact,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header style={{ backgroundColor: "#fff" }}>
        <Appbar.BackAction onPress={() => router.replace("/screen/customer")} />
        <Appbar.Content title={customerName} />
        <Appbar.Action icon="plus" onPress={() => setNewLaundryVisible(true)} />
        <Appbar.Action icon="menu" onPress={() => setCustomerAction(true)} />
      </Appbar.Header>
      <Divider
        style={{
          height: 1,
          backgroundColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      />

      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}>
          <Text style={styles.title}>Availed Services</Text>
          <Text style={styles.title}>Total: {loading ? 0 : counts}</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#447D9B"
            style={{ marginTop: 40 }}
          />
        ) : services.length === 0 ? (
          <Text>No services found for this customer.</Text>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={services}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  if (item.isClaimed && item.isPaid) return;
                  setSelectedServiceId(item.id);
                  setSelectedService(item);
                  setTaggingVisible(true);
                }}>
                <View
                  style={[
                    styles.card,
                    selectedServiceId === item.id && {
                      backgroundColor: "#E5E7EB",
                    },
                  ]}>
                  <View style={styles.cardRow}>
                    {/* LEFT COLUMN */}
                    <View style={styles.cardContentLeft}>
                      <Text style={styles.serviceType}>{item.serviceType}</Text>
                      <Text>
                        Weight: {item.weight} {weightUnit}
                      </Text>
                      {item.addons && (
                        <Text>
                          Add-ons:{" "}
                          {(() => {
                            try {
                              const parsed = JSON.parse(item.addons);
                              if (Array.isArray(parsed) && parsed.length > 0) {
                                const matched = parsed
                                  .map((id: string) => {
                                    const match = item.addonDetails?.find(
                                      (a: any) => a.id === id
                                    );
                                    return match ? match.name : null;
                                  })
                                  .filter(Boolean);
                                return matched.join(", ");
                              }
                            } catch (e) {
                              return "Invalid";
                            }
                            return "None";
                          })()}
                        </Text>
                      )}

                      <Text>Instructions: {item.instructions}</Text>
                      <Text style={styles.statusDate}>
                        Date: {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.cardContentRight}>
                      <View style={[styles.statusBadge, getStatusStyle(item)]}>
                        <Text style={styles.statusText}>
                          {getStatusLabel(item)}
                        </Text>
                      </View>
                      <Text style={[styles.amount, getAmountStyle(item)]}>
                        ₱ {number_format(item.gross)}
                      </Text>

                      {/* Dates */}
                      {item.finishedAt && (
                        <Text style={styles.statusDate}>
                          Finished: {new Date(item.finishedAt).toLocaleString()}
                        </Text>
                      )}
                      {item.paidAt && (
                        <Text style={styles.statusDate}>
                          Paid: {new Date(item.paidAt).toLocaleString()}
                        </Text>
                      )}
                      {item.claimedAt && (
                        <Text style={styles.statusDate}>
                          Claimed: {new Date(item.claimedAt).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          {
            backgroundColor: "#16A34A", // red or green
            marginBottom: 25, // padding bottom
          },
        ]}
        action={{
          label: "",
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
      <CustomerActionModal
        visible={customerAction}
        onDismiss={() => setCustomerAction(false)}
        onCall={() => {
          setCustomerAction(false);
          Linking.openURL(`tel:${customerContact}`);
        }}
        onMessage={() => {
          setCustomerAction(false);
          Linking.openURL(
            `sms:${customerContact}?body=${encodeURIComponent(savedMessage)}`
          );
        }}
        onEdit={() => {
          setCustomerAction(false);
          setEditModalVisible(true);
        }}
        onDelete={() => {
          setCustomerAction(false);
          alert("Delete coming soon!");
        }}
      />
      <NewLaundryModal
        visible={laundryVisible}
        onDismiss={() => setNewLaundryVisible(false)}
        customerId={Array.isArray(customerId) ? customerId[0] : customerId}
        onSaveSuccess={(message) => {
          if (message) {
            setSnackbarMessage(message);
            setSnackbarVisible(true);
          }
          loadCustomerData(); // your existing reload function if any
        }}
      />
      <TagModalAction
        visible={taggingVisible}
        onDismiss={() => {
          setSelectedServiceId("");
          setTaggingVisible(false);
        }}
        selectedService={selectedService}
        onUpdateTag={updateTag}
      />
      <EditCustomerModal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        customerId={customerId as string}
        name={customerName}
        contact={customerContact}
        onSave={handleCustomerEdit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 6,
    position: "relative",
  },
  serviceType: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardContentLeft: {
    flex: 1,
  },
  cardContentRight: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minWidth: 100,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  statusDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
