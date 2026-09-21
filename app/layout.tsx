import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumePilot · AI 简历与面试复盘",
  description: "生成、管理和投递简历，并通过多轮面试记录持续改进。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
