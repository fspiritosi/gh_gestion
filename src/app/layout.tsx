import { ThemeProvider } from '@/components/theme-provider';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

import './globals.css';
const inter = Inter({ subsets: ['latin'] });
const popinsFont = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Grupo Horizonte',
  description: 'Gestión para las empresas',
  icons: {
    icon: '/gh_logo.png',
    shortcut: '/gh_logo.png',
    apple: '/gh_logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${popinsFont.className} bg-gh_contrast dark:bg-slate-900`}>
        <ThemeProvider attribute="class" defaultTheme="ligth" enableSystem disableTransitionOnChange>
          <Toaster />
          <Sonner richColors={true} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
