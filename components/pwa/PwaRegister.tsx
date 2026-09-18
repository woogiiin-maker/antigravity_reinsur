'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const PwaRegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    // 1. 서비스 워커 등록
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('PWA Service Worker registration failed:', err));
    }

    // 2. PWA 설치 프롬프트 이벤트 감지
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="w-full max-w-mobile mx-auto px-4 pt-2">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">홈 화면에 어플 설치</p>
            <p className="text-[10px] text-blue-100">앱처럼 빠르고 간편하게 이용하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 bg-white text-blue-700 font-extrabold text-[11px] rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            설치하기
          </button>
          <button
            onClick={() => setShowInstallBanner(false)}
            className="p-1 text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
