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
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileStack,
  Layers,
  Coins,
} from 'lucide-react';
import { CoverageDetails, ExistingPolicy, Gender, UserProfile } from '@/types/insurance';
import { parseMultiplePolicyFiles, generateSecureId } from '@/lib/ocr/clientParser';

interface MultiStepFormProps {
  onComplete: (profile: UserProfile, policies: ExistingPolicy[]) => void;
  onOpenSettings?: () => void;
  onOpenSaved?: () => void;
  onOpenGuideline?: () => void;
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
  onOpenGuideline,
}) => {
  // 모드: 'remodel' (기존 보험 리모델링) vs 'new' (신규 맞춤 가입)
  const [mode, setMode] = useState<'new' | 'remodel'>('remodel');
  const [step, setStep] = useState<number>(1);

  // Step 1: 기본 정보
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<Gender>('male');
  const [isFetus, setIsFetus] = useState<boolean>(false);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number>(16);

  // Step 2: 가족력
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  // Step 3: 기존 가입 보험 정보 (다중 증권 지원)
  const [hasExisting, setHasExisting] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  // 증권 업로드 시 자동 감지된 나이/성별 피드백 상태
  const [autoDetectedAlert, setAutoDetectedAlert] = useState<{
    name?: string;
    age: number;
    gender: Gender;
    isGenderUnknown?: boolean;
    genderInferredFrom?: string;
    count: number;
    insurer: string;
  } | null>(null);
  const [showManualAgeInput, setShowManualAgeInput] = useState<boolean>(false);

  // 등록된 기존 가입 보험 증권 목록 (초기에는 빈 배열, 업로드 시에만 표시)
  const [existingPolicies, setExistingPolicies] = useState<ExistingPolicy[]>([]);

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

  // 다중 파일 초고속 병렬 처리 및 AI 파싱 함수
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const parsed = await parseMultiplePolicyFiles(files, (cur, tot) => {
        setUploadProgress({ current: cur, total: tot });
      });

      if (parsed.length > 0) {
        // 증권에서 피보험자 나이와 성별 자동 추출 반영 (일괄 동기화된 대표값 사용)
        const representativeWithAge = parsed.find((p) => p.insuredAge && p.insuredAge > 0);
        const representativeWithGender = parsed.find((p) => p.insuredGender && !p.isGenderUnknown);
        const representativeWithName = parsed.find((p) => p.insuredName && p.insuredName.trim().length > 1);

        const detectedAge = representativeWithAge?.insuredAge || parsed[0]?.insuredAge || age;
        const detectedGender = representativeWithGender?.insuredGender || parsed[0]?.insuredGender || gender;
        const detectedName = representativeWithName?.insuredName || parsed[0]?.insuredName;

        setAge(detectedAge);
        setGender(detectedGender);

        setAutoDetectedAlert({
          name: detectedName,
          age: detectedAge,
          gender: detectedGender,
          isGenderUnknown: !representativeWithGender,
          genderInferredFrom: representativeWithGender?.genderInferredFrom || parsed[0]?.genderInferredFrom,
          count: parsed.length,
          insurer: parsed[0]?.insurerName || '보험사',
        });

        setExistingPolicies((prev) => {
          // 기존에 기본 샘플 1개만 있고 아직 사용자가 직접 올린 적 없다면 새 파일들로 교체
          if (prev.length === 1 && prev[0].id === 'default-policy-1') {
            return parsed;
          }
          return [...prev, ...parsed];
        });

        // 리모델링 모드로 확실히 세팅
        setMode('remodel');
        setHasExisting(true);
      }
    } catch (err) {
      console.error('다중 증권 파싱 오류:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // 파일 선택 인풋 핸들러 (다중 파일 지원)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // 드래그앤드롭 핸들러 (다중 파일 지원)
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // 증권 삭제
  const handleRemovePolicy = (id?: string) => {
    if (!id) return;
    setExistingPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  // 증권 수동 수정
  const handleUpdatePolicy = (id: string, updated: Partial<ExistingPolicy>) => {
    setExistingPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  // 신규 증권 직접 추가
  const handleAddManualPolicy = () => {
    const newPolicy: ExistingPolicy = {
      id: generateSecureId('policy'),
      insurerName: '보험사 직접입력',
      policyName: '추가 건강보험',
      monthlyPremium: 45000,
      coverageDetails: {
        cancer: 30000000,
        brain: 20000000,
        heart: 20000000,
        surgery: 5000000,
        indemnity: false,
      },
      documentUrl: '직접 입력',
      excludedLimitedCoverages: [],
    };
    setExistingPolicies((prev) => [...prev, newPolicy]);
    setEditingPolicyId(newPolicy.id!);
  };

  // 전체 합산 통계 계산
  const totalMonthlyPremium = existingPolicies.reduce((sum, p) => sum + (Number(p.monthlyPremium) || 0), 0);
  const totalCancer = existingPolicies.reduce((sum, p) => sum + (p.coverageDetails?.cancer || 0), 0);
  const totalBrain = existingPolicies.reduce((sum, p) => sum + (p.coverageDetails?.brain || 0), 0);
  const totalHeart = existingPolicies.reduce((sum, p) => sum + (p.coverageDetails?.heart || 0), 0);
  const totalSurgery = existingPolicies.reduce((sum, p) => sum + (p.coverageDetails?.surgery || 0), 0);
  const hasIndemnity = existingPolicies.some((p) => p.coverageDetails?.indemnity);
  const allExcludedCoverages = existingPolicies.flatMap((p) => p.excludedLimitedCoverages || []);

  // 최종 제출
  const handleSubmit = () => {
    const userProfile: UserProfile = {
      age: isFetus ? -1 : Number(age),
      gender,
      familyHistory: familyHistory.filter((item) => item !== 'none'),
      hasExistingPolicy: mode === 'remodel' && hasExisting && existingPolicies.length > 0,
      isFetus,
      pregnancyWeeks: isFetus ? pregnancyWeeks : undefined,
    };

    const policies: ExistingPolicy[] =
      mode === 'remodel' && hasExisting ? existingPolicies : [];

    onComplete(userProfile, policies);
  };


  return (
    <div className="w-full max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 shadow-xl border-x border-slate-200 lg:rounded-3xl lg:my-6">
      {/* 상단 네비게이션 & 스텝 프로그레스 */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 hover:opacity-85 transition-all text-left cursor-pointer group"
            title="클릭 시 처음 화면으로 이동합니다"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                건강보험 진단
              </h1>
            </div>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenGuideline && (
              <button
                type="button"
                onClick={onOpenGuideline}
                className="px-2 sm:px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200/80 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="보험 핵심 16개 특약 권장 보장금액 요약표 보기"
              >
                <span>📋</span>
                <span className="text-[11px] font-extrabold">표준 가이드</span>
              </button>
            )}
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
                <span className="text-[11px] hidden sm:inline">보관함</span>
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
              className="mt-5 space-y-5"
            >
              {mode === 'new' ? (
                /* [신규 맞춤 가입 모드] 증권 업로드 없이 직접 나이/성별 입력 */
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-blue-600">Step 1</span>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">
                      기본 정보를 알려주세요
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      태아부터 시니어까지 전 보험사 및 유튜브 전문가 분석 기준에 맞춰 최적 플랜을 설계합니다.
                    </p>
                  </div>

                  {/* 빠른 생애주기/연령대 선택 칩 (태아 포함) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">생애주기 선택</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFetus(true);
                          setAge(0);
                        }}
                        className={`py-2 px-1 text-center text-xs font-extrabold rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isFetus
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm">👶</span>
                        <span className="text-[11px]">태아</span>
                      </button>

                      {[
                        { label: '0~10대', val: 7, text: '어린이' },
                        { label: '20대', val: 25, text: '청년' },
                        { label: '30대', val: 35, text: '가장' },
                        { label: '40대', val: 45, text: '경제' },
                        { label: '50대', val: 55, text: '발병집중' },
                        { label: '60대+', val: 65, text: '시니어' },
                      ].map((p) => {
                        const isSelected =
                          !isFetus &&
                          (p.val === 7
                            ? age <= 18
                            : Math.floor(age / 10) * 10 === Math.floor(p.val / 10) * 10);
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setIsFetus(false);
                              setAge(p.val);
                            }}
                            className={`py-2 px-1 text-center rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm ring-2 ring-blue-100 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xs font-bold">{p.label}</span>
                            <span className="text-[10px] text-slate-400">{p.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 태아 모드 선택 시 특별 안내 및 임신 주차 설정 */}
                  {isFetus ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-300 rounded-2xl space-y-3 shadow-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                          👶
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-amber-950">
                            태아보험(출산 전) 맞춤 가입 모드
                          </h3>
                          <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                            <span className="font-extrabold text-amber-900 underline">임신 22주 이내</span> 가입 시 선천이상 수술비, 신생아/미숙아 인큐베이터 입원일당이 100% 보장됩니다.
                          </p>
                        </div>
                      </div>

                      {/* 임신 주차 슬라이더 */}
                      <div className="space-y-1.5 pt-1 border-t border-amber-200/70">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-amber-900">현재 임신 주수</span>
                          <span className="font-extrabold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                            {pregnancyWeeks}주차 {pregnancyWeeks <= 22 ? '⚡ 태아특약 가입가능' : '⚠️ 일반자녀보험 가입'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={4}
                          max={36}
                          step={1}
                          value={pregnancyWeeks}
                          onChange={(e) => setPregnancyWeeks(Number(e.target.value))}
                          className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <div className="flex justify-between text-[10px] text-amber-700 font-medium">
                          <span>초기 (4주)</span>
                          <span className="font-bold text-rose-600">★ 22주 이내 필수</span>
                          <span>만삭 (36주)</span>
                        </div>
                      </div>

                      {/* 성별 선택 (태아 산출 팁 제공) */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-amber-950">태아 성별 (출산 전 기준)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setGender('male')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              gender === 'male'
                                ? 'border-blue-600 bg-white text-blue-700 shadow-sm ring-1 ring-blue-300'
                                : 'border-amber-200 bg-white/70 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <span>👦 남아 (출산 전 표준 산출)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              gender === 'female'
                                ? 'border-rose-500 bg-white text-rose-600 shadow-sm ring-1 ring-rose-300'
                                : 'border-amber-200 bg-white/70 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <span>👧 여아 (출생 후 정산/환급)</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-amber-800/80 leading-tight">
                          💡 <b>전문가 팁:</b> 태아보험은 출생 전 보통 남아 기준으로 보험료가 책정되며, 출생 후 여아일 경우 차액이 환급되고 월 보험료가 자동 인하됩니다.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    /* 일반 연령 및 성별 선택 */
                    <div className="space-y-4">
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

                      {/* 나이 입력 (0세부터 80세까지 슬라이더 지원) */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700">나이</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAge((prev) => Math.max(0, prev - 1))}
                              className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <span className="text-sm font-extrabold text-blue-600 min-w-[75px] text-center">
                              {age === 0 ? '0세 (영유아)' : age <= 18 ? `만 ${age}세 (어린이)` : `만 ${age}세`}
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

                        {/* 슬라이더 및 정확한 눈금 매칭 (0세 ~ 80세) */}
                        <div className="relative pt-1 pb-5">
                          <input
                            type="range"
                            min={0}
                            max={80}
                            step={1}
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 relative z-10"
                          />
                          <div className="relative w-full h-4 mt-1">
                            {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((mark) => {
                              const percent = (mark / 80) * 100;
                              return (
                                <div
                                  key={mark}
                                  className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer"
                                  style={{ left: `${percent}%` }}
                                  onClick={() => setAge(mark)}
                                >
                                  <div className={`w-0.5 h-1.5 ${age === mark ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                  <span
                                    className={`text-[9.5px] mt-0.5 select-none transition-colors ${
                                      age === mark ? 'text-blue-600 font-bold' : 'text-slate-400'
                                    }`}
                                  >
                                    {mark === 0 ? '0세' : `${mark}세`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* [기존 보험 리모델링 모드] 증권 업로드 + 나이 자동인식 + 인식 결과 수정 */
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-600">Step 1</span>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">
                      기존 보험증권을 올려주세요
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF나 사진을 올리시면 <span className="font-bold text-blue-600">나이와 보장내역이 3초 만에 자동 분석</span>됩니다.
                    </p>
                  </div>

                  {/* PC 2열 반응형 그리드 래퍼 */}
                  <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
                    {/* 좌측: 업로드 존 & 설정 배너 */}
                    <div className="lg:col-span-6 xl:col-span-7 space-y-4">

                  {/* 증권 파일 다중 업로드 존 */}
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-5 transition-all text-center shadow-xs cursor-pointer ${
                      isDragging
                        ? 'border-blue-600 bg-blue-100/70 ring-4 ring-blue-300/50'
                        : 'border-blue-300 hover:border-blue-500 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 hover:bg-blue-50'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                      <input
                        type="file"
                        multiple
                        accept="application/pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-blue-700">
                            {uploadProgress
                              ? `총 ${uploadProgress.total}개 증권 중 ${uploadProgress.current}개 초고속 분석 중...`
                              : '피보험자 나이 및 핵심 보장 분석 중...'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            피보험자 연령/성별 자동 추출 및 9대 핵심 보장 분류 중
                          </span>
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md shadow-blue-200">
                            <Upload
                              className={`w-6 h-6 transition-transform ${
                                isDragging ? 'scale-125' : ''
                              }`}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            {isDragging
                              ? '여기에 증권을 놓아주세요!'
                              : '보험증권 PDF / 사진 한번에 여러 개 올리기'}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1 max-w-[280px]">
                            스마트폰 사진이나 PDF 파일을 드래그하거나 터치하여 선택하세요.
                          </span>
                          <div className="mt-3 flex flex-wrap justify-center items-center gap-1.5 text-[10px] text-blue-700 font-semibold bg-white/90 px-3 py-1 rounded-full border border-blue-200">
                            <span>⚡ 나이·성별 자동 추출</span>
                            <span>•</span>
                            <span>남녀특정암 등 한정보장 자동 필터링</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* 정밀 인식 안내 배너 */}
                  {onOpenSettings && (
                    <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-900">
                      <span>💡 사진/스캔 증권의 AI 인식률을 100%로 높이시려면?</span>
                      <button
                        type="button"
                        onClick={onOpenSettings}
                        className="font-bold text-blue-700 underline shrink-0 ml-1 cursor-pointer"
                      >
                        무료 API키 설정
                      </button>
                    </div>
                  )}
                </div>

                {/* 우측: 인식 결과 배너, 등록된 증권 목록 및 나이/성별 조정 */}
                <div className="lg:col-span-6 xl:col-span-5 space-y-4">
                  {/* 증권 자동 인식 완료 배너 및 즉시 진단 버튼 */}
                  {autoDetectedAlert && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-xs font-bold text-emerald-900">
                            피보험자 정보와 증권 {autoDetectedAlert.count}건 자동 추출 완료!
                          </h4>

                          {/* 성별 추정 근거 또는 미확인 안내 */}
                          {autoDetectedAlert.isGenderUnknown ? (
                            <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-center justify-between gap-2">
                              <span>⚠️ 증권에서 성별이 명확하지 않습니다. 성별을 선택해 주세요:</span>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setGender('male')}
                                  className={`px-2 py-0.5 rounded-lg font-bold text-xs transition-all ${
                                    gender === 'male'
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-white border border-slate-300 text-slate-700'
                                  }`}
                                >
                                  👨 남성
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGender('female')}
                                  className={`px-2 py-0.5 rounded-lg font-bold text-xs transition-all ${
                                    gender === 'female'
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'bg-white border border-slate-300 text-slate-700'
                                  }`}
                                >
                                  👩 여성
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-800">
                              <span>
                                인식된 피보험자:{' '}
                                {autoDetectedAlert.name && (
                                  <span className="font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded mr-1">
                                    👤 {autoDetectedAlert.name} 님
                                  </span>
                                )}
                                <span className="font-extrabold text-emerald-950">만 {age}세 ({gender === 'male' ? '남성' : '여성'})</span>
                                {autoDetectedAlert.genderInferredFrom && (
                                  <span className="text-[10px] text-emerald-700 ml-1">
                                    ({autoDetectedAlert.genderInferredFrom})
                                  </span>
                                )}
                              </span>
                              {/* 언제든 원터치로 변경 가능한 성별 스위처 */}
                              <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-emerald-200">
                                <button
                                  type="button"
                                  onClick={() => setGender('male')}
                                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
                                    gender === 'male'
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  👨 남성
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGender('female')}
                                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
                                    gender === 'female'
                                      ? 'bg-rose-500 text-white shadow-2xs'
                                      : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  👩 여성
                                </button>
                              </div>
                            </div>
                          )}

                          <p className="text-[10.5px] text-emerald-800/80 leading-relaxed">
                            나이와 보장금액이 실제와 다를 경우 아래 증권 카드의 <b>[수정]</b>을 눌러 바로 고치실 수 있습니다.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          바로 AI 맞춤 진단 결과 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-3 py-2.5 bg-white hover:bg-emerald-100/50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all cursor-pointer"
                        >
                          가족력 설정 &gt;
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* 인식된 증권 목록 및 실시간 금액 확인/수정 섹션 */}
                  {existingPolicies.length > 0 && (
                    <div className="border border-slate-200 bg-white rounded-2xl p-3.5 space-y-2.5">
                      <div className="flex flex-wrap justify-between items-center gap-1">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileStack className="w-4 h-4 text-blue-600" />
                          등록된 증권 ({existingPolicies.length}건)
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span>만 {age}세</span>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setGender('male')}
                              className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                                gender === 'male' ? 'bg-blue-600 text-white' : 'text-slate-600'
                              }`}
                            >
                              남성
                            </button>
                            <button
                              type="button"
                              onClick={() => setGender('female')}
                              className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                                gender === 'female' ? 'bg-rose-500 text-white' : 'text-slate-600'
                              }`}
                            >
                              여성
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10.5px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        🔍 인식이 덜 되었거나 수정이 필요한 항목은 아래 증권 카드의 <b>[수정]</b>을 눌러 바로 금액을 고칠 수 있습니다.
                      </p>

                      <div className="space-y-2 pt-1">
                        {existingPolicies.map((pol) => {
                          const isEditing = editingPolicyId === pol.id;
                          return (
                            <div
                              key={pol.id}
                              className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 text-xs"
                            >
                              <div className="p-3 flex justify-between items-center">
                                <div>
                                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-extrabold">
                                      {pol.insurerName}
                                    </span>
                                    <span>{pol.policyName}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                                    {pol.insuredName && (
                                      <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px]">
                                        피보험자: {pol.insuredName}
                                      </span>
                                    )}
                                    <span>월 {Number(pol.monthlyPremium).toLocaleString()}원</span>
                                    <span>• 암 {(pol.coverageDetails.cancer / 10000).toLocaleString()}만</span>
                                    <span>• 뇌 {(pol.coverageDetails.brain / 10000).toLocaleString()}만</span>
                                    <span>• 심 {(pol.coverageDetails.heart / 10000).toLocaleString()}만</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingPolicyId(isEditing ? null : pol.id!)}
                                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-blue-600 transition-colors cursor-pointer"
                                  >
                                    {isEditing ? '완료' : '수정'}
                                  </button>
                                  {existingPolicies.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePolicy(pol.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                      title="증권 삭제"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* 인라인 수정 폼 */}
                              {isEditing && (
                                <div className="p-3 bg-white border-t border-slate-200 space-y-2.5 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] text-slate-500">보험사명</label>
                                      <input
                                        type="text"
                                        value={pol.insurerName}
                                        onChange={(e) =>
                                          handleUpdatePolicy(pol.id!, { insurerName: e.target.value })
                                        }
                                        className="w-full mt-0.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-500">월 보험료(원)</label>
                                      <input
                                        type="number"
                                        step={1000}
                                        value={pol.monthlyPremium}
                                        onChange={(e) =>
                                          handleUpdatePolicy(pol.id!, { monthlyPremium: Number(e.target.value) })
                                        }
                                        className="w-full mt-0.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                                    <div>
                                      <label className="text-[10px] text-slate-500">일반암 진단비</label>
                                      <input
                                        type="number"
                                        step={5000000}
                                        value={pol.coverageDetails.cancer}
                                        onChange={(e) =>
                                          handleUpdatePolicy(pol.id!, {
                                            coverageDetails: {
                                              ...pol.coverageDetails,
                                              cancer: Number(e.target.value),
                                            },
                                          })
                                        }
                                        className="w-full mt-0.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-500">뇌혈관 진단비</label>
                                      <input
                                        type="number"
                                        step={5000000}
                                        value={pol.coverageDetails.brain}
                                        onChange={(e) =>
                                          handleUpdatePolicy(pol.id!, {
                                            coverageDetails: {
                                              ...pol.coverageDetails,
                                              brain: Number(e.target.value),
                                            },
                                          })
                                        }
                                        className="w-full mt-0.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-500">허혈심장 진단비</label>
                                      <input
                                        type="number"
                                        step={5000000}
                                        value={pol.coverageDetails.heart}
                                        onChange={(e) =>
                                          handleUpdatePolicy(pol.id!, {
                                            coverageDetails: {
                                              ...pol.coverageDetails,
                                              heart: Number(e.target.value),
                                            },
                                          })
                                        }
                                        className="w-full mt-0.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setEditingPolicyId(null)}
                                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                                  >
                                    수정 완료
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 나이/성별 수동 수정 또는 서류 없이 진행하기 토글 */}
                  <div className="border border-slate-200 rounded-2xl bg-white p-3.5 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowManualAgeInput((prev) => !prev)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        피보험자 나이/성별 직접 수정하기
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {showManualAgeInput ? '접기 ▲' : `만 ${age}세 / ${gender === 'male' ? '남성' : '여성'} 펼치기 ▼`}
                      </span>
                    </button>

                    {showManualAgeInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 border-t border-slate-100 space-y-4"
                      >
                        {/* 성별 선택 */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">성별</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setGender('male')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                gender === 'male'
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <User className="w-3.5 h-3.5" /> 남성
                            </button>
                            <button
                              type="button"
                              onClick={() => setGender('female')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                gender === 'female'
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <User className="w-3.5 h-3.5" /> 여성
                            </button>
                          </div>
                        </div>

                        {/* 나이 입력 */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-700">나이</label>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setAge((prev) => Math.max(20, prev - 1))}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="text-sm font-extrabold text-blue-600 min-w-[50px] text-center">
                                만 {age}세
                              </span>
                              <button
                                type="button"
                                onClick={() => setAge((prev) => Math.min(80, prev + 1))}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <input
                            type="range"
                            min={0}
                            max={80}
                            step={1}
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />

                          <div className="flex justify-between gap-1">
                            {[
                              { label: '0세', val: 0 },
                              { label: '어린이', val: 7 },
                              { label: '20대', val: 25 },
                              { label: '30대', val: 35 },
                              { label: '40대', val: 45 },
                              { label: '50대', val: 50 },
                              { label: '60대+', val: 65 },
                            ].map((p) => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setAge(p.val)}
                                className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  Math.floor(age / 10) * 10 === Math.floor(p.val / 10) * 10
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  {isFetus ? '부모 및 가족의 주요 병력이 있으신가요?' : '가족력이 있으신가요?'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isFetus
                    ? '부모의 가족력을 기반으로 태아 및 출생 자녀의 관련 질환 보장을 집중 보강합니다.'
                    : '직계 가족의 주요 병력을 기반으로 집중 보완 특약을 설계합니다.'}
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
                    선택하신 가족력 질환에 대해 해당 진단비 및 치료비 권장 한도가 자동으로{' '}
                    <span className="font-bold">최대 1.5배</span> 강화 적용되며, 관련 특화 상품이 1순위로 추천됩니다.
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
                  {/* 증권 파일 다중 업로드 존 (클릭 및 드래그앤드롭 지원) */}
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center ${
                      isDragging
                        ? 'border-blue-600 bg-blue-100/70 ring-4 ring-blue-300/50'
                        : 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                      <input
                        type="file"
                        multiple
                        accept="application/pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 py-3">
                          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-blue-700">
                            {uploadProgress
                              ? `총 ${uploadProgress.total}개 증권 중 ${uploadProgress.current}개 초고속 병렬 분석 중...`
                              : '증권 내역을 정밀 분석 중입니다...'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            대용량 최적화 엔진 적용 (수초 내 완료)
                          </span>
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center">
                          <Upload
                            className={`w-8 h-8 mb-2 transition-transform ${
                              isDragging ? 'scale-110 text-blue-700' : 'text-blue-500'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {isDragging
                              ? '여기에 파일들을 놓아주세요!'
                              : '보험증권 PDF / 사진 한번에 여러 개 업로드'}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-1">
                            여러 개 증권 PDF를 동시에 드래그하거나 선택할 수 있습니다.
                          </span>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-600 font-medium bg-white px-2.5 py-1 rounded-full border border-blue-200">
                            <span>⚡ 대용량 자동 최적화</span>
                            <span>•</span>
                            <span>순수 진단비 자동 분류</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* 등록된 증권 합산 요약 대시보드 */}
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-4 shadow-md space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-blue-100">
                        <FileStack className="w-4 h-4 text-blue-300" />
                        가입 증권 합산 보장 현황 (총 {existingPolicies.length}건)
                      </span>
                      <span className="text-sm font-extrabold text-amber-300">
                        월 {totalMonthlyPremium.toLocaleString()}원
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] pt-1">
                      <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                        <span className="text-blue-200 block text-[10px]">순수 일반암 합계</span>
                        <span className="font-bold text-white">{(totalCancer / 10000).toLocaleString()}만원</span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                        <span className="text-blue-200 block text-[10px]">뇌혈관 전체 합계</span>
                        <span className="font-bold text-white">{(totalBrain / 10000).toLocaleString()}만원</span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                        <span className="text-blue-200 block text-[10px]">허혈성 심장 합계</span>
                        <span className="font-bold text-white">{(totalHeart / 10000).toLocaleString()}만원</span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                        <span className="text-blue-200 block text-[10px]">실손 / 수술비</span>
                        <span className="font-bold text-white">
                          {hasIndemnity ? '실비보유' : '실비없음'} / {(totalSurgery / 10000).toLocaleString()}만
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 한정 보장 자동 제외 안내 배너 */}
                  {allExcludedCoverages.length > 0 && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>한정 보장 자동 필터링 완료 (순수 일반 진단비 원칙)</span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        등록하신 증권에서 부위·특정질환 한정 특약이 감지되어 순수 진단비에서 제외되었습니다:
                      </p>
                      <div className="space-y-1 pt-0.5">
                        {allExcludedCoverages.map((ex, idx) => (
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

                  {/* 개별 증권 카드 목록 및 수정/삭제 인터페이스 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" /> 개별 가입 증권 내역 ({existingPolicies.length}개)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddManualPolicy}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>직접 증권 추가</span>
                      </button>
                    </div>

                    {existingPolicies.map((pol, idx) => {
                      const isEditing = editingPolicyId === pol.id;
                      return (
                        <div
                          key={pol.id || idx}
                          className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                        >
                          {/* 증권 헤더 요약 */}
                          <div className="p-3.5 flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                  {pol.insurerName}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800">
                                  {pol.policyName}
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2 text-[10px]">
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  암 {((pol.coverageDetails?.cancer || 0) / 10000).toLocaleString()}만
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  뇌 {((pol.coverageDetails?.brain || 0) / 10000).toLocaleString()}만
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  심장 {((pol.coverageDetails?.heart || 0) / 10000).toLocaleString()}만
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  수술 {((pol.coverageDetails?.surgery || 0) / 10000).toLocaleString()}만
                                </span>
                                {pol.coverageDetails?.indemnity && (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold">
                                    실손
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-xs font-extrabold text-blue-600">
                                {pol.monthlyPremium.toLocaleString()}원/월
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingPolicyId(isEditing ? null : pol.id!)}
                                  className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                                >
                                  {isEditing ? '완료' : '수정'}
                                </button>
                                {existingPolicies.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePolicy(pol.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                    title="증권 삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 개별 증권 인라인 수정 모드 */}
                          {isEditing && (
                            <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2.5 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-500 font-medium">보험사명</label>
                                  <input
                                    type="text"
                                    value={pol.insurerName}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, { insurerName: e.target.value })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 font-medium">상품명</label>
                                  <input
                                    type="text"
                                    value={pol.policyName}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, { policyName: e.target.value })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-500 font-medium">월 납입보험료(원)</label>
                                  <input
                                    type="number"
                                    step={1000}
                                    value={pol.monthlyPremium}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, { monthlyPremium: Number(e.target.value) })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 font-medium">실손의료비 가입</label>
                                  <label className="flex items-center gap-2 mt-2 font-bold cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(pol.coverageDetails?.indemnity)}
                                      onChange={(e) =>
                                        handleUpdatePolicy(pol.id!, {
                                          coverageDetails: {
                                            ...pol.coverageDetails,
                                            indemnity: e.target.checked,
                                          },
                                        })
                                      }
                                      className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <span className="text-xs">
                                      {pol.coverageDetails?.indemnity ? '실비 가입됨' : '미가입'}
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {/* 담보별 보장금액 수정 */}
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                                <div>
                                  <label className="text-[10px] text-slate-500">일반암 진단비</label>
                                  <input
                                    type="number"
                                    step={5000000}
                                    value={pol.coverageDetails?.cancer || 0}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, {
                                        coverageDetails: {
                                          ...pol.coverageDetails,
                                          cancer: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500">뇌혈관질환 진단비</label>
                                  <input
                                    type="number"
                                    step={5000000}
                                    value={pol.coverageDetails?.brain || 0}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, {
                                        coverageDetails: {
                                          ...pol.coverageDetails,
                                          brain: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500">허혈성심장 진단비</label>
                                  <input
                                    type="number"
                                    step={5000000}
                                    value={pol.coverageDetails?.heart || 0}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, {
                                        coverageDetails: {
                                          ...pol.coverageDetails,
                                          heart: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500">질병/상해 수술비</label>
                                  <input
                                    type="number"
                                    step={5000000}
                                    value={pol.coverageDetails?.surgery || 0}
                                    onChange={(e) =>
                                      handleUpdatePolicy(pol.id!, {
                                        coverageDetails: {
                                          ...pol.coverageDetails,
                                          surgery: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
