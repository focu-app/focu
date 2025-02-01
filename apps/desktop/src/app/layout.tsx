import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { ThemeProvider } from "@repo/ui/components/theme-provider";
import { Toaster } from "@repo/ui/components/ui/toaster";

export const metadata: Metadata = {
  title: "Focu",
  description: "Focu Desktop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
