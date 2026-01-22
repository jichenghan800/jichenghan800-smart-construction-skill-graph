import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "专业能力图谱系统",
  description: "专业能力图谱系统可视化展示",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
