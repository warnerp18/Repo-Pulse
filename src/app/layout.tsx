import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GradientDefs from "./_components/GradientDefs";
import "./globals.css";
import Nav from "./_components/Nav/Nav";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Repo Pulse",
    template: "%s · Repo Pulse",
  },
  description:
    "Paste a public GitHub repository and get commit trends, top contributors, language mix and churn hotspots in one view.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <GradientDefs />
        <div className={styles.shell}>
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
