import { Platform, StyleSheet, useColorScheme, ScrollView, RefreshControl, View, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { useRef, useEffect, useState } from "react";

export default function HomeScreen() {
  const colorScheme = useColorScheme(); // "light" | "dark"
  const webViewRef = useRef<WebView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const DESKTOP_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // Dynamically get the Metro dev server IP address
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const devIp = hostUri ? hostUri.split(":")[0] : "localhost";
  const webViewUrl = `http://${devIp}:5173`;

  // Inject system theme on startup
  const injectedJavaScript = `
    window.__nativeColorScheme = "${colorScheme || "light"}";
    true;
  `;

  // Dynamically update the webview when system color scheme changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.setNativeColorScheme) {
          window.setNativeColorScheme("${colorScheme || "light"}");
        } else {
          window.__nativeColorScheme = "${colorScheme || "light"}";
          window.dispatchEvent(new CustomEvent("nativeColorScheme", { detail: "${colorScheme || "light"}" }));
        }
        true;
      `);
    }
  }, [colorScheme]);

  useEffect(() => {
    const keyboardDidShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <WebView
          ref={webViewRef}
          source={{ uri: webViewUrl }}
          style={{ flex: 1 }}
          // 1. Spoof a desktop browser for both Android and iOS
          userAgent={DESKTOP_USER_AGENT}
          // 2. iOS Specific configuration to request the desktop page
          contentMode="desktop"
          // 3. Force Android to allow scaling down large layout sizes
          textZoom={100}
          
          // Full browser capabilities
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback={true}
          geolocationEnabled={true}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          injectedJavaScript={injectedJavaScript}
        />
      </ScrollView>
      <View style={{ height: keyboardHeight, backgroundColor: "#fff" }} />
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
