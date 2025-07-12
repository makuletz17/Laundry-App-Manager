import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const expoConfig: any = Constants.expoConfig || {};
  const version = expoConfig.version || "Unknown";
  const [refreshing, setRefreshing] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(true);

  const checkUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      setUpdateAvailable(update.isAvailable);
    } catch (e) {
      console.error("Failed to check update:", e);
      Alert.alert("Error", "Failed to check for updates.");
    }
    setCheckingUpdate(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkUpdate();
    setRefreshing(false);
  };

  useEffect(() => {
    checkUpdate();
  }, []);

  type MaterialIconName =
    | "store"
    | "add-circle-outline"
    | "local-laundry-service"
    | "gavel";

  const menuItems: { label: string; icon: MaterialIconName; route: string }[] =
    [
      {
        label: "Shop Info",
        icon: "store",
        route: "/screen/settings/shop-info",
      },
      {
        label: "Add-ons",
        icon: "add-circle-outline",
        route: "/screen/settings/add-ons",
      },
      {
        label: "Service Types",
        icon: "local-laundry-service",
        route: "/screen/settings/services",
      },
      {
        label: "Terms & Legal",
        icon: "gavel",
        route: "/screen/settings/terms",
      },
    ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => router.push({ pathname: item.route })}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: "#f0f0f0" },
              ]}>
              <View style={styles.iconLabelRow}>
                <MaterialIcons name={item.icon} size={22} color="#1976D2" />
                <Text style={styles.menuText}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </Pressable>
          ))}

          {/* App Version Row */}
          <View style={[styles.menuItem, { justifyContent: "space-between" }]}>
            <View style={styles.iconLabelRow}>
              <MaterialIcons name="info" size={22} color="#1976D2" />
              <Text style={styles.menuText}>App Version</Text>
            </View>
            <Text style={[styles.menuText, { color: "#666" }]}>{version}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Check for Updates Section */}
      <View style={styles.updateSection}>
        {checkingUpdate ? (
          <ActivityIndicator size="small" color="#1976D2" />
        ) : updateAvailable ? (
          <Pressable
            style={styles.updateButton}
            onPress={async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch (e) {
                <Text style={styles.updateButtonText}>
                  Can not get updates
                </Text>;
              }
            }}>
            <MaterialIcons name="system-update-alt" size={20} color="#fff" />
            <Text style={styles.updateButtonText}>
              Update Available – Tap to Apply
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.noUpdateText}>You're on the latest version</Text>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 15,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#0f172a",
  },
  updateSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#1976D2",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  updateButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
  noUpdateText: {
    fontSize: 14,
    color: "#6b7280",
  },
  migrateButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },

  migrateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
