import type { CapacitorConfig } from '@capacitor/cli';

const SERVER_URL = process.env.CAP_SERVER_URL || process.env.NEXT_PUBLIC_CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.wingapp.app',
  appName: 'Wing App',
  webDir: 'out',
  ios: {
    scheme: "https",
  },
  android: {
    scheme: "https",
  } as CapacitorConfig["android"],
  server: SERVER_URL
    ? {
        url: SERVER_URL,
        cleartext: SERVER_URL.startsWith("http://"),
      }
    : undefined,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
