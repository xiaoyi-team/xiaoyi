import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { queryClient } from "./lib/query-client";

import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("没有找到 #root 节点");
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
