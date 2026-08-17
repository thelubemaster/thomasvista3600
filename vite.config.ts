import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project Pages URL: https://thelubemaster.github.io/thomasvista3600/
export default defineConfig({
  plugins: [react()],
  base: "/thomasvista3600/",
  server: {
    host: true,
    port: 5173,
  },
});
