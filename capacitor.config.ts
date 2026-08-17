import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.schoolie.wiring3600",
  appName: "3600 Wiring",
  webDir: "dist",
  server: {
    url: "https://thelubemaster.github.io/thomasvista3600/",
    androidScheme: "https",
  },
  android: { allowMixedContent: true },
};

export default config;
