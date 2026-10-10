import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import "@neondatabase/auth-ui/css";
import "./globals.css";

// Las tres familias de strata; globals.css las consume vía --font-inter, --font-fraunces y --font-geist-mono.
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Routine Schemer - Planificación Integral de Entrenamientos",
  description: "Plataforma profesional para diseñar, estructurar y visualizar rutinas y planes de entrenamiento completos. Incluye hipertrofia, acondicionamiento, movilidad, hábitos saludables y calendario interactivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
