import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import db, { initializeDatabase } from "./db";

export const handleMigrateData = async () => {
  try {
    await initializeDatabase(); // Create tables if not done
    await initiateMigrate(); // Call your migration function
    Alert.alert("Migration Complete", "Data has been migrated to SQLite.");
  } catch (err) {
    console.error("Migration error:", err);
    Alert.alert("Migration Failed", "An error occurred during migration.");
  }
};

const initiateMigrate = async () => {
  const storedCustomers = await SecureStore.getItemAsync("customers");
  if (!storedCustomers) {
    console.log("No customers to migrate.");
    return;
  }

  const customers = JSON.parse(storedCustomers);

  for (const customer of customers) {
    await db.runAsync(
      `INSERT OR REPLACE INTO customers (id, name, contact, createdAt)
         VALUES (?, ?, ?, ?)`,
      [customer.id, customer.name, customer.contact, customer.createdAt]
    );
  }
  console.log(`✅ Migrated ${customers.length} customers to SQLite.`);

  const storedAddOns = await SecureStore.getItemAsync("addons");
  if (!storedAddOns) {
    console.log("No add-ons found in SecureStore.");
    return;
  }

  const addons = JSON.parse(storedAddOns);

  for (const addon of addons) {
    await db.runAsync(
      `INSERT OR REPLACE INTO addons (id, name, price)
         VALUES (?, ?, ?)`,
      [addon.id, addon.name, addon.price]
    );
  }

  console.log(`✅ Migrated ${addons.length} add-ons to SQLite.`);

  const storedServicesTypes = await SecureStore.getItemAsync("service_types");
  if (!storedServicesTypes) {
    console.log("No service types found in SecureStore.");
    return;
  }

  const serviceTypes = JSON.parse(storedServicesTypes);

  for (const service of serviceTypes) {
    await db.runAsync(
      `INSERT OR REPLACE INTO service_types (id, name, price, minWeight)
         VALUES (?, ?, ?, ?)`,
      [
        service.id,
        service.name,
        parseFloat(service.price),
        service.minWeight ? parseFloat(service.minWeight) : null,
      ]
    );
  }

  console.log(`✅ Migrated ${serviceTypes.length} service types to SQLite.`);

  const storedServices = await SecureStore.getItemAsync("services");
  const services = storedServices ? JSON.parse(storedServices) : [];

  for (const service of services) {
    await db.runAsync(
      `INSERT OR IGNORE INTO services (
          id, customerId, serviceType, weight, load,
          instructions, addons, gross, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        service.id,
        service.customerId,
        service.serviceType,
        service.weight,
        service.load,
        service.instructions,
        JSON.stringify(service.addons || []), // Store addons as JSON string
        service.gross,
        service.createdAt,
      ]
    );

    await db.runAsync(
      `INSERT OR REPLACE INTO services_status (
          serviceId, customerId,
          isFinished, isPaid, isClaimed,
          finishedAt, paidAt, claimedAt
        ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL)`,
      [
        service.id,
        service.customerId,
        service.isFinished ? 1 : 0,
        service.isPaid ? 1 : 0,
        service.isClaimed ? 1 : 0,
      ]
    );
  }
  console.log("✅ Services migrated successfully.");

  console.log("✅ Status data migrated from SecureStore to SQLite");

  await SecureStore.deleteItemAsync("customers");
  console.log("✅ Done deleting customer in storage");

  await SecureStore.deleteItemAsync("services");
  console.log("✅ Done deleting services in storage");
  await SecureStore.deleteItemAsync("addons");
  console.log("✅ Done deleting addons in storage");
  await SecureStore.deleteItemAsync("service_types");
  console.log("✅ Done deleting service_types in storage");
};
