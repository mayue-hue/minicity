import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "微缩城市天气卡片",
  description: "45 度俯视城市天气卡片生成工作流"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
