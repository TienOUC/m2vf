import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import ClientProvider from '@/components/providers/ClientProvider';

const geistSans = localFont({
  src: '../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
});
const geistMono = localFont({
  src: '../public/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
});

export const metadata: Metadata = {
  title: 'Reelay【立画】 - AI智能生成视频',
  description:
    'Reelay【立画】是一款强大的AI视频生成与工作流编排工具，帮助您轻松创建和管理复杂的多模态工作流程',
  icons: {
    icon: '/favicon.ico'
  }
};

import GlobalLoading from '@/components/ui/GlobalLoading';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          {children}
          <GlobalLoading />
          <Toaster />
        </ClientProvider>
      </body>
    </html>
  );
}