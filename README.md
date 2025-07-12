# 🧺 Laundry Manager App

A modern, mobile-first laundry service management app built with **React Native** and **SQLite**, designed to help laundry shop owners efficiently track services, customers, payments, and reporting.

---

## 📱 Features

- ✅ **Customer Management** – Add and manage customer records
- 🧼 **Service Tracking** – Record laundry types, weight, pricing, and addons
- 💸 **Payment Status** – Track paid/unpaid transactions
- 📦 **Claim Status** – Monitor finished and unclaimed items
- 📊 **Reports** – View total income, today's income, amount to collect, and unclaimed orders
- 📦 **Local Storage with SQLite** – All data is stored offline on-device
- 💅 **Modern UI/UX** – Bottom sheet modals, snackbars, and polished interface

---

## 🧰 Tech Stack

- ⚛️ React Native (via Expo)
- 📦 SQLite (`expo-sqlite`)
- 🛠 React Navigation + Expo Router
- 📄 TypeScript
- 📊 React Native Paper
- 🧾 AsyncStorage / SecureStore (if applicable)

---

## 📂 Project Structure

```
src/
├── component/         # Database hooks, utilities, reusable UI
├── screen/            # App screens (e.g. Dashboard, Customers, Services)
├── common/            # Helper functions like number formatting
├── context/           # Global state management
└── App.tsx            # Entry point
```

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/laundry-manager.git
cd laundry-manager
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Run the App
```bash
npx expo start
```

Make sure you have Expo Go installed on your device for testing.

---

## 🧱 Database Schema

This app uses a normalized SQLite structure:

- `customers` – Customer records
- `services` – Laundry service entries
- `services_status` – Tracks payment, finished, claimed status
- `addons` – Extra charges
- `service_types` – Pricing for types of laundry

> See `initializeDatabase.ts` for schema setup.

---

## 🔒 Privacy

- All data is stored **locally** on-device.
- No internet access or cloud sync required.
- See [`Privacy Policy`](#) for more info.

---

## 📸 Screenshots

> _(Include some screenshots here to show UI if available)_

---

## ✨ Future Plans

- 🔄 Data backup & restore
- ☁️ Optional cloud sync
- 🧾 Printable receipts (ESC/POS support)
- 📈 Analytics dashboard


---

## 📄 License

MIT License.
