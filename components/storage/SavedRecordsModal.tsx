'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowRight, X, Plus, Calendar, ShieldCheck, User } from 'lucide-react';
import { DiagnosisReport, UserProfile } from '@/types/insurance';

export interface SavedRecord {
  id: string;
  name: string; // 예: "나", "남편", "어머니", "자녀"
  savedAt: string;
  profile: UserProfile;
  report: DiagnosisReport;
}

interface SavedRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecord: (profile: UserProfile, report: DiagnosisReport) => void;
  currentProfile?: UserProfile | null;
  currentReport?: DiagnosisReport | null;
}

const STORAGE_KEY = 'antigravity_reinsur_saved_records';

export const SavedRecordsModal: React.FC<SavedRecordsModalProps> = ({
  isOpen,
  onClose,
  onLoadRecord,
  currentProfile,
  currentReport,
}) => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [saveName, setSaveName] = useState<string>('');
  const [showSaveInput, setShowSaveInput] = useState<boolean>(false);

  // 로컬 스토리지에서 기록 불러오기
  const loadStoredRecords = () => {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setRecords(JSON.parse(data));
      }
    } catch (e) {
      console.error('보관함 로드 실패:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStoredRecords();
      setShowSaveInput(false);
      setSaveName('');
    }
  }, [isOpen]);

  // 현재 진단 결과 저장
  const handleSaveCurrent = () => {
    if (!currentProfile || !currentReport) return;
    const nameToSave = saveName.trim() || `진단 기록 (${new Date().toLocaleDateString('ko-KR')})`;

    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      name: nameToSave,
      savedAt: new Date().toLocaleDateString('ko-KR'),
      profile: currentProfile,
      report: currentReport,
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowSaveInput(false);
    setSaveName('');
  };

  // 기록 삭제
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-mobile bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* 모달 헤더 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">진단 결과 보관함</h3>
              <p className="text-[10px] text-slate-400">가족별 보장 점수 및 리포트 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 현재 결과 저장 섹션 */}
        {currentReport && currentProfile && (
          <div className="p-3 bg-blue-50/50 border-b border-blue-100">
            {showSaveInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="예: 나, 배우자, 첫째아이, 어머니"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1 p-2 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  autoFocus
                />
                <button
                  onClick={handleSaveCurrent}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg whitespace-nowrap"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowSaveInput(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 text-xs"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="w-full py-2 bg-white border border-blue-200 hover:border-blue-400 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>현재 진단 리포트를 보관함에 저장하기</span>
              </button>
            )}
          </div>
        )}

        {/* 저장된 목록 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {records.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">저장된 진단 기록이 없습니다.</p>
              <p className="text-[11px] text-slate-400">
                진단을 완료한 후 상단의 [보관함 저장] 버튼을 누르면 가족별로 결과를 영구 보관할 수 있습니다.
              </p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  onLoadRecord(rec.profile, rec.report);
                  onClose();
                }}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800">{rec.name}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        rec.report.scoreGrade === '안심'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.report.scoreGrade === '보통'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.report.totalScore}점 ({rec.report.scoreGrade})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>
                      만 {rec.profile.age}세 ({rec.profile.gender === 'male' ? '남' : '여'})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-400">
                      <Calendar className="w-3 h-3" /> {rec.savedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleDelete(rec.id, e)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                    title="기록 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
