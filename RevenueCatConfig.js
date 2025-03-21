import Purchases from 'react-native-purchases';
import { Linking } from 'react-native';

const initializeRevenueCat = async () => {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: 'appl_PDuFrzhIkJIuWmQxFTDMXlCksjI' });
}

// Fetch offerings inside a function, when you need them
const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('❌ Error fetching offerings:', error);
    return null;
  }
};

// Fetch customer info when needed
const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ Error fetching customer info:', error);
    return null;
  }
};

// Purchase a subscription package
const purchaseSubscription = async (pkg) => {
  try {
    const customerInfo = await Purchases.purchasePackage(pkg);
    console.log('✅ Purchase successful:', customerInfo);
    return customerInfo;
  } catch (error) {
    if (!error.userCancelled) {
      console.error('❌ Purchase failed:', error);
    } else {
      console.log('ℹ️ Purchase cancelled by user.');
    }
    return null;
  }
};
const logInToRevenueCat = async (UID) => {
  await Purchases.logIn(UID);
};
const ManageSubscription = async () => {
  try {
    const customerInfo = await getCustomerInfo();

    console.log("Customer Info:", customerInfo)
    if (customerInfo.managementURL) {
      const canOpen = await Linking.canOpenURL(customerInfo.managementURL);
      if (canOpen) {
        await Linking.openURL(customerInfo.managementURL);
        console.log("🔗 Opened subscription management page.");
      } else {
        alert("Unable to open the subscription management page.");
      }
    } else {
      alert("No management URL available for this user.");
      console.warn("⚠️ managementURL is undefined in customerInfo");
    }

  } catch (error) {
    console.error("❌ Error fetching customer info for unsubscribe:", error);
    alert("Something went wrong. Please try again later.");
  }
};
const restorePurchases = async () => {
  try {
  const customerInfo = await Purchases.restorePurchases();
  const isSubscribed = customerInfo.entitlements.active["Medforms AI"];
    
  if (isSubscribed) {
    return true;
  } else {
    alert("No active subscription found.");
    return false;
  }
} catch (error) {
  console.error("❌ Restore failed", error);
  return false;
}
};

export {
  initializeRevenueCat,
  getOfferings,
  getCustomerInfo,
  purchaseSubscription,
  logInToRevenueCat,
  ManageSubscription,
  restorePurchases
};