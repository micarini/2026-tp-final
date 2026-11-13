import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";

// Fraunces para títulos (tono de recetario de papel) y Figtree para la interfaz.
// next/font las descarga en el build y las sirve desde nuestro dominio: no hay pedido a Google al navegar.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"], // SOFT redondea las puntas de las letras
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Tuppi",
    template: "%s · Tuppi",
  },
  description:
    "Tu recetario personal: cociná con lo que tenés en casa, respetando las restricciones de cada comensal.",
  openGraph: {
    title: "Tuppi",
    description: "Cociná con lo que tenés en casa, respetando lo que no come cada persona.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#123828",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
