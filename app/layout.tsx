import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata = {
  title: "Wandenreich - Business Management System",
  description: "A comprehensive business management system for financial tracking and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
