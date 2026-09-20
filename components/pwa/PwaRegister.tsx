'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Sparkles, X } from 'lucide-react';

export const PwaRegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 이미 앱(standalone) 모드로 구동 중인지 체크
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // 이미 설치되어 실행 중이면 배너 미노출
    }

    // layout.tsx의 인라인 스크립트에서 이미 프롬프트를 획득했는지 확인
    if ((window as any).__deferredPrompt) {
      setDeferredPrompt((window as any).__deferredPrompt);
      setShowInstallBanner(true);
    }

    const handlePromptReady = (e: any) => {
      const prompt = e.detail || (window as any).__deferredPrompt;
      setDeferredPrompt(prompt);
      setShowInstallBanner(true);
    };

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).__deferredPrompt = e;
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setShowInstallBanner(true);
      window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: e }));
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      (window as any).__deferredPrompt = null;
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || (window as any).__deferredPrompt || (window as any).deferredPrompt;
    if (!prompt) return;

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
    } catch (err) {
      console.log('PWA 설치 프롬프트 오류:', err);
    }
  };

  if (!showInstallBanner) return null;

  return (
    <div className="w-full max-w-mobile mx-auto px-4 pt-2 animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-3.5 py-2.5 rounded-2xl flex items-center justify-between shadow-lg border border-blue-400/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-black tracking-tight">안드로이드 앱스 화면에 자동 등록</p>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <p className="text-[10px] text-blue-100">터치 한 번으로 앱스(어플 목록)에 등록</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-white text-blue-700 font-black text-xs rounded-xl shadow-sm hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
          >
            등록하기
          </button>
          <button
            type="button"
            onClick={() => setShowInstallBanner(false)}
            className="p-1 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
