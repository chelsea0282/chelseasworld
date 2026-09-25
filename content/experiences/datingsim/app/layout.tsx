import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전하, 우리 무슨 사이입니까?",
  description: "What Are We, Your Highness?",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
