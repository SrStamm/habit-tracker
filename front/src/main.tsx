import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getAppConfig } from "./features/config/api";
import { setAppTimeZone } from "./lib/appTimeZone";
import "./index.css";

const bootstrap = async () => {
  try {
    const { timeZone } = await getAppConfig();
    setAppTimeZone(timeZone);
  } catch (error) {
    console.warn(
      "Falha ao carregar /config; usando timezone do navegador",
      error,
    );
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void bootstrap();
