import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cumplimiento minero · San Juan",
  description:
    "Control de mano de obra local, compras locales y documentación para contratistas de la minería sanjuanina.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
