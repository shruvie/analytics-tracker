import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Custom Analytics Dashboard',
  description: 'Standalone analytics infrastructure',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 dark:bg-slate-900">
      <body className={`${inter.className} h-full overflow-hidden text-slate-900 dark:text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
