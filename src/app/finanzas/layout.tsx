import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Finanzas - simuladorPRO",
  description: "Entrada de WEBAPP al cerebro financiero externo simuladorPRO.",
};

export default function FinanzasLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
