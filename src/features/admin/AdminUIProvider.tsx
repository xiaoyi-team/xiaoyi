import type { ReactNode } from "react";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";

const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: "#344f7d",
    colorText: "#263652",
    colorTextSecondary: "#64748b",
    colorBorder: "#dce3ed",
    colorBgLayout: "#f4f6fa",
    borderRadius: 8,
    controlHeight: 36,
    fontFamily: "inherit",
  },
};

export function AdminUIProvider({ children }: { children: ReactNode }) {
  return (
    <StyleProvider layer>
      <ConfigProvider locale={zhCN} theme={adminTheme}>{children}</ConfigProvider>
    </StyleProvider>
  );
}
