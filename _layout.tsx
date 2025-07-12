import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  const [ownerInfo, setOwnerInfo] = useState({ owner: "", contact: "" });

  useFocusEffect(
    React.useCallback(() => {
      const loadOwnerInfo = async () => {
        const owner = await SecureStore.getItemAsync("ownerName");
        const contact = await SecureStore.getItemAsync("contact");

        setOwnerInfo({
          owner: owner || "Unknown",
          contact: contact || "Unknown",
        });
      };

      loadOwnerInfo();
    }, [])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Drawer
          drawerContent={(props) => (
            <DrawerContentScrollView {...props}>
              <View style={styles.header}>
                <MaterialIcons
                  name="account-circle"
                  size={40}
                  color="#3D74B6"
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{ownerInfo.owner}</Text>
                  <Text style={styles.contact}>{ownerInfo.contact}</Text>
                </View>
              </View>
              <DrawerItemList {...props} />
            </DrawerContentScrollView>
          )}>
          {/* your Drawer.Screen entries remain unchanged */}
          <Drawer.Screen
            name="index"
            options={{
              title: "Dashboard",
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="dashboard" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="screen/customer"
            options={{
              title: "Customers",
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="people" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="screen/laundry_status"
            options={{
              title: "Laundry Status",
              drawerIcon: ({ color, size }) => (
                <MaterialIcons
                  name="local-laundry-service"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="screen/report"
            options={{
              title: "Report",
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="assessment" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="screen/settings"
            options={{
              title: "Settings",
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="settings" size={size} color={color} />
              ),
            }}
          />

          {/* hidden routes below */}
          {[
            "common/add-customer",
            "common/paginationDot",
            "setup/index",
            "setup/owner-info",
            "setup/weight-unit",
            "screen/dashboard",
            "screen/customer-details",
            "screen/settings/shop-info",
            "screen/settings/terms",
            "screen/settings/services",
            "screen/settings/add-ons",
          ].map((name) => (
            <Drawer.Screen
              key={name}
              name={name}
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />
          ))}
        </Drawer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2F1",
    borderBottomWidth: 1,
    borderBottomColor: "#B2DFDB",
    marginBottom: 8,
    borderRadius: 10,
  },
  infoContainer: {
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  contact: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
