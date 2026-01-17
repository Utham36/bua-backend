import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from './context/CartContext'; // <--- Import the Brain

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Halaal Farm Market',
  description: 'Fresh chicken for students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider> {/* <--- Wrap the app here */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}