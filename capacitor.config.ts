import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.schoolie.wiring3600",
  appName: "3600 Wiring",
  webDir: "companion",
  android: {
    allowMixedContent: true,
  },
};

export default config;
