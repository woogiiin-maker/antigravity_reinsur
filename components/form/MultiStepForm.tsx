'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  FileText,
  HeartPulse,
  User,
  Activity,
  FileCheck,
  Edit3,
  Bookmark,
} from 'lucide-react';
import { CoverageDetails, ExistingPolicy, Gender, UserProfile } from '@/types/insurance';

interface MultiStepFormProps {
  onComplete: (profile: UserProfile, policies: ExistingPolicy[]) => void;
  onOpenSettings?: () => void;
  onOpenSaved?: () => void;
}

const FAMILY_DISEASES = [
  { id: 'cancer', label: '암' },
  { id: 'brain', label: '뇌혈관질환' },
  { id: 'heart', label: '심장질환' },
  { id: 'hypertension', label: '고혈압' },
  { id: 'diabetes', label: '당뇨' },
  { id: 'none', label: '가족력 없음' },
];

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  onComplete,
  onOpenSettings,
  onOpenSaved,
}) => {
  // 모드: 'remodel' (기존 보험 리모델링) vs 'new' (신규 맞춤 가입)
  const [mode, setMode] = useState<'new' | 'remodel'>('remodel');
  const [step, setStep] = useState<number>(1);

  // Step 1: 기본 정보
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<Gender>('male');

  // Step 2: 가족력
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  // Step 3: 기존 가입 보험 정보 (리모델링 모드)
  const [hasExisting, setHasExisting] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // 파싱 및 수동 수정 가능한 기존 보장 상세
  const [insurerName, setInsurerName] = useState<string>('현대해상');
  const [policyName, setPolicyName] = useState<string>('굿앤굿 퍼펙트 건강보험');
  const [monthlyPremium, setMonthlyPremium] = useState<number>(65000);
  const [coverages, setCoverages] = useState<CoverageDetails>({
    cancer: 30000000,
    brain: 10000000,
    heart: 10000000,
    surgery: 5000000,
    indemnity: true,
  });

  // 특정 암/질환 한정 보장 제외 내역 및 알림 상태
  const [excludedCoverages, setExcludedCoverages] = useState<{ name: string; amount: number; reason: string }[]>([]);
  const [coverageAlert, setCoverageAlert] = useState<string | null>(null);

  // 가족력 칩 토글
  const toggleFamilyDisease = (id: string) => {
    if (id === 'none') {
      setFamilyHistory(['none']);
      return;
    }
    const filtered = familyHistory.filter((item) => item !== 'none');
    if (filtered.includes(id)) {
      setFamilyHistory(filtered.filter((item) => item !== id));
    } else {
      setFamilyHistory([...filtered, id]);
    }
  };

  // 파일 처리 및 AI 파싱 공통 함수
  const processFile = async (file: File) => {
    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const localApiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';
      const headers: Record<string, string> = {};
      if (localApiKey) {
        headers['x-gemini-api-key'] = localApiKey;
      }

      const res = await fetch('/api/ocr/parse-policy', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          const d = result.data;
          if (d.insurerName) setInsurerName(d.insurerName);
          if (d.policyName) setPolicyName(d.policyName);
          if (d.monthlyPremium !== undefined) setMonthlyPremium(Number(d.monthlyPremium));
          if (d.coverageDetails) {
            setCoverages({
              cancer: d.coverageDetails.cancer ?? 0,
              brain: d.coverageDetails.brain ?? 0,
              heart: d.coverageDetails.heart ?? 0,
              surgery: d.coverageDetails.surgery ?? 0,
              indemnity: Boolean(d.coverageDetails.indemnity),
            });
          }
          if (d.excludedLimitedCoverages) {
            setExcludedCoverages(d.excludedLimitedCoverages);
          }
          if (d.limitedCoverageAlert) {
            setCoverageAlert(d.limitedCoverageAlert);
          }
        }
      }
    } catch (err) {
      console.error('파일 업로드 분석 오류:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 선택 인풋 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // 드래그앤드롭 핸들러
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 최종 제출
  const handleSubmit = () => {
    const userProfile: UserProfile = {
      age: Number(age),
      gender,
      familyHistory: familyHistory.filter((item) => item !== 'none'),
      hasExistingPolicy: mode === 'remodel' && hasExisting,
    };

    const policies: ExistingPolicy[] =
      mode === 'remodel' && hasExisting
        ? [
            {
              insurerName,
              policyName,
              coverageDetails: coverages,
              monthlyPremium,
              maturityDate: '2055-12-31',
              documentUrl: uploadedFileName ? `/uploads/${uploadedFileName}` : undefined,
              excludedLimitedCoverages: excludedCoverages,
              limitedCoverageAlert: coverageAlert || undefined,
            },
          ]
        : [];

    onComplete(userProfile, policies);
  };

  return (
    <div className="w-full max-w-mobile mx-auto min-h-screen bg-slate-50 flex flex-col justify-between p-4 shadow-xl border-x border-slate-200">
      {/* 상단 네비게이션 & 스텝 프로그레스 */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-5 h-5 text-blue-600 shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-slate-800">건강보험 진단</h1>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Gemini API 키 설정"
              >
                <span>⚙️</span>
                <span className="text-[11px] hidden sm:inline">설정</span>
              </button>
            )}
            {onOpenSaved && (
              <button
                type="button"
                onClick={onOpenSaved}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="진단 결과 보관함"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px]">보관함</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {step}/3
            </span>
          </div>
        </div>

        {/* 진행 게이지바 */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 서비스 목적 선택 탭 (신규 vs 리모델링) */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('remodel');
                setHasExisting(true);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'remodel' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> 기존 보험 리모델링
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('new');
                setHasExisting(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Sparkles className="w-4 h-4" /> 신규 맞춤 가입
            </button>
          </div>
        )}

        {/* 스텝별 동적 인터페이스 애니메이션 */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mt-6 space-y-6"
            >
              <div>
                <span className="text-xs font-semibold text-blue-600">Step 1</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  기본 정보를 알려주세요
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  연령대와 성별에 따라 맞춤 권장 보장 기준이 달라집니다.
                </p>
              </div>

              {/* 성별 선택 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">성별</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      gender === 'male'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" /> 남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      gender === 'female'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" /> 여성
                  </button>
                </div>
              </div>

              {/* 나이 입력 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">나이</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAge((prev) => Math.max(20, prev - 1))}
                      className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-blue-600 min-w-[55px] text-center">
                      만 {age}세
                    </span>
                    <button
                      type="button"
                      onClick={() => setAge((prev) => Math.min(80, prev + 1))}
                      className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 슬라이더 및 정확한 눈금 매칭 */}
                <div className="relative pt-1 pb-5">
                  <input
                    type="range"
                    min={20}
                    max={80}
                    step={1}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 relative z-10"
                  />
                  <div className="relative w-full h-4 mt-1">
                    {[20, 30, 40, 50, 60, 70, 80].map((mark) => {
                      const percent = ((mark - 20) / (80 - 20)) * 100;
                      return (
                        <div
                          key={mark}
                          className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer"
                          style={{ left: `${percent}%` }}
                          onClick={() => setAge(mark)}
                        >
                          <div className={`w-0.5 h-1.5 ${age === mark ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <span
                            className={`text-[10px] mt-0.5 select-none transition-colors ${
                              age === mark ? 'text-blue-600 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {mark}세
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 빠른 연령대 선택 칩 */}
                <div className="flex justify-between gap-1.5">
                  {[
                    { label: '20대', val: 25 },
                    { label: '30대', val: 35 },
                    { label: '40대', val: 45 },
                    { label: '50대', val: 50 },
                    { label: '60대', val: 65 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAge(p.val)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                        Math.floor(age / 10) * 10 === Math.floor(p.val / 10) * 10
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mt-6 space-y-6"
            >
              <div>
                <span className="text-xs font-semibold text-blue-600">Step 2</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  가족력이 있으신가요?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  직계 가족의 주요 병력을 기반으로 집중 보완 특약을 설계합니다.
                </p>
              </div>

              {/* 칩 다중 선택 UI */}
              <div className="grid grid-cols-2 gap-2.5">
                {FAMILY_DISEASES.map((disease) => {
                  const isSelected = familyHistory.includes(disease.id);
                  return (
                    <button
                      key={disease.id}
                      type="button"
                      onClick={() => toggleFamilyDisease(disease.id)}
                      className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{disease.label}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {familyHistory.some((item) => item !== 'none') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    선택하신 가족력 질환에 대해 해당 진단비 권장 한도가 자동으로{' '}
                    <span className="font-bold">최대 1.5배</span> 강화 적용됩니다.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mt-6 space-y-5"
            >
              <div>
                <span className="text-xs font-semibold text-blue-600">Step 3</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  {mode === 'remodel' ? '기존 가입 보험 입력' : '기존 보험 유무 확인'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'remodel'
                    ? '증권 사진/PDF를 올리시면 AI가 핵심 보장을 즉시 자동 분석합니다.'
                    : '현재 가입된 보험이 없는 상태에서 신규 최적 플랜을 설계합니다.'}
                </p>
              </div>

              {mode === 'remodel' ? (
                <div className="space-y-4">
                  {/* 증권 파일 업로드 존 (클릭 및 드래그앤드롭 지원) */}
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-5 transition-all text-center ${
                      isDragging
                        ? 'border-blue-600 bg-blue-100/70 ring-4 ring-blue-300/50'
                        : 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-blue-700">
                            AI가 증권 내역을 정밀 분석 중입니다...
                          </span>
                        </div>
                      ) : uploadedFileName ? (
                        <div className="flex flex-col items-center gap-1.5 text-blue-700 py-1">
                          <FileCheck className="w-7 h-7 text-emerald-600" />
                          <span className="text-xs font-bold truncate max-w-[250px]">
                            {uploadedFileName} 분석 완료
                          </span>
                          <span className="text-[10px] text-slate-400">
                            다른 파일을 끌어다 놓거나 탭하여 변경 가능
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className={`w-8 h-8 mb-2 transition-transform ${isDragging ? 'scale-110 text-blue-700' : 'text-blue-500'}`} />
                          <span className="text-xs font-bold text-slate-700">
                            {isDragging ? '여기에 파일을 놓아주세요!' : '보험증권 사진 또는 PDF 드래그 & 업로드'}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">
                            파일을 끌어다 놓거나 탭하여 선택 (PDF / 이미지 지원)
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* 한정 보장 자동 제외 안내 배너 */}
                  {excludedCoverages.length > 0 && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>한정 보장 자동 필터링 완료 (순수 일반 진단비 원칙)</span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        어떤 질병이든 100% 보장하는 순수 진단비 기준에 미달하는 부위·특정질환 한정 특약이 감지되어 진단 대상에서 자동 제외되었습니다:
                      </p>
                      <div className="space-y-1 pt-0.5">
                        {excludedCoverages.map((ex, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-xl border border-rose-100 flex flex-col gap-0.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 line-through">
                                {ex.name}
                              </span>
                              <span className="font-extrabold text-rose-600 text-[11px]">
                                {(ex.amount / 10000).toLocaleString()}만원 (제외됨)
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              사유: {ex.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 추출/수정 가능한 보장 세부 폼 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" /> 가입 내역 검수 및 직접 수정
                      </span>
                      <span className="text-[11px] text-slate-400">직접 수정 가능</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-slate-500 font-medium">보험사</label>
                        <input
                          type="text"
                          value={insurerName}
                          onChange={(e) => setInsurerName(e.target.value)}
                          className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-medium">월 납입 보험료(원)</label>
                        <input
                          type="number"
                          step={1000}
                          value={monthlyPremium}
                          onChange={(e) => setMonthlyPremium(Number(e.target.value))}
                          className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-500 text-xs font-medium">주요 보장 가입금액</label>
                        <span className="text-[10px] text-blue-600 font-medium">※ 순수 일반 진단비만 인정</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">암 진단비</span>
                            <span className="text-[10px] text-blue-700 bg-blue-100 px-1 py-0.5 rounded font-medium">순수 일반암</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step={5000000}
                              value={coverages.cancer}
                              onChange={(e) =>
                                setCoverages({ ...coverages, cancer: Number(e.target.value) })
                              }
                              className="w-24 text-right p-1 font-bold border border-slate-200 rounded"
                            />
                            <span className="text-slate-500">원</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">뇌혈관 진단비</span>
                            <span className="text-[10px] text-blue-700 bg-blue-100 px-1 py-0.5 rounded font-medium">뇌혈관 전체</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step={5000000}
                              value={coverages.brain}
                              onChange={(e) =>
                                setCoverages({ ...coverages, brain: Number(e.target.value) })
                              }
                              className="w-24 text-right p-1 font-bold border border-slate-200 rounded"
                            />
                            <span className="text-slate-500">원</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">심장질환 진단비</span>
                            <span className="text-[10px] text-blue-700 bg-blue-100 px-1 py-0.5 rounded font-medium">허혈성 전체</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step={5000000}
                              value={coverages.heart}
                              onChange={(e) =>
                                setCoverages({ ...coverages, heart: Number(e.target.value) })
                              }
                              className="w-24 text-right p-1 font-bold border border-slate-200 rounded"
                            />
                            <span className="text-slate-500">원</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="font-semibold text-slate-700">실손의료비</span>
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                            <input
                              type="checkbox"
                              checked={coverages.indemnity}
                              onChange={(e) =>
                                setCoverages({ ...coverages, indemnity: e.target.checked })
                              }
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{coverages.indemnity ? '가입됨' : '미가입'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      신규 맞춤 추천 모드
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      현재 가입된 보험이 없는 상태에서, 만 {age}세 {gender === 'male' ? '남성' : '여성'}에게
                      가장 유리한 청년·종합 보험 라인업을 진단합니다.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 컨트롤 버튼 */}
      <div className="pt-6 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <span>다음 단계</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>진단 및 리모델링 리포트 확인</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
