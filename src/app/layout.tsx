import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeautyPay - Controle de Comissões",
  description: "Sistema de controle de comissões para profissionais de beleza",
  icons: {
    icon: "/beautypay-favicon.png",
    shortcut: "/beautypay-favicon.png",
    apple: "/beautypay-favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth" className="h-full overflow-hidden">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            {children}
            <footer className="bg-gray-900 text-white py-6 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} BeautyPay - Todos os direitos reservados
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Desenvolvido por JeanDev
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        {/* Service Worker desabilitado pois usamos Supabase para dados em tempo real */}
        {/* <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  setTimeout(() => {
                    navigator.serviceWorker.register('/sw.js')
                      .then((registration) => {
                        console.log('SW registered: ', registration);
                      })
                      .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  }, 2000);
                });
              }
            `,
          }}
        /> */}
      </body>
    </html>
  );
}