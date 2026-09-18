'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, Check, X, ShieldCheck, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key') || '';
      setApiKey(stored);
    }
  }, [isOpen]);

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
      <div className="w-full max-w-mobile bg-white rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* 모달 헤더 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">설정 ⚙️</h3>
              <p className="text-[10px] text-slate-400">Google Gemini API 키 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API 키 설정 영역 */}
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Gemini AI API 키</span>
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              우리가족보험에서 사용 중이신 Gemini API 키가 있다면 여기에 그대로 붙여넣어 공유하실 수 있습니다. 키는 외부에 전송되지 않고 본인 브라우저에만 안전하게 보관됩니다.
            </p>
            <input
              type="password"
              placeholder="AIzaSy... 로 시작하는 Gemini API 키"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1 text-[11px] text-blue-800 leading-relaxed">
            <div className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>100% 무료 제공 안내</span>
            </div>
            <p className="text-[10px] text-slate-600">
              Google Gemini API 키는 Google AI Studio에서 신용카드 없이 평생 무료(일 1,500회)로 발급되며, 키를 입력하지 않아도 내장된 정밀 룰 엔진으로 증권 분석이 정상 작동합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
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
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
