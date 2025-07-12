import * as SecureStore from "expo-secure-store";
import db from "../helper/db";
import { getShopConfig } from "../shopConfig";

export const queryAsync = async <T = any,>(
  sql: string,
  params: any[] = []
): Promise<T[]> => {
  const result = await db.getAllAsync<T>(sql, params);
  return result;
};

export const getCustomersWithUnpaidTotal = async (): Promise<
  { id: string; name: string; contact: string; unpaidTotal: number }[]
> => {
  const customers = await queryAsync(
    `SELECT 
        c.id, 
        c.name, 
        c.contact, 
        IFNULL(SUM(CASE WHEN ss.isPaid = 0 THEN s.gross ELSE 0 END), 0) as unpaidTotal
     FROM customers c
     LEFT JOIN services s ON s.customerId = c.id
     LEFT JOIN services_status ss ON ss.serviceId = s.id
     GROUP BY c.id ORDER BY c.name ASC`
  );
  return customers;
};

//**service types */

export type ServiceType = {
  id: string;
  name: string;
  price: number;
  minWeight?: number;
};

export const getServiceTypes = async (): Promise<ServiceType[]> => {
  const results = await db.getAllAsync<ServiceType>(
    `SELECT id, name, price, minWeight FROM service_types ORDER BY name ASC`
  );
  return results;
};

export const saveServiceType = async (service: ServiceType) => {
  const normalized = service.name.trim().toLowerCase();

  const existing = await queryAsync<any>(
    `SELECT id FROM service_types WHERE LOWER(name) = ? LIMIT 1`,
    [normalized]
  );

  if (existing.length > 0) {
    throw new Error(`Service "${service.name}" already exists.`);
  }

  await db.runAsync(
    `INSERT INTO service_types (id, name, price, minWeight)
     VALUES (?, ?, ?, ?)`,
    [service.id, service.name, service.price, service.minWeight ?? null]
  );
};

export const updateServiceType = async (service: ServiceType) => {
  await db.runAsync(
    `UPDATE service_types 
     SET name = ?, price = ?, minWeight = ? 
     WHERE id = ?`,
    [service.name, service.price, service.minWeight ?? null, service.id]
  );
};

export const deleteServiceType = async (id: string): Promise<void> => {
  await db.runAsync(`DELETE FROM service_types WHERE id = ?`, [id]);
};
//**end service types */

//** customer details */
export const getCustomerServices = async (customerId: string) => {
  const services = await queryAsync(
    `SELECT s.*, ss.isFinished, ss.finishedAt, ss.isPaid, ss.paidAt, ss.isClaimed, ss.claimedAt
     FROM services s
     JOIN services_status ss ON s.id = ss.serviceId
     WHERE s.customerId = ? ORDER BY ss.isPaid ASC, ss.isFinished ASC, ss.isClaimed ASC, s.createdAt DESC`,
    [customerId]
  );

  const allAddOns = await getAllAddOns();

  return services.map((service: any) => {
    let resolvedAddOns = "None";
    let addonDetails: any[] = [];

    try {
      const parsed = JSON.parse(service.addons);
      if (Array.isArray(parsed)) {
        addonDetails = allAddOns.filter((a) => parsed.includes(a.id));
        const names = addonDetails.map((a) => a.name).filter(Boolean);
        resolvedAddOns = names.length > 0 ? names.join(", ") : "None";
      }
    } catch (e) {
      resolvedAddOns = "Invalid";
    }

    return {
      ...service,
      addonDetails,
      resolvedAddOns,
    };
  });
};

const getFirstAsync = async (sql: string, params: any[] = []) => {
  const result = await db.getAllAsync(sql, params);
  return result.length > 0 ? result[0] : null;
};

