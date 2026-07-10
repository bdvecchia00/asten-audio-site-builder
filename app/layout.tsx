import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asten — Site por Áudio",
  description: "Transforme um roteiro falado em um site com a identidade Asten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
