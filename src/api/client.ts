import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { saveOfflinePurchase, getOfflinePurchase, saveOfflineSale } from "./syncEngine";
import { db } from "../lib/db";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8080/api/v1",
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Check network state
  if (!navigator.onLine) {
    if (config.method === "post" && config.url === "/purchase") {
      try {
        const payload = config.data;
        const result = await saveOfflinePurchase(payload);
        
        // Hijack request with mock response
        config.adapter = () => {
          return Promise.resolve({
            data: {
              id: result.id,
              billNo: result.billNo,
              amount: result.amount,
              offline: true,
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        };
      } catch (err) {
        console.error("Failed to intercept and save purchase offline:", err);
      }
    } else if (config.method === "post" && config.url === "/sales") {
      try {
        const payload = config.data;
        const result = await saveOfflineSale(payload);
        
        config.adapter = () => {
          return Promise.resolve({
            data: {
              id: result.id,
              salePattiNo: result.billNo,
              amount: result.amount,
              offline: true,
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        };
      } catch (err) {
        console.error("Failed to intercept and save sale offline:", err);
      }
    } else if (config.method === "get" && config.url?.startsWith("/purchase/by-bill-no/")) {
      const parts = config.url.split("/");
      const billNo = parts[parts.length - 1];
      if (billNo) {
        try {
          const offlineBill = await getOfflinePurchase(billNo);
          if (offlineBill) {
            config.adapter = () => {
              return Promise.resolve({
                data: offlineBill,
                status: 200,
                statusText: "OK",
                headers: {},
                config,
              });
            };
          } else {
            // Mock a 404 response for offline cache miss
            config.adapter = () => {
              return Promise.reject({
                response: {
                  data: { error: "Bill not found in local cache" },
                  status: 404,
                  statusText: "Not Found",
                  headers: {},
                  config,
                },
              });
            };
          }
        } catch (err) {
          console.error("Failed to fetch offline purchase:", err);
        }
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Cache single purchases loaded online for offline use (Downsync)
    if (
      navigator.onLine &&
      response.config.method === "get" &&
      response.config.url?.startsWith("/purchase/by-bill-no/")
    ) {
      const data = response.data;
      if (data && data.id) {
        db.purchases.put({
          id: data.id,
          billNo: data.billNo,
          note: data.note,
          billDate: data.billDate,
          entryType: data.entryType,
          cessCondition: data.cessCondition,
          sellerId: data.sellerId,
          vehicleNo: data.vehicleNo,
          partyBillNo: data.partyBillNo,
          items: data.items || [],
          charges: data.charges || {},
          synced: true,
        }).catch((err) => console.error("Failed to cache purchase response:", err));
      }
    }

    // Cache successful purchase creations online
    if (
      navigator.onLine &&
      response.config.method === "post" &&
      response.config.url === "/purchase"
    ) {
      const data = response.data; // { id, billNo, amount }
      try {
        const payload = JSON.parse(response.config.data);
        if (data && data.id) {
          db.purchases.put({
            id: data.id,
            billNo: data.billNo,
            note: payload.note,
            billDate: payload.businessDate,
            entryType: payload.entryType,
            cessCondition: payload.cessCondition,
            sellerId: payload.sellerId,
            vehicleNo: payload.vehicleNo,
            partyBillNo: payload.partyBillNo,
            items: payload.items || [],
            charges: payload.charges || {},
            synced: true,
          }).catch((err) => console.error("Failed to cache created purchase:", err));
        }
      } catch (err) {
        console.error("Failed to parse request data for caching:", err);
      }
    }

    // Cache successful sales creations online
    if (
      navigator.onLine &&
      response.config.method === "post" &&
      response.config.url === "/sales"
    ) {
      const data = response.data; // { id, salePattiNo, amount }
      try {
        const payload = JSON.parse(response.config.data);
        if (data && data.id) {
          db.sales.put({
            id: data.id,
            billNo: data.salePattiNo || payload.voucherNo,
            synced: true,
            payload: payload
          }).catch((err) => console.error("Failed to cache created sale:", err));
        }
      } catch (err) {
        console.error("Failed to parse sales request data for caching:", err);
      }
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
