import { openDatabaseSync } from "expo-sqlite";

// Open or create the SQLite DB
const db = openDatabaseSync("laundry.db");

export const initializeDatabase = async () => {
  // Execute each SQL statement individually
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT,
      contact TEXT,
      createdAt TEXT
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      serviceType TEXT,
      weight REAL,
      load REAL,
      instructions TEXT,
      addons TEXT,
      gross REAL,
      createdAt TEXT,
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS services_status (
        serviceId TEXT PRIMARY KEY,
        customerId TEXT,
        isFinished INTEGER DEFAULT 0,
        finishedAt TEXT,
        isPaid INTEGER DEFAULT 0,
        paidAt TEXT,
        isClaimed INTEGER DEFAULT 0,
        claimedAt TEXT,
        FOREIGN KEY (serviceId) REFERENCES services(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS addons (
          id TEXT PRIMARY KEY,
          name TEXT,
          price REAL
    );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS service_types (
        id TEXT PRIMARY KEY,
        name TEXT,
        price REAL,
        minWeight REAL
    );`
  );
};

export default db;
