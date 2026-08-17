import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as Window & { deferredInstall?: Event }).deferredInstall = e;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void (async () => {
      try {
        const reg = await navigator.serviceWorker.register("./sw.js");
        await reg.update();
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          try {
            if (sessionStorage.getItem("wiring-sw-reload") === "1") return;
            sessionStorage.setItem("wiring-sw-reload", "1");
          } catch {
            /* ignore */
          }
          window.location.reload();
        });
        navigator.serviceWorker.addEventListener("message", (e: MessageEvent) => {
          if (e.data && e.data.type === "RELOAD") window.location.reload();
        });
      } catch {
        /* ignore */
      }
    })();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
