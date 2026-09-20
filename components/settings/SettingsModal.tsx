'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Check,
  X,
  ShieldCheck,
  Download,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  Share2,
  PlusSquare,
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
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

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

      // iOS 여부 판별
      const userAgent = window.navigator.userAgent.toLowerCase();
      const iosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(iosDevice);

      // 전역 deferredPrompt 확인
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }

      const handlePromptAvailable = (e: any) => {
        setDeferredPrompt(e.detail || (window as any).deferredPrompt);
      };

      window.addEventListener('pwa-prompt-available', handlePromptAvailable);
      return () => {
        window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      };
    }
  }, [isOpen]);

  // 어플 설치 버튼 클릭 핸들러
  const handleInstallApp = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as any).deferredPrompt : null);

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          (window as any).deferredPrompt = null;
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.log('설치 프롬프트 오류:', err);
        setShowManualGuide(true);
      }
    } else {
      // 프롬프트가 지원되지 않거나 이미 소진된 경우 (iOS Safari 또는 브라우저 수동 설치 필요)
      setShowManualGuide((prev) => !prev);
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
                    <span>앱서랍 / 홈 화면 어플 설치</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                      PWA
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-slate-600 mt-0.5 leading-tight">
                    스토어 방문 없이 내 폰의 <b>앱서랍</b>과 <b>홈 화면</b>에 정식 어플로 설치합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 설치 상태에 따른 액션 버튼 */}
            {isStandalone || isInstalled ? (
              <div className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>이미 앱서랍에 어플로 설치되어 있습니다 (단독 실행 모드)</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>📲 앱서랍에 어플 설치하기</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </button>

                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-slate-500">
                    전체화면 구동 • 빠른 실행 • 오프라인 캐시
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManualGuide((prev) => !prev)}
                    className="text-[10.5px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 underline cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>설치 방법 안내</span>
                  </button>
                </div>
              </div>
            )}

            {/* 브라우저별 수동 설치 안내 (iOS Safari 및 기타) */}
            {showManualGuide && !isStandalone && (
              <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs space-y-2 animate-in fade-in duration-150">
                <span className="font-bold text-blue-950 block text-[11px]">
                  📱 기기별 앱서랍/홈화면 추가 방법:
                </span>
                {isIos ? (
                  <div className="space-y-1 text-[10.5px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="font-bold text-indigo-900 flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" /> 아이폰(iOS Safari) 설치 순서:
                    </p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                      <li>사파리 하단 중앙의 <b>[공유(내보내기) 버튼 ⎋]</b> 터치</li>
                      <li>메뉴를 아래로 스크롤하여 <b>[홈 화면에 추가 ➕]</b> 선택</li>
                      <li>우측 상단 <b>[추가]</b>를 누르면 홈 화면과 앱 보관함에 앱 설치 완료!</li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-1 text-[10.5px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="font-bold text-indigo-900 flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-blue-600" /> 안드로이드/PC 설치 순서:
                    </p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                      <li>상단의 <b>[📲 앱서랍에 어플 설치하기]</b> 버튼 터치</li>
                      <li>시스템 팝업이 뜨지 않으면 브라우저 우측 상단 <b>[더보기 메뉴 ⋮]</b> 터치</li>
                      <li><b>[앱 설치]</b> 또는 <b>[홈 화면에 추가]</b>를 선택하면 앱서랍에 자동 등록됩니다.</li>
                    </ol>
                  </div>
                )}
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
