import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventRadar — find tech events",
  description:
    "One-page tech-event finder: hackathons, meetups and more, aggregated live from multiple sources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-slate-100 antialiased">{children}</body>
    </html>
  );
}
