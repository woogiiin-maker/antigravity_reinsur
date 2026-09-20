import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa/PwaRegister';

const basePath = process.env.NODE_ENV === 'production' ? '/antigravity_reinsur' : '';

export const metadata: Metadata = {
  title: '스마트 건강보험 진단 & 맞춤 리모델링',
  description: '연령대 및 가족력 분석 기반 건강보험 보장 점수 진단 및 맞춤 리모델링 추천 솔루션',
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: `${basePath}/icon-192.png`,
    apple: `${basePath}/icon-192.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '보험리모델링',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${basePath}/icon-192.png`} />
        <link rel="apple-touch-icon" href={`${basePath}/icon-192.png`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__basePath = "${basePath}";
              window.__deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready', { detail: e }));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var swUrl = (window.__basePath || '') + '/sw.js';
                  navigator.serviceWorker.register(swUrl, { scope: (window.__basePath || '') + '/' })
                    .then(function(reg) {
                      console.log('PWA Service Worker registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.log('PWA SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-slate-100 min-h-screen flex flex-col items-center">
        <PwaRegister />
        <main className="w-full flex justify-center flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
