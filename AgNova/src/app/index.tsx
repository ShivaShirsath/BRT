import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

export default function HomeScreen() {
  const DESKTOP_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // Dynamically get the Metro dev server IP address
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const devIp = hostUri ? hostUri.split(":")[0] : "localhost";
  const webViewUrl = `http://${devIp}:5173`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <WebView
        source={{ uri: webViewUrl }}
        style={{ flex: 1 }}
        // 1. Spoof a desktop browser for both Android and iOS
        userAgent={DESKTOP_USER_AGENT}
        // 2. iOS Specific configuration to request the desktop page
        contentMode="desktop"
        // 3. Force Android to allow scaling down large layout sizes
        textZoom={100}
      />{" "}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
  },
  webview: {
    flex: 1,
    height: Platform.OS === "web" ? ("100dvh" as any) : "100%",
    width: Platform.OS === "web" ? ("1024px" as any) : "100%",
  },
});
