import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智能建造技术专业能力图谱",
  description: "智能建造技术专业能力图谱可视化展示",
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
