import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/5_shared/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/5_shared/auth/authOptions";

export const metadata: Metadata = {
  title: "GitVideo — Your Code. Your Story. Automatically.",
  description:
    "AI Product Demo Studio: Connect any GitHub repository. GitVideo discovers features, synthesizes audio narration, and renders cinematic walkthrough demos in seconds.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pre-seed session directly on the server to prevent client-side auth flash
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="shell-type" content="mobile_tab" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-sans text-sm text-on-surface flex flex-col min-h-screen">
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
