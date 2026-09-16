import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
  Jua,
  Coiny,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

const jua = Jua({
  subsets: ["latin"],
  variable: "--font-jua",
  weight: "400",
});

const coiny = Coiny({
  subsets: ["latin"],
  variable: "--font-coiny",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Hamkke │ 함께 | From Small Talk to Big Ideas",
  description:
    "A meaningful English learning experience through conversation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.variable}
          ${cormorant.variable}
          ${jua.variable}
          ${coiny.variable}
        `}
      >
        {children}
      </body>
    </html>
  );
}