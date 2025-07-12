import { getShopConfig } from "@/src/shopConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function TermsScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState<string>("Your Business");
  const [ownerName, setOwnerName] = useState<string>("Your Name");
  const [contact, setContact] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const checkShopInfo = async () => {
      const config = getShopConfig();
      setAddress((await config).shopAddress);
      setContact((await config).contact);
      setOwnerName((await config).ownerName);
      setBusinessName((await config).businessName);
    };

    checkShopInfo();
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Terms & Legal",
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/screen/settings")}
              style={{
                paddingHorizontal: 10,
                flexDirection: "row",
                alignItems: "center",
              }}>
              <MaterialIcons name="arrow-back" size={24} color="#1976D2" />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          By using this app, you agree to the terms and conditions below. Please
          read them carefully before using the service.
        </Text>

        <Text style={styles.sectionTitle}>2. Services Provided</Text>
        <Text style={styles.text}>
          We provide laundry processing services. We are not liable for:
        </Text>
        <Text style={styles.bullet}>• Pre-existing damages</Text>
        <Text style={styles.bullet}>• Undisclosed fragile items</Text>
        <Text style={styles.bullet}>
          • Mislabeling or missing care instructions
        </Text>

        <Text style={styles.sectionTitle}>3. Payments</Text>
        <Text style={styles.text}>
          All services must be paid in full. Late payments may result in service
          denial or legal actions.
        </Text>

        <Text style={styles.sectionTitle}>4. Claims</Text>
        <Text style={styles.text}>
          Claims must be reported within 24 hours of item return. After this
          window, we are not liable for any issues.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitations</Text>
        <Text style={styles.text}>
          Our liability is limited to the cost of the service provided for that
          item.
        </Text>

        <Text style={styles.sectionTitle}>6. Policy Changes</Text>
        <Text style={styles.text}>
          These terms may be updated at any time. It’s your responsibility to
          review them periodically.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Info</Text>
        <Text style={styles.text}>Name: {ownerName}</Text>
        <Text style={styles.text}>Contact No: {contact}</Text>
        <Text style={styles.text}>Address: {address}</Text>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
    color: "#0f172a",
  },
  text: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#334155",
    marginLeft: 10,
    lineHeight: 20,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 40,
  },
});
