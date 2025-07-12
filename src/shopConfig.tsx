import * as SecureStore from "expo-secure-store";

export const getShopConfig = async () => {
  const businessName = (await SecureStore.getItemAsync("businessName")) || "";
  const contact = (await SecureStore.getItemAsync("contact")) || "";
  const ownerName = (await SecureStore.getItemAsync("ownerName")) || "";
  const weightUnit = (await SecureStore.getItemAsync("weightUnit")) || "";
  const shopAddress = (await SecureStore.getItemAsync("shopAddress")) || "";
  const message =
    (await SecureStore.getItemAsync("message")) || "Welcome to our shop!";

  return {
    businessName,
    contact,
    ownerName,
    weightUnit,
    shopAddress,
    message,
  };
};

export const saveShopConfig = async (config: {
  businessName: string;
  contact: string;
  ownerName: string;
  weightUnit: string;
  shopAddress: string;
  message: string;
}) => {
  await SecureStore.setItemAsync("businessName", config.businessName);
  await SecureStore.setItemAsync("contact", config.contact);
  await SecureStore.setItemAsync("ownerName", config.ownerName);
  await SecureStore.setItemAsync("weightUnit", config.weightUnit);
  await SecureStore.setItemAsync("shopAddress", config.shopAddress);
  await SecureStore.setItemAsync("message", config.message);
};

export const clearShopConfig = async () => {
  await SecureStore.deleteItemAsync("businessName");
  await SecureStore.deleteItemAsync("contact");
  await SecureStore.deleteItemAsync("ownerName");
  await SecureStore.deleteItemAsync("weightUnit");
  await SecureStore.deleteItemAsync("shopAddress");
  await SecureStore.deleteItemAsync("message");
};
