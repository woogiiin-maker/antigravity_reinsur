'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle,
  Sparkles,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Coins,
  Check,
  Filter,
  Upload,
  Plus,
  Trash2,
  FileStack,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Home,
  HeartPulse,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  DiagnosisReport,
  UserProfile,
  ExistingPolicy,
  ProposedComparisonResult,
  COVERAGE_CATEGORIES,
} from '@/types/insurance';
import { compareProposedPolicies, calculateRecommendedCoverages } from '@/lib/engine/diagnosis';
import { parseMultiplePolicyFiles, generateSecureId } from '@/lib/ocr/clientParser';
import { Bookmark } from 'lucide-react';

interface DiagnosisReportViewProps {
  report: DiagnosisReport;
  profile: UserProfile;
  existingPolicies?: ExistingPolicy[];
  onReset: () => void;
  onOpenSettings?: () => void;
  onOpenSaved?: () => void;
}

export const DiagnosisReportView: React.FC<DiagnosisReportViewProps> = ({
  report,
  profile,
  existingPolicies = [],
  onReset,
  onOpenSettings,
  onOpenSaved,
}) => {
  // 개별 보장 항목 펼침 (출처 분해 및 조건부 제외 내역 아코디언)
  const [expandedGapKey, setExpandedGapKey] = useState<string | null>(null);

  // 제안/견적받은 보험 추가 및 보완 효과 비교 상태
  const [showProposalSection, setShowProposalSection] = useState<boolean>(false);
  const [proposedPolicies, setProposedPolicies] = useState<ExistingPolicy[]>([]);
  const [isUploadingProposal, setIsUploadingProposal] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<ProposedComparisonResult | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key =
        localStorage.getItem('gemini_api_key') ||
        localStorage.getItem('geminiApiKey') ||
        localStorage.getItem('GEMINI_API_KEY') ||
        '';
      setHasApiKey(Boolean(key && key.trim().length > 10));
    }
  }, []);

  // 제안받은 보험 파일 일괄 처리 로직 (파일 선택 및 드래그앤드롭 공용 - Gemini API 정밀 분석 연동)
  const processProposalFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setIsUploadingProposal(true);
    try {
      const apiKey =
        typeof window !== 'undefined'
          ? localStorage.getItem('gemini_api_key') ||
            localStorage.getItem('geminiApiKey') ||
            localStorage.getItem('GEMINI_API_KEY') ||
            ''
          : '';
      const parsed = await parseMultiplePolicyFiles(files, undefined, apiKey);
      if (parsed.length > 0) {
        const nextProposed = [...proposedPolicies, ...parsed];
        setProposedPolicies(nextProposed);
        const comp = compareProposedPolicies(profile, existingPolicies, nextProposed);
        setComparisonResult(comp);
      }
    } catch (err) {
      console.error('제안서 파싱 오류:', err);
    } finally {
      setIsUploadingProposal(false);
    }
  };

  // 파일 선택 인풋 핸들러
  const handleProposalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processProposalFiles(e.target.files);
    }
  };

  // 제안받은 보험 드래그앤드롭 상태 및 핸들러
  const [isDraggingProposal, setIsDraggingProposal] = useState<boolean>(false);

  const handleProposalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProposal(true);
  };

  const handleProposalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProposal(false);
  };

  const handleProposalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProposal(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processProposalFiles(e.dataTransfer.files);
    }
  };

  // 제안받은 보험 샘플 1건 빠른 추가 (사용자 연령대별 맞춤 권장 기준 동적 적용)
  const handleAddSampleProposal = () => {
    const rec = calculateRecommendedCoverages(profile);
    const sampleProposal: ExistingPolicy = {
      id: generateSecureId('proposed'),
      insurerName: '한화손해보험',
      policyName: 'KB손보 + 현대해상 맞춤 보완 제안서 플랜',
      monthlyPremium: profile.age >= 50 ? 58200 : profile.age >= 30 ? 43250 : 31500,
      coverageDetails: {
        cancer: rec.cancer,
        similarCancer: rec.similarCancer,
        nonReimbursedCancer: rec.nonReimbursedCancer,
        cancerLivingCare: rec.cancerLivingCare,
        heavyParticle: rec.heavyParticle,
        brain: rec.brain,
        heart: rec.heart,
        injuryDisability: rec.injuryDisability,
        diseaseDisability80: rec.diseaseDisability80,
        injurySurgery: rec.injurySurgery,
        diseaseSurgery: rec.diseaseSurgery,
        surgery: rec.surgery,
        circulatoryCare: rec.circulatoryCare,
        indemnity: false,
      },
      documentUrl: '제안서 견적',
      excludedLimitedCoverages: [
        {
          name: '남녀특정암진단 II',
          amount: 5000000,
          reason: '일반암 전체 미보장 / 부위 한정으로 순수 진단비에서 분리 제외',
        },
      ],
      limitedCoverageAlert: '부위 한정 특약이 자동 필터링되었습니다.',
      matchedRiders: {
        cancer: [{ riderName: 'KB 3,000만 + 현대 일반암진단비', amount: rec.cancer, note: `만 ${profile.age}세 연령별 권장 일반암 ${(rec.cancer / 10000).toLocaleString()}만원 충족` }],
        similarCancer: [{ riderName: 'KB 800만 + 현대 유사암진단비', amount: rec.similarCancer, note: `유사암 ${(rec.similarCancer / 10000).toLocaleString()}만원 보장` }],
        nonReimbursedCancer: [{ riderName: '비급여(전액본인부담 포함) 암 주요치료비Plus(종합병원)', amount: rec.nonReimbursedCancer, note: '3번 그림 기준: 종합병원 비급여 암수술/항암약물/방사선치료 종합 보장 (연간 1회한)' }],
        cancerLivingCare: [{ riderName: '암주요치료 생활비 담보', amount: rec.cancerLivingCare, note: 'KB손보 암 치료 기간 매년 생활비 지급' }],
        heavyParticle: [{ riderName: '항암 중입자·양성자 방사선치료비', amount: rec.heavyParticle, note: '중입자가속기 및 양성자치료비 지급' }],
        brain: [{ riderName: '현대 1,000만 + KB 뇌혈관진단비', amount: rec.brain, note: `뇌출혈, 뇌경색 등 뇌혈관 질환 전체 ${(rec.brain / 10000).toLocaleString()}만원 보장` }],
        heart: [{ riderName: '현대 1,000만 + KB 허혈성진단비', amount: rec.heart, note: `협심증 및 급성심근경색증 전액 ${(rec.heart / 10000).toLocaleString()}만원 보장` }],
        injuryDisability: [{ riderName: '상해 후유장해(3% 이상)', amount: rec.injuryDisability || 50000000, note: '3% 이상 상해후유장해' }],
        diseaseDisability80: [{ riderName: '질병 후유장해(80% 이상)', amount: rec.diseaseDisability80 || 20000000, note: '질병특주고도장해' }],
        injurySurgery: [{ riderName: '현대 1~5종 상해 수술비', amount: rec.injurySurgery || 500000, note: '상해 수술비 50만 (1~5종 최대 1,000만원)' }],
        diseaseSurgery: [{ riderName: '현대 1~5종 질병 수술비', amount: rec.diseaseSurgery || 300000, note: '질병 수술비 30만 (1~5종 최대 500만원)' }],
        circulatoryCare: [{ riderName: '순환계질환 주요치료비', amount: rec.circulatoryCare || 10000000, note: '심혈관/뇌혈관 혈전용해 및 스텐트 치료비' }],
      },
    };

    const nextProposed = [...proposedPolicies, sampleProposal];
    setProposedPolicies(nextProposed);
    const comp = compareProposedPolicies(profile, existingPolicies, nextProposed);
    setComparisonResult(comp);
  };

  // 제안받은 보험 삭제
  const handleRemoveProposal = (id?: string) => {
    if (!id) return;
    const nextProposed = proposedPolicies.filter((p) => p.id !== id);
    setProposedPolicies(nextProposed);
    if (nextProposed.length === 0) {
      setComparisonResult(null);
    } else {
      const comp = compareProposedPolicies(profile, existingPolicies, nextProposed);
      setComparisonResult(comp);
    }
  };

  // 개별 보험사 상세 펼침 상태 및 필터 상태
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false);
  const [insurerFilter, setInsurerFilter] = useState<'all' | 'non_life' | 'life' | 'fetus_child'>('all');

  const filteredProducts = (report.recommendedProducts || []).filter((p) => {
    if (insurerFilter === 'non_life') return p.insurerType === 'non_life';
    if (insurerFilter === 'life') return p.insurerType === 'life';
    if (insurerFilter === 'fetus_child') return p.category === 'fetus_child';
    return true;
  });

  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 3);

  // 레이더 차트용 데이터 가공 (보완 전 vs 은은한 붉은색 보완 후 비교 포함)
  const radarData = report.coverageGaps.map((g) => {
    const afterGap = comparisonResult?.gapsAfter.find((ag) => ag.category === g.category);
    const beforeRate = Math.min(g.fulfillmentRate, 120);
    const afterRate = afterGap ? Math.min(afterGap.fulfillmentRate, 120) : beforeRate;
    return {
      subject: g.label
        .replace(' 진단비', '')
        .replace(' 주요치료비', '')
        .replace(' 치료비', '')
        .replace(' 방사선치료비', '')
        .replace(' 생활비', '')
        .replace(' 수술비', '')
        .replace('의료비', ''),
      충족도: beforeRate,
      보완전: beforeRate,
      보완후: afterRate,
      기준치: 100,
    };
  });

  const getScoreColor = (grade: string) => {
    switch (grade) {
      case '안심':
        return { text: 'text-emerald-600', bg: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' };
      case '보통':
        return { text: 'text-blue-600', bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' };
      case '주의':
        return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' };
      default:
        return { text: 'text-rose-600', bg: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800' };
    }
  };

  const scoreTheme = getScoreColor(report.scoreGrade);

  return (
    <div className="w-full max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 pb-12 shadow-xl border-x border-slate-200 space-y-6 lg:rounded-3xl lg:my-6">
      {/* 최상단 타이틀 바 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2.5 hover:opacity-85 transition-all text-left cursor-pointer group"
          title="클릭 시 처음 화면으로 이동합니다"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              건강보험 진단
            </h1>
            <p className="text-[11px] text-slate-500">
              만 {profile.age}세 {profile.gender === 'male' ? '남성' : '여성'} 맞춤 리포트
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              type="button"
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Gemini API 키 설정"
            >
              <span>⚙️</span>
            </button>
          )}
          {onOpenSaved && (
            <button
              onClick={onOpenSaved}
              type="button"
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs flex items-center gap-1 font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="보관함 저장 및 조회"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">보관함</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. 보장 점수 모바일 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${scoreTheme.badge}`}>
                {report.scoreGrade} 등급
              </span>
              {profile.isFetus || profile.age < 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  👶 태아 안심 플랜 ({profile.pregnancyWeeks || 16}주차)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {profile.age <= 18 ? `만 ${profile.age}세 (어린이)` : `만 ${profile.age}세`} ({profile.gender === 'male' ? '남성' : '여성'})
                </span>
              )}
              {profile.familyHistory && profile.familyHistory.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  가족력 가중치 반영
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              {profile.isFetus || profile.age < 0 ? '태아 & 신생아 종합 보장 분석' : '종합 보장 점수'}
            </h2>
          </div>

          <div className="text-right">
            <span className={`text-4xl font-black ${scoreTheme.text}`}>
              {report.totalScore}
            </span>
            <span className="text-sm font-bold text-slate-400"> / 100점</span>
          </div>
        </div>

        {/* 점수 게이지 바 */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${report.totalScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${scoreTheme.bg}`}
          />
        </div>

        <p className="text-xs text-slate-600 font-medium mt-3 bg-slate-50 p-3 rounded-xl leading-relaxed border border-slate-100">
          {report.statusSummary}
        </p>

        {report.totalCurrentPremium > 0 && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>현재 총 월 납입 보험료</span>
            <span className="font-bold text-slate-800 text-sm">
              {report.totalCurrentPremium.toLocaleString()} 원
            </span>
          </div>
        )}

        {/* 특정 질환 한정 보장 제외 상세 안내 */}
        {report.excludedLimitedCoverages && report.excludedLimitedCoverages.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>제외된 한정 특약 (순수 일반 진단비 미충족)</span>
            </div>
            <div className="space-y-1">
              {report.excludedLimitedCoverages.map((ex, idx) => (
                <div key={idx} className="bg-rose-50/70 p-2 rounded-lg border border-rose-100 flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 line-through text-[11px]">{ex.name}</span>
                    <span className="text-[10px] text-slate-500">{ex.reason}</span>
                  </div>
                  <span className="font-extrabold text-rose-600 text-[11px] shrink-0 ml-2">
                    {(ex.amount / 10000).toLocaleString()}만원 제외
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 2. 보장 항목별 시각화 (레이더 차트 & 상세 바) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" /> 보장 항목별 충족도 분석
          </h3>
          <span className="text-[11px] text-slate-400">100% 달성 기준</span>
        </div>

        {/* 레이더 차트 */}
        <div className="w-full h-56 -my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#cbd5e1" />

              {/* 1. 보완 전 그래프: 신뢰감 있는 블루 컬러 */}
              <Radar
                name="보완 전 (기존)"
                dataKey={comparisonResult ? "보완전" : "충족도"}
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={comparisonResult ? 0.35 : 0.45}
                strokeWidth={2}
              />

              {/* 2. 보완 후 그래프: 사용자가 요청한 '보완전 그래프 위 은은한 붉은색(로즈/코랄)' 오버레이 */}
              {comparisonResult && (
                <Radar
                  name="보완 후 (제안 보완)"
                  dataKey="보완후"
                  stroke="#e11d48"
                  fill="#f43f5e"
                  fillOpacity={0.28}
                  strokeWidth={2.5}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 그래프 범례 (보완 전 파란색 vs 보완 후 은은한 붉은색) */}
        {comparisonResult && (
          <div className="flex items-center justify-center gap-3 text-xs font-bold pt-2 pb-1 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs" />
              <span>보완 전 (기존 가입)</span>
            </div>
            <span className="text-slate-400 font-extrabold">➔</span>
            <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs" />
              <span>보완 후 (은은한 붉은색 제안 보완)</span>
            </div>
          </div>
        )}

        {/* 카테고리별 상세 프로그레스 및 출처 분해 아코디언 */}
        <div className="space-y-2.5 pt-2">
          <div className="text-[11px] text-blue-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              보장 항목을 <b>터치(클릭)</b>하면 <b>어느 보험에서 얼마가 나오는지</b>와 <b>조건부 제외 내역</b>이 상세 노출됩니다.
            </span>
          </div>

          {/* 연령대별(보험사 및 유튜브 전문 설계 기준) 맞춤 권장 가이드 배너 */}
          {report.ageGroupStrategy && (
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-blue-600 text-white text-[10.5px] font-black px-2 py-0.5 rounded-md shadow-xs">
                    {report.ageGroupStrategy.groupLabel}
                  </span>
                  <span className="font-extrabold text-slate-800 text-xs">
                    {report.ageGroupStrategy.strategyTitle}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                  유튜브·보험사 전문가 기준
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-0.5">
                {report.ageGroupStrategy.strategyDesc}
              </p>
              <div className="text-[9.5px] text-slate-400 pl-0.5 flex items-center gap-1">
                <span>📚 기준 출처: {report.ageGroupStrategy.sources}</span>
              </div>
            </div>
          )}

          {/* 2번 그림 기준 3대 보장 그룹별 목록 (암 / 뇌,심장 / 기타) */}
          {(
            [
              { group: '암', title: '암 보장 (5대 핵심 플랜)', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
              { group: '뇌,심장', title: '뇌·심장 2대 질환 보장', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
              { group: '기타', title: '기타 핵심 수술비 및 후유장해 보장', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            ] as const
          ).map((grp) => {
            const groupGaps = report.coverageGaps.filter(
              (g) => (COVERAGE_CATEGORIES[g.category]?.group || '기타') === grp.group
            );
            if (groupGaps.length === 0) return null;

            return (
              <div key={grp.group} className="space-y-2 pt-2 first:pt-0">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-md border ${grp.badge}`}>
                    {grp.group}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{grp.title}</span>
                </div>

                <div className="space-y-2">
                  {groupGaps.map((gap) => {
                    const isDeficient = gap.status === 'insufficient';
                    const isExpanded = expandedGapKey === gap.category;
                    return (
                      <div
                        key={gap.category}
                        className={`border rounded-xl transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-blue-400 bg-blue-50/20 shadow-xs ring-1 ring-blue-300'
                            : 'border-slate-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        {/* 헤더 행 (클릭 시 펼침 토글) */}
                        <div
                          onClick={() => setExpandedGapKey(isExpanded ? null : gap.category)}
                          className="p-3 cursor-pointer select-none space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              {gap.label}
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-blue-600' : ''
                                }`}
                              />
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {(() => {
                                const afterGap = comparisonResult?.gapsAfter.find((ag) => ag.category === gap.category);
                                const hasImprovement = afterGap && afterGap.fulfillmentRate > gap.fulfillmentRate;
                                const afterAmount = afterGap ? afterGap.currentAmount : gap.currentAmount;

                                return (
                                  <>
                                    <span className="text-slate-400 text-[11px]">
                                      {gap.currentAmount > 0
                                        ? `${(gap.currentAmount / 10000).toLocaleString()}만`
                                        : '0원'}
                                      {hasImprovement && (
                                        <span className="text-rose-600 font-bold ml-1">
                                          ➔ {(afterAmount / 10000).toLocaleString()}만
                                        </span>
                                      )}
                                      {' / '}
                                      <span className="text-slate-700 font-bold">
                                        권장 {(gap.recommendedAmount / 10000).toLocaleString()}만원
                                      </span>
                                    </span>

                                    {hasImprovement ? (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                          {gap.fulfillmentRate}%
                                        </span>
                                        <span className="text-slate-400 text-[10px]">➔</span>
                                        <span className="text-[10.5px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
                                          {afterGap.fulfillmentRate}% (+{afterGap.fulfillmentRate - gap.fulfillmentRate}%)
                                        </span>
                                      </div>
                                    ) : (
                                      <span
                                        className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                                          isDeficient
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                      >
                                        {gap.fulfillmentRate}%
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* 보완 전후 비교 프로그레스 바 (보완 시 파란색 기존 바 위 은은한 붉은색 오버레이) */}
                          {(() => {
                            const afterGap = comparisonResult?.gapsAfter.find((ag) => ag.category === gap.category);
                            const hasImprovement = afterGap && afterGap.fulfillmentRate > gap.fulfillmentRate;

                            if (hasImprovement) {
                              return (
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                                  {/* 보완 후 전체 게이지 (은은한 붉은색 로즈) */}
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(afterGap.fulfillmentRate, 100)}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full bg-rose-400/90 absolute top-0 left-0"
                                  />
                                  {/* 보완 전 기본 게이지 (신뢰감 있는 블루) */}
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(gap.fulfillmentRate, 100)}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-blue-600 absolute top-0 left-0"
                                  />
                                </div>
                              );
                            }

                            return (
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${gap.fulfillmentRate}%` }}
                                  transition={{ duration: 0.5 }}
                                  className={`h-full ${isDeficient ? 'bg-rose-500' : 'bg-blue-600'}`}
                                />
                              </div>
                            );
                          })()}

                          {isDeficient && !isExpanded && (
                            <p className="text-[10.5px] text-rose-600 font-medium">{gap.note}</p>
                          )}
                        </div>

                        {/* 펼쳐지는 상세 출처 분해표 및 제외 특약 내역 */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-3 pb-3 pt-1 border-t border-slate-100 text-xs space-y-2.5 bg-slate-50/60"
                            >
                              {/* 전체 보장 기준 가이드 */}
                              {gap.ruleNote && (
                                <div className="text-[10.5px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed">
                                  <span className="font-bold text-blue-700">📌 보장 판정 기준: </span>
                                  {gap.ruleNote}
                                </div>
                              )}

                              {/* 어느 보험에 어떤 세부 특약으로 연결되어 보장되는지 기여 증권 분해표 */}
                              <div>
                                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                                  🏢 가입 증권별 {gap.label} 보장 내역 &amp; 연결 특약:
                                </span>
                                {gap.contributions && gap.contributions.length > 0 ? (
                                  <div className="space-y-2">
                                    {gap.contributions.map((c, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-2 shadow-2xs"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">
                                              {c.insurerName}
                                            </span>
                                            <span className="font-bold text-slate-800 text-[11px]">
                                              {c.policyName}
                                            </span>
                                          </div>
                                          <span className="font-black text-blue-600 text-xs shrink-0 ml-2">
                                            {(c.amount / 10000).toLocaleString()}만원
                                          </span>
                                        </div>

                                        {/* 연결된 구체적 담보/특약 목록 상세 박스 */}
                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                                          <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                            <span>🔗 연결된 세부 보장 담보:</span>
                                          </div>
                                          {c.matchedRiders && c.matchedRiders.length > 0 ? (
                                            <div className="space-y-1">
                                              {c.matchedRiders.map((r, rIdx) => (
                                                <div
                                                  key={rIdx}
                                                  className="bg-white p-1.5 rounded border border-slate-200 text-[10.5px] flex flex-col gap-0.5"
                                                >
                                                  <div className="flex justify-between items-center">
                                                    <span className="font-bold text-indigo-950 flex items-center gap-1">
                                                      <span className="text-emerald-600">✔</span> {r.riderName}
                                                    </span>
                                                    <span className="font-extrabold text-indigo-600 text-[10px] shrink-0 ml-2">
                                                      {(r.amount / 10000).toLocaleString()}만원
                                                    </span>
                                                  </div>
                                                  {r.note && (
                                                    <span className="text-[10px] text-slate-500 pl-3 leading-tight">
                                                      {r.note}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="bg-white p-1.5 rounded border border-slate-200 text-[10.5px]">
                                              <span className="font-bold text-indigo-950 flex items-center gap-1">
                                                <span className="text-emerald-600">✔</span> {c.riderName || `${gap.label} 기본 담보`}
                                              </span>
                                              {c.riderNote && (
                                                <span className="block text-[10px] text-slate-500 mt-0.5 pl-3 leading-tight">
                                                  {c.riderNote}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-400 text-center">
                                    가입된 증권 중 순수 {gap.label} 전체를 보장하는 계약이 없습니다.
                                  </div>
                                )}
                              </div>

                              {/* 조건부/한정 특약으로 제외된 내역 (예: 남녀특정암 등) */}
                              {gap.excludedItems && gap.excludedItems.length > 0 && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5 text-[11px]">
                                  <span className="font-bold text-rose-800 flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    조건부·부위한정으로 순수 진단비에서 제외된 특약 ({gap.excludedItems.length}건):
                                  </span>
                                  <div className="space-y-1">
                                    {gap.excludedItems.map((ex, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white p-2 rounded border border-rose-100 flex flex-col gap-0.5"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-slate-700 line-through text-[11px]">
                                            {ex.name}
                                          </span>
                                          <span className="font-extrabold text-rose-600 text-[10.5px]">
                                            {(ex.amount / 10000).toLocaleString()}만원 (제외)
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 2번 그림 기준 추가 권장 보완 가이드 */}
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <span>💡 맞춤 보완 추천 항목 (추가 특약)</span>
            </div>
            <div className="text-[11px] text-amber-900/90 leading-relaxed space-y-1">
              <p>
                • <b>양성뇌종양진단비</b>: 2,000만원 추가 권장
              </p>
              <p>
                • <b>간병비보험</b>: 5년마다 10%씩 보장금액이 증가하는 <b>체증형</b> 권장 (약관상 '직접적인 치료' 문구 제약이 없는 DB손보, 한화손보 등 유리)
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. 리모델링 제안 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">리모델링 가이드라인</h3>
        </div>

        {/* 제안 태그 모음 */}
        <div className="flex flex-wrap gap-1.5">
          {report.adviceTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 우선 보완 필요 항목 알림 */}
        {report.priorityItems.length > 0 ? (
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>최우선 보완 필요 항목</span>
            </div>
            <p className="text-xs text-slate-300">
              현재 <span className="text-white font-bold">{report.priorityItems.join(', ')}</span> 보장이 권장 기준보다 부족하여, 단독 특약 또는 종합보험 플랜으로 즉시 보강을 권장합니다.
            </p>
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>현재 핵심 3대 질병 보장이 균형 있게 충족되어 있습니다.</span>
          </div>
        )}
      </motion.div>

      {/* 4. 제안/견적받은 보험 추가 및 보완 효과 비교 시뮬레이터 (Before vs After) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-white rounded-2xl p-5 border-2 border-indigo-200 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileStack className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                제안받은 보험 보완 효과 비교 (Before vs After)
              </h3>
              <p className="text-[11px] text-slate-500">
                견적받은 증권/제안서를 올리면 기존 보험과의 합산 보완율을 비교 분석합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Gemini API 키 연동 상태 배너 */}
        <div className="flex items-center justify-between bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <span className="font-bold text-slate-800 text-[11.5px] block">
                {hasApiKey ? '✨ Gemini AI 초정밀 판독 엔진 가동 중' : '💡 Gemini API 키 연동 시 초정밀 AI 분석'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {hasApiKey
                  ? '업로드된 제안서의 특약 문구를 Google Gemini 1.5/2.0 AI가 정밀 심사합니다.'
                  : 'API 키를 등록하면 복잡한 가입제안서 PDF도 AI가 글자 하나까지 정밀 분석합니다.'}
              </span>
            </div>
          </div>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors shrink-0 ${
                hasApiKey
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-xs'
              }`}
            >
              {hasApiKey ? '키 관리 ⚙️' : '키 등록 ⚙️'}
            </button>
          )}
        </div>

        {/* 제안서 업로드 존 & 샘플 추가 버튼 */}
        <div className="space-y-2.5">
          <div
            onDragOver={handleProposalDragOver}
            onDragEnter={handleProposalDragOver}
            onDragLeave={handleProposalDragLeave}
            onDrop={handleProposalDrop}
            className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
              isDraggingProposal
                ? 'border-indigo-600 bg-indigo-100/80 ring-4 ring-indigo-300/50 shadow-inner'
                : 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 shadow-xs'
            }`}
          >
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleProposalUpload}
                className="hidden"
              />
              {isUploadingProposal ? (
                <div className="flex items-center gap-2.5 py-3">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-indigo-900 block">
                      {hasApiKey
                        ? 'Gemini AI가 제안서 보장 내역을 초정밀 판독 중입니다...'
                        : '제안서 보장 내역을 정밀 분석 중입니다...'}
                    </span>
                    <span className="text-[10px] text-indigo-600/80 block">
                      한정·조건부 특약 필터링 및 Before vs After 보완 효과 계산 중
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm shadow-indigo-200">
                    <Upload
                      className={`w-5 h-5 transition-transform ${
                        isDraggingProposal ? 'scale-125' : ''
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-indigo-950">
                    {isDraggingProposal
                      ? '여기에 견적서/제안서 파일을 놓아주세요!'
                      : '제안받은 보험 견적서(PDF / 사진) 업로드 (드래그 & 드롭 가능)'}
                  </span>
                  <span className="text-[11px] text-indigo-600/80 mt-1 max-w-[340px]">
                    설계사에게 받은 제안서를 드래그하거나 클릭하여 올리면 한정특약 필터링 및 보완 효과를 자동 계산합니다.
                  </span>
                </div>
              )}
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddSampleProposal}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              샘플 제안서 추가해보기 (한화 3대보장 월 4.8만)
            </button>
          </div>
        </div>

        {/* 등록된 제안 보험 목록 */}
        {proposedPolicies.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              추가된 제안 보험 ({proposedPolicies.length}건):
            </span>
            <div className="space-y-1.5">
              {proposedPolicies.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200 flex justify-between items-center text-xs"
                >
                  <div className="truncate max-w-[240px]">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded text-[10px] font-extrabold">
                        제안
                      </span>
                      <span>{prop.insurerName}</span>
                      <span className="text-slate-500 font-medium text-[11px]">
                        {prop.policyName}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-500">
                      월 {Number(prop.monthlyPremium).toLocaleString()}원
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProposal(prop.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="제안서 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Before vs After 비교 분석 결과 카드 */}
        {comparisonResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-lg space-y-4 border border-indigo-700/50"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                보완 효과 분석 (Before ➔ After)
              </span>
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                점수 +{comparisonResult.afterScore - comparisonResult.beforeScore}점 상승
              </span>
            </div>

            {/* 점수 & 보험료 Before vs After 지표 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10 space-y-1">
                <span className="text-[10.5px] text-slate-300 block">종합 건강보장 점수</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base text-slate-400 font-bold line-through">
                    {comparisonResult.beforeScore}점
                  </span>
                  <span className="text-xs text-slate-400">➔</span>
                  <span className="text-xl font-black text-amber-300">
                    {comparisonResult.afterScore}점
                  </span>
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10 space-y-1">
                <span className="text-[10.5px] text-slate-300 block">총 월 납입 보험료</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-400 font-bold">
                    {(comparisonResult.beforePremium / 10000).toFixed(1)}만
                  </span>
                  <span className="text-xs text-slate-400">➔</span>
                  <span className="text-sm font-black text-emerald-300">
                    {(comparisonResult.afterPremium / 10000).toFixed(1)}만
                  </span>
                </div>
                <span className="text-[10px] text-indigo-200 block">
                  (+{(comparisonResult.premiumIncrease / 10000).toFixed(1)}만원 추가)
                </span>
              </div>
            </div>

            {/* AI 평가 코멘트 */}
            <p className="text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/10 leading-relaxed">
              💡 {comparisonResult.aiEvaluation}
            </p>

            {/* 9대 보장 항목별 Before vs After 보완율 비교 표 */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-200">
                  항목별 충족도 변화:
                </span>
                <span className="text-[10px] text-slate-300">
                  🔵 기존 보장 ➔ 🔴 은은한 붉은색 보완
                </span>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {comparisonResult.gapsAfter.map((afterGap) => {
                  const beforeGap = comparisonResult.gapsBefore.find((g) => g.category === afterGap.category);
                  const beforeFulfillment = beforeGap ? beforeGap.fulfillmentRate : 0;
                  const beforeAmount = beforeGap ? beforeGap.currentAmount : 0;
                  return (
                    <div
                      key={afterGap.category}
                      className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200">{afterGap.label}</span>
                          <div className="text-[10px] text-slate-400">
                            기존 {(beforeAmount / 10000).toLocaleString()}만 ➔ 제안후{' '}
                            <span className="text-rose-300 font-bold">
                              {(afterGap.currentAmount / 10000).toLocaleString()}만
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">
                            {beforeFulfillment}%
                          </span>
                          <span className="text-[10px] text-slate-400">➔</span>
                          <span
                            className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                              afterGap.fulfillmentRate >= 100
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                            }`}
                          >
                            {afterGap.fulfillmentRate}%
                          </span>
                        </div>
                      </div>

                      {/* 보완 효과 시각화 바 (파란색 기존 바 위 은은한 붉은색 보완) */}
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden relative">
                        <div
                          style={{ width: `${Math.min(afterGap.fulfillmentRate, 100)}%` }}
                          className="h-full bg-rose-400/90 absolute top-0 left-0 transition-all duration-500"
                        />
                        <div
                          style={{ width: `${Math.min(beforeFulfillment, 100)}%` }}
                          className="h-full bg-blue-500 absolute top-0 left-0 transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 5. 맞춤 상품 추천 리스트 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="space-y-3">
          {/* 유튜브 전문가 & 보험사 분석 생애주기 맞춤 설계 전략 배너 */}
          {report.ageGroupStrategy && (
            <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50/70 border-2 border-blue-200 rounded-2xl space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📺</span>
                  <span className="text-xs font-extrabold text-blue-950">
                    유튜브 전문가 &amp; 보험사 분석: [{report.ageGroupStrategy.groupLabel}] 맞춤 설계 전략
                  </span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  공통 표준 권장선
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {report.ageGroupStrategy.strategyTitle}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-blue-100">
                {report.ageGroupStrategy.strategyDesc}
              </p>
              {report.ageGroupStrategy.keyPoints && report.ageGroupStrategy.keyPoints.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-extrabold text-indigo-900 block">
                    ★ 유튜브 전문 분석 채널 핵심 체크포인트:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10.5px]">
                    {report.ageGroupStrategy.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2 rounded-lg border border-indigo-100 text-slate-700 flex items-start gap-1.5 shadow-2xs"
                      >
                        <span className="text-blue-600 font-bold">✔</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {report.ageGroupStrategy.fetusSpecificNote && (
                <div className="text-[10.5px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>{report.ageGroupStrategy.fetusSpecificNote}</span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 pt-0.5">
                출처: {report.ageGroupStrategy.sources}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> 맞춤 추천 상품 플랜
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              총 {filteredProducts.length}개 보험사 매칭
            </span>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
            <span className="text-base">💡</span>
            <span>보험사 카드를 <b>터치(클릭)</b>하면 <b>특약별 보장금액</b>과 <b>개별 월 보험료</b>를 확인할 수 있습니다.</span>
          </p>

          {/* 맞춤 필터 탭 (태아/어린이 포함) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setInsurerFilter('all')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                insurerFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              전체 ({report.recommendedProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setInsurerFilter('fetus_child')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                insurerFilter === 'fetus_child'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              👶 태아/자녀
            </button>
            <button
              type="button"
              onClick={() => setInsurerFilter('non_life')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                insurerFilter === 'non_life'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              손해보험사
            </button>
            <button
              type="button"
              onClick={() => setInsurerFilter('life')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                insurerFilter === 'life'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              생명보험사
            </button>
          </div>
        </div>

        {/* 상품 카드 목록 */}
        <div className="space-y-3">
          {displayedProducts.map((prod) => {
            const isExpanded = expandedProductId === prod.id;
            return (
              <div
                key={prod.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
                    : 'border-slate-200 shadow-sm hover:border-blue-400'
                }`}
              >
                {/* 카드 헤더 (클릭 시 아코디언 토글) */}
                <div
                  onClick={() => setExpandedProductId(isExpanded ? null : prod.id)}
                  className="p-4 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            prod.category === 'fetus_child'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : prod.insurerType === 'life'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {prod.insurerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {prod.category === 'fetus_child'
                            ? '태아·어린이전문'
                            : prod.insurerType === 'life'
                            ? '생명보험'
                            : '손해보험'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-1">
                        {prod.productName}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">예상 월 보험료</span>
                      <span className="text-base font-extrabold text-blue-600">
                        {prod.monthlyPremiumEstimate.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* 나이/성별/가족력 맞춤 매칭 이유 뱃지들 */}
                  {prod.recommendationScoreReasons && prod.recommendationScoreReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {prod.recommendationScoreReasons.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md"
                        >
                          ✨ {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 유튜브 전문가 & 보험사 분석 팁 박스 */}
                  {prod.expertAnalysisTips && (
                    <div className="mt-2.5 p-2 bg-gradient-to-r from-amber-50/70 to-orange-50/50 border border-amber-200/80 rounded-xl text-[10.5px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                      <span className="font-extrabold text-amber-700 shrink-0">📺 팩트체크:</span>
                      <span>{prod.expertAnalysisTips}</span>
                    </div>
                  )}

                  {/* 핵심 특징 리스트 */}
                  <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    {prod.keyFeatures.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* 기본 보장 뱃지 및 상세 토글 버튼 */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {prod.baseCoverages.cancer > 0 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          암 {(prod.baseCoverages.cancer / 10000).toLocaleString()}만원
                        </span>
                      )}
                      {prod.baseCoverages.brain > 0 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          뇌 {(prod.baseCoverages.brain / 10000).toLocaleString()}만원
                        </span>
                      )}
                      {prod.baseCoverages.heart > 0 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          심장 {(prod.baseCoverages.heart / 10000).toLocaleString()}만원
                        </span>
                      )}
                      {prod.baseCoverages.surgery > 0 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          수술 {(prod.baseCoverages.surgery / 10000).toLocaleString()}만원
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                        isExpanded
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <span>{isExpanded ? '상세 닫기' : '보장/보험료 상세'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 펼쳐졌을 때: 담보별 상세 보장금액 & 개별 보험료 분해표 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-blue-100 bg-slate-50/70 p-4 space-y-3"
                    >
                      {/* 분해표 헤더 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Coins className="w-4 h-4 text-blue-600" />
                          <span>담보별 보장금액 및 개별 월 보험료</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          비갱신 / 20년납 기준
                        </span>
                      </div>

                      {/* 특약별 개별 보험료 리스트 */}
                      <div className="space-y-2">
                        {prod.coverageBreakdown && prod.coverageBreakdown.length > 0 ? (
                          prod.coverageBreakdown.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1"
                            >
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <span className="font-bold text-slate-800 text-xs block">
                                    {item.name}
                                  </span>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <span className="font-extrabold text-blue-700 text-xs block">
                                    월 {item.monthlyPremium.toLocaleString()}원
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    보장 {(item.coverageAmount / 10000).toLocaleString()}만원
                                  </span>
                                </div>
                              </div>
                              {item.condition && (
                                <div className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1 mt-1">
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{item.condition}</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-white rounded-xl text-center text-xs text-slate-500">
                            기본 담보로 구성된 추천 플랜입니다.
                          </div>
                        )}
                      </div>

                      {/* 합계 검증 바 */}
                      <div className="bg-blue-600 text-white p-3 rounded-xl flex justify-between items-center shadow-xs">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-blue-200" />
                          총 예상 월 납입 보험료 (합계)
                        </span>
                        <span className="text-sm font-extrabold">
                          {prod.monthlyPremiumEstimate.toLocaleString()}원 / 월
                        </span>
                      </div>

                      {/* 가입 및 설계 조건 카드 */}
                      {prod.subscriptionTerms && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>가입 및 설계 상세 조건</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">납입 / 만기</span>
                              <span className="font-semibold text-slate-700">
                                {prod.subscriptionTerms.paymentPeriod}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">갱신 유형</span>
                              <span className="font-semibold text-slate-700">
                                {prod.subscriptionTerms.renewalType}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">심사 유형</span>
                              <span className="font-semibold text-slate-700">
                                {prod.subscriptionTerms.underwriting}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <span className="text-slate-400 block text-[10px]">환급금 유형</span>
                              <span className="font-semibold text-slate-700">
                                {prod.subscriptionTerms.refundType}
                              </span>
                            </div>
                          </div>
                          <div className="bg-amber-50/80 p-2 rounded-lg text-[10px] text-amber-800 border border-amber-200/60">
                            <b>보장 개시 조건:</b> {prod.subscriptionTerms.waitingPeriod}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* 더 많은 보험사 상품 보기 토글 버튼 */}
        {filteredProducts.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllProducts(!showAllProducts)}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            {showAllProducts ? (
              <>
                <span>상위 추천 3개 상품만 보기</span>
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </>
            ) : (
              <>
                <span>전체 {filteredProducts.length}개 보험사 상품 모두 비교하기</span>
                <ChevronDown className="w-4 h-4 text-blue-600" />
              </>
            )}
          </button>
        )}
      </motion.div>

      {/* 안내 유의사항 */}
      <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          본 진단 리포트는 사용자가 입력한 연령, 성별, 가족력 및 등록 증권 정보에 기반하여 산출된 참고용 분석 리포트이며, 실제 보험 가입 및 인수 여부는 각 보험사의 언더라이팅 심사 기준에 따라 달라질 수 있습니다.
        </p>
      </div>

      {/* 최하단 새로운 진단 시작하기 버튼 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span>새로운 건강보험 진단 시작하기</span>
        </button>
      </div>
    </div>
  );
};
