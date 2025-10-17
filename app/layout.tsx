import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata = {
  title: "Wandenreich - Authentication System",
  description: "A simple authentication system with NextAuth.js",
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
