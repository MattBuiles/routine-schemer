import type { Metadata } from "next";
import "./globals.css";

// Using system fonts as fallback to avoid network dependency
const fontVars = {
  "--font-geist-sans": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "--font-geist-mono": "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace"
};

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
    <html lang="en">
      <body
        className="antialiased"
        style={fontVars as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
