import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "^/api/v1/announcements(?:[/?]|$)": {
        target: "http://115.159.121.83",
        changeOrigin: true,
      },
      "^/api/v1/rights-records(?:[?]|$)": {
        target: "http://115.159.121.83",
        changeOrigin: true,
      },
      "^/api/v1/votes(?:[?]|$)": {
        target: "http://115.159.121.83",
        changeOrigin: true,
      },
      "^/api/v1/votes/[^/?]+/submit(?:[?]|$)": {
        target: "http://115.159.121.83",
        changeOrigin: true,
      },
      "^/api/v1/daily-quotes/by-date(?:[?]|$)": {
        target: "http://115.159.121.83",
        changeOrigin: true,
      },
      "^/api(?:[/?]|$)": {
        target: "http://115.159.121.83:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api(?=\/|\?|$)/, ""),
      },
    },
  },
});
