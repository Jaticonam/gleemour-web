import { createRoot } from "react-dom/client";
import AOS from "aos";

import "aos/dist/aos.css";
import "./index.css";

import App from "./App.tsx";

import {
  configurePublicAssets,
} from "@/app/publicAssets/configurePublicAssets";

configurePublicAssets();

AOS.init({
  duration: 600,
  easing: "ease-out-cubic",
  once: true,
  offset: 60,
});

createRoot(document.getElementById("root")!).render(<App />);
