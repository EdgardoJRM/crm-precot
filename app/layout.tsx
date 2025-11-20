import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrecoTracks CRM",
  description: "Sistema CRM interno para gestión de participantes y campañas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