export const newCustomer = async (data: {
  id: string;
  name: string;
  contact: string;
  createdAt: string;
}) => {
  const { id, name, contact, createdAt } = data;

  const existing = await getFirstAsync(
    `SELECT * FROM customers WHERE name = ? COLLATE NOCASE`,
    [name.trim()]
  );

  if (existing) {
    throw new Error(`Customer name "${name}" already exists!`);
  }

  await db.runAsync(
    `INSERT INTO customers (id, name, contact, createdAt) VALUES (?, ?, ?, ?)`,
    [id, name, contact, createdAt]
  );
};

export const newCustomerService = async (service: {
  id: string;
  customerId: string;
  serviceType: string;
  weight: number;
  load: number;
  instructions: string;
  addons: string; // stored as JSON string
  gross: number;
  createdAt: string;
}) => {
  await db.runAsync("BEGIN TRANSACTION"); // optional for atomicity
  try {
    // Insert into services table
    await db.runAsync(
      `INSERT INTO services (id, customerId, serviceType, weight, load, instructions, addons, gross, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        service.id,
        service.customerId,
        service.serviceType,
        service.weight,
        service.load,
        service.instructions,
        service.addons,
        service.gross,
        service.createdAt,
      ]
    );

    // Insert into services_status table
    await db.runAsync(
      `INSERT INTO services_status (
        serviceId, customerId,
        isFinished, finishedAt,
        isPaid, paidAt,
        isClaimed, claimedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [service.id, service.customerId, 0, null, 0, null, 0, null]
    );

    await db.runAsync("COMMIT");
  } catch (error) {
    await db.runAsync("ROLLBACK");
    throw error;
  }
};

export const tagService = async (id: string, updates: Partial<any>) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return;

  const now = new Date().toISOString();

  if (updates.isFinished) {
    fields.push("finishedAt");
    values.push(now);
  }
  if (updates.isPaid) {
    fields.push("paidAt");
    values.push(now);
  }
  if (updates.isClaimed) {
    fields.push("claimedAt");
    values.push(now);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  await db.runAsync(
    `UPDATE services_status SET ${setClause} WHERE serviceId = ?`,
    [...values, id]
  );
};
//** end of customer details */

//** dashboard */
export const getTodayCustomers = async () => {
  const today = new Date().toISOString().split("T")[0];

  const rows = await queryAsync<any>(
    `SELECT DISTINCT c.id, c.name, c.contact
     FROM customers c
     INNER JOIN services s ON s.customerId = c.id
     WHERE DATE(s.createdAt) = ?`,
    [today]
  );

  return rows;
};

export const getDashboardCounts = async () => {
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const services = await queryAsync<any>(`
    SELECT 
      s.customerId,
      ss.isFinished,
      ss.isPaid,
      ss.isClaimed,
      s.createdAt
    FROM services s
    LEFT JOIN services_status ss ON ss.serviceId = s.id
  `);

  const todayCustomerIds = new Set(
    services
      .filter((s) => s.createdAt.startsWith(today))
      .map((s) => s.customerId)
  );

  const uniqueTodayCustomerIds = [...todayCustomerIds];

  let pending = 0,
    finished = 0,
    paid = 0,
    unpaid = 0,
    claimed = 0,
    unclaimed = 0;

  services.forEach((s) => {
    if (!s.isFinished) pending += 1;
    else finished += 1;

    if (s.isPaid) paid += 1;
    else unpaid += 1;

    if (s.isClaimed) claimed += 1;
    else unclaimed += 1;
  });

  return {
    customersToday: uniqueTodayCustomerIds.length,
    pending,
    finished,
    paid,
    unpaid,
    claimed,
    unclaimed,
  };
};

export const getUnclaimedServiceCountByCustomerId = async (
  customerId: string
): Promise<number> => {
  const result = await queryAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM services_status
     WHERE customerId = ? AND isClaimed = 0`,
    [customerId]
  );
  return result[0]?.count || 0;
};
//** enf of dashboard */
//** add ons */
export const getAllAddOns = async () => {
  const result = queryAsync<any>(
    `SELECT id, name, price FROM addons ORDER BY name ASC`
  );
  return result;
};

export const insertAddOn = async (
  name: string,
  price: number
): Promise<void> => {
  const id = Date.now().toString();
  const normalized = name.trim().toLowerCase();

  const existing = await queryAsync<any>(
    `SELECT id FROM addons WHERE LOWER(name) = ? LIMIT 1`,
    [normalized]
  );

  if (existing.length > 0) {
    throw new Error(`Add-on "${name}" already exists.`);
  }

  await db.runAsync(`INSERT INTO addons (id, name, price) VALUES (?, ?, ?)`, [
    id,
    name,
    price,
  ]);
};

export const deleteAddOn = async (id: string): Promise<void> => {
  await db.runAsync(`DELETE FROM addons WHERE id = ?`, [id]);
};
//** end of add- ons */

export const getWeightUnit = async () => {
  const res = SecureStore.getItem("weightUnit");
  return res || "kg";
};

export const getSavedMessage = async () => {
  const res = SecureStore.getItem("message");
  const config = getShopConfig();
  return (
    res ||
    "Hello! Your laundry is ready for pick up @ " + (await config).businessName
  );
};

export type Service = {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  weight: number;
  instructions: string;
  createdAt: string;
  gross: number;
  isFinished: boolean;
  isPaid: boolean;
  isClaimed: boolean;
};

export const getLaundryStatusReport = async (): Promise<Service[]> => {
  const result = await db.getAllAsync<{
    id: string;
    customerId: string;
    customerName: string;
    serviceType: string;
    weight: number;
    instructions: string;
    createdAt: string;
    gross: number;
    isFinished: number;
    isPaid: number;
    isClaimed: number;
  }>(`
    SELECT 
      s.id,
      s.customerId,
      c.name AS customerName,
      s.serviceType,
      s.weight,
      s.instructions,
      s.createdAt,
      s.gross,
      ss.isFinished,
      ss.isPaid,
      ss.isClaimed
    FROM services s
    LEFT JOIN customers c ON c.id = s.customerId
    LEFT JOIN services_status ss ON ss.serviceId = s.id
    ORDER BY s.createdAt DESC
  `);

  return result.map((row) => ({
    ...row,
    isFinished: !!row.isFinished,
    isPaid: !!row.isPaid,
    isClaimed: !!row.isClaimed,
  }));
};

export const getTotalIncome = async (): Promise<number> => {
  const result = await queryAsync<any>(
    `SELECT SUM(s.gross) as total
     FROM services s
     JOIN services_status ss ON s.id = ss.serviceId
     WHERE ss.isPaid = 1`
  );
  return Number(result?.[0]?.total || 0);
};

export const getToCollect = async (): Promise<number> => {
  const result = await queryAsync<any>(
    `SELECT SUM(s.gross) as unpaid
     FROM services s
     JOIN services_status ss ON s.id = ss.serviceId
     WHERE ss.isPaid = 0`
  );
  return Number(result?.[0]?.unpaid || 0);
};

export const getTodayIncome = async (
  startOfToday: string,
  endOfToday: string
): Promise<number> => {
  const result = await queryAsync<any>(
    `SELECT SUM(s.gross) as today
     FROM services s
     JOIN services_status ss ON s.id = ss.serviceId
     WHERE ss.isPaid = 1 AND ss.paidAt BETWEEN ? AND ?`,
    [startOfToday, endOfToday]
  );
  return Number(result?.[0]?.today || 0);
};

export const getUnclaimedTotal = async (): Promise<number> => {
  const result = await queryAsync<any>(
    `SELECT SUM(s.gross) as total
     FROM services s
     JOIN services_status ss ON s.id = ss.serviceId
     WHERE ss.isFinished = 1 AND ss.isClaimed = 0`
  );
  return Number(result?.[0]?.total || 0);
};
