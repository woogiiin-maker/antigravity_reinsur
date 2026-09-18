'use client';

import React, { useState } from 'react';
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
} from '@/types/insurance';
import { compareProposedPolicies } from '@/lib/engine/diagnosis';
import { parseMultiplePolicyFiles } from '@/lib/ocr/clientParser';
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

  // 제안받은 보험 업로드 처리
  const handleProposalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsUploadingProposal(true);
      try {
        const parsed = await parseMultiplePolicyFiles(files);
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
    }
  };

  // 제안받은 보험 샘플 1건 빠른 추가 (체험용)
  const handleAddSampleProposal = () => {
    const sampleProposal: ExistingPolicy = {
      id: `proposed-${Date.now()}`,
      insurerName: '한화손해보험',
      policyName: '시그니처 여성건강보험 3.0 (보완 제안서)',
      monthlyPremium: 48000,
      coverageDetails: {
        cancer: 50000000,
        brain: 20000000,
        heart: 20000000,
        nonReimbursedCancer: 100000000,
        cancerLivingCare: 10000000,
        heavyParticle: 30000000,
        surgery: 5000000,
        diseaseDisability80: 50000000,
        circulatoryCare: 20000000,
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
        cancer: [{ riderName: '통합일반암진단비 (모든 암 100%)', amount: 50000000, note: '원발암/전이암 포함 순수 일반암 보장' }],
        brain: [{ riderName: '뇌혈관질환진단비 (I60~I69 전체)', amount: 20000000, note: '뇌출혈, 뇌경색 등 뇌혈관 전 질환 보장' }],
        heart: [{ riderName: '허혈성심장질환진단비', amount: 20000000, note: '협심증 및 급성심근경색증 전액 보장' }],
        nonReimbursedCancer: [{ riderName: '비급여암 주요치료비(연간 1회한, 5년간)', amount: 100000000, note: '비급여 표적/면역항암제 및 수술비 실손 보상' }],
        cancerLivingCare: [{ riderName: '암주요치료 생활비 담보', amount: 10000000, note: '암 치료 시 지속 생활자금 지원' }],
        heavyParticle: [{ riderName: '항암 중입자·양성자 방사선치료비', amount: 30000000, note: '중입자가속기 및 양성자치료비 지급' }],
        surgery: [{ riderName: '질병·상해 1~5종 종수술비', amount: 5000000, note: '질병 및 상해 수술 시 회당 차등 지급' }],
        diseaseDisability80: [{ riderName: '질병 80% 이상 고도장해위로금', amount: 50000000, note: '중증 후유장해 발생 시 일시금 지급' }],
        circulatoryCare: [{ riderName: '순환계질환 주요치료비', amount: 20000000, note: '심혈관/뇌혈관 혈전용해 및 스텐트 삽입술 등 지원' }],
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
  const [insurerFilter, setInsurerFilter] = useState<'all' | 'non_life' | 'life'>('all');

  const filteredProducts = (report.recommendedProducts || []).filter((p) => {
    if (insurerFilter === 'non_life') return p.insurerType === 'non_life';
    if (insurerFilter === 'life') return p.insurerType === 'life';
    return true;
  });

  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 3);

  // 레이더 차트용 데이터 가공
  const radarData = report.coverageGaps.map((g) => ({
    subject: g.label.replace(' 진단비', '').replace('의료비', ''),
    충족도: g.fulfillmentRate,
    기준치: 100,
  }));

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
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${scoreTheme.badge}`}>
                {report.scoreGrade} 등급
              </span>
              {profile.familyHistory && profile.familyHistory.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  가족력 반영
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              종합 보장 점수
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
        <div className="w-full h-52 -my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#cbd5e1" />
              <Radar
                name="내 보장 충족도"
                dataKey="충족도"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.45}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 상세 프로그레스 및 출처 분해 아코디언 */}
        <div className="space-y-2.5 pt-2">
          <div className="text-[11px] text-blue-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              보장 항목을 <b>터치(클릭)</b>하면 <b>어느 보험에서 얼마가 나오는지</b>와 <b>조건부 제외 내역</b>이 상세 노출됩니다.
            </span>
          </div>

          {report.coverageGaps.map((gap) => {
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">
                        {gap.currentAmount > 0
                          ? `${(gap.currentAmount / 10000).toLocaleString()}만원`
                          : '0원'}
                        {' / '}
                        <span className="text-slate-600 font-semibold">
                          {(gap.recommendedAmount / 10000).toLocaleString()}만원
                        </span>
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                          isDeficient
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {gap.fulfillmentRate}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gap.fulfillmentRate}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${isDeficient ? 'bg-rose-500' : 'bg-blue-600'}`}
                    />
                  </div>

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

        {/* 제안서 업로드 존 & 샘플 추가 버튼 */}
        <div className="space-y-2.5">
          <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 rounded-xl p-3.5 text-center transition-all">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleProposalUpload}
                className="hidden"
              />
              {isUploadingProposal ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-indigo-700">
                    제안서 보장 내역을 정밀 분석 중입니다...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-1">
                  <Upload className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-indigo-950">
                    제안받은 보험 견적서(PDF / 사진) 업로드
                  </span>
                  <span className="text-[10px] text-indigo-600/80 mt-0.5">
                    설계사에게 받은 제안서를 올리면 한정특약 필터링 및 보완 효과를 자동 계산합니다.
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
              <span className="text-[11px] font-bold text-indigo-200 block">
                항목별 충족도 변화:
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {comparisonResult.gapsAfter.map((afterGap) => {
                  const beforeGap = comparisonResult.gapsBefore.find((g) => g.category === afterGap.category);
                  const beforeFulfillment = beforeGap ? beforeGap.fulfillmentRate : 0;
                  const beforeAmount = beforeGap ? beforeGap.currentAmount : 0;
                  return (
                    <div
                      key={afterGap.category}
                      className="bg-white/5 p-2 rounded-lg border border-white/10 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-200">{afterGap.label}</span>
                        <div className="text-[10px] text-slate-400">
                          기존 {(beforeAmount / 10000).toLocaleString()}만 ➔ 제안후{' '}
                          {(afterGap.currentAmount / 10000).toLocaleString()}만
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
                              : 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          }`}
                        >
                          {afterGap.fulfillmentRate}%
                        </span>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
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

          {/* 손해보험 / 생명보험 필터 탭 */}
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
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            prod.insurerType === 'life'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {prod.insurerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {prod.insurerType === 'life' ? '생명보험' : '손해보험'}
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

                  {/* 핵심 특징 리스트 */}
                  <div className="mt-3 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
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
