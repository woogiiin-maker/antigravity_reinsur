'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Check,
  X,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  // PWA 앱 설치 상태
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key') || '';
      setApiKey(stored);

      // 이미 스탠드얼론(독립 어플 형태)으로 실행 중인지 확인
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);

      // 전역 deferredPrompt 확인 (인라인 스크립트 __deferredPrompt 우선)
      const earlyPrompt = (window as any).__deferredPrompt || (window as any).deferredPrompt;
      if (earlyPrompt) {
        setDeferredPrompt(earlyPrompt);
      }

      const handlePromptReady = (e: any) => {
        const prompt = e.detail || (window as any).__deferredPrompt || (window as any).deferredPrompt;
        setDeferredPrompt(prompt);
      };

      window.addEventListener('pwa-prompt-ready', handlePromptReady);
      window.addEventListener('pwa-prompt-available', handlePromptReady);

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setInstallStatusMsg('🎉 어플이 앱서랍에 성공적으로 등록되었습니다!');
      };
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('pwa-prompt-ready', handlePromptReady);
        window.removeEventListener('pwa-prompt-available', handlePromptReady);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, [isOpen]);

  // 어플 설치 버튼 클릭 핸들러 (원클릭 자동 등록)
  const handleInstallApp = async () => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== 'undefined'
        ? (window as any).__deferredPrompt || (window as any).deferredPrompt
        : null);

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          (window as any).__deferredPrompt = null;
          (window as any).deferredPrompt = null;
          setDeferredPrompt(null);
          setInstallStatusMsg('🎉 설치가 승인되었습니다! 잠시 후 앱서랍에 어플이 자동 등록됩니다.');
        }
      } catch (err) {
        console.log('설치 프롬프트 오류:', err);
        setInstallStatusMsg('상단 주소창 우측의 [↓] 설치 버튼을 터치하시면 즉시 앱서랍에 설치됩니다.');
      }
    } else {
      // 브라우저 팝업이 아직 지연되는 경우
      setInstallStatusMsg('💡 브라우저 주소창 맨 오른쪽의 [↓] 다운로드 아이콘을 터치하시면 즉시 앱서랍에 등록됩니다.');
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-mobile bg-white rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">설정 및 앱 관리 ⚙️</h3>
              <p className="text-[10px] text-slate-400">어플 설치 및 API 키 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* [1] 앱서랍 어플 설치 (PWA) 섹션 */}
          <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50/40 border-2 border-blue-200 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950 flex items-center gap-1">
                    <span>안드로이드 앱스 화면에 자동 등록</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                      PWA
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-slate-600 mt-0.5 leading-tight">
                    스토어 방문 없이 내 폰의 <b>앱스 화면(전체 앱 목록)</b>에 정식 어플로 등록합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 설치 상태에 따른 액션 버튼 */}
            {isStandalone || isInstalled ? (
              <div className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>이미 앱스 화면에 어플로 등록되어 있습니다 (단독 실행 모드)</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📲 터치 한 번으로 앱스 화면에 어플 등록하기</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </button>

                {installStatusMsg ? (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-[11px] font-medium leading-relaxed animate-in fade-in">
                    {installStatusMsg}
                  </div>
                ) : null}

                <div className="p-2.5 bg-white/90 border border-blue-100 rounded-xl text-[10.5px] text-slate-600 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>별도 설정 없이 [설치] 터치 시 안드로이드 <b>앱스 화면(앱 목록)</b>에 자동 등록됩니다.</span>
                </div>
              </div>
            )}
          </div>

          {/* [2] API 키 설정 영역 */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Gemini AI API 키 (선택사항)</span>
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Gemini API 키를 등록하시면 복잡한 가입제안서 PDF도 AI가 글자 하나까지 초정밀 판독합니다. 키는 본인 브라우저에만 안전하게 보관됩니다.
              </p>
              <input
                type="password"
                placeholder="AIzaSy... 로 시작하는 Gemini API 키"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-700 leading-relaxed">
              <div className="flex items-center gap-1 font-bold text-blue-800">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>100% 무료 제공 안내</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Google AI Studio에서 신용카드 없이 평생 무료(일 1,500회)로 발급되며, 키가 없어도 내장 룰 엔진으로 모든 기능이 정상 작동합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>저장 완료!</span>
                  </>
                ) : (
                  <span>설정 저장하기</span>
                )}
              </button>
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
