import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '스마트 건강보험 진단 & 맞춤 리모델링',
  description: '연령대 및 가족력 분석 기반 건강보험 보장 점수 진단 및 맞춤 리모델링 추천 솔루션',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-slate-100 flex justify-center items-start min-h-screen">
        <main className="w-full flex justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
