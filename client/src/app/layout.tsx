import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Я переродилась в другом мире - Игра",
  description: "Приключенческая игра о перерождении в другом мире",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelifySans.variable} font-pixelify-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
