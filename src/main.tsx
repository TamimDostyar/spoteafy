import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Interface } from "./ui/interface.tsx";
import "./ui/interface.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element #root was not found in the document.");
}

createRoot(rootElement).render(
    <StrictMode>
        <Interface />
    </StrictMode>
);
