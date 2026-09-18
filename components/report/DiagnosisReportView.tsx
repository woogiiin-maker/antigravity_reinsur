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
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { DiagnosisReport, UserProfile } from '@/types/insurance';
import { Bookmark } from 'lucide-react';

interface DiagnosisReportViewProps {
  report: DiagnosisReport;
  profile: UserProfile;
  onReset: () => void;
  onOpenSettings?: () => void;
  onOpenSaved?: () => void;
}

export const DiagnosisReportView: React.FC<DiagnosisReportViewProps> = ({
  report,
  profile,
  onReset,
  onOpenSettings,
  onOpenSaved,
}) => {
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
    <div className="w-full max-w-mobile mx-auto min-h-screen bg-slate-50 p-4 pb-12 shadow-xl border-x border-slate-200 space-y-5">
      {/* 최상단 타이틀 바 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="text-[11px] font-bold text-blue-600">진단 결과 리포트</span>
          <h1 className="text-sm sm:text-base font-bold text-slate-800">
            만 {profile.age}세 {profile.gender === 'male' ? '남성' : '여성'} 맞춤 분석
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              type="button"
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Gemini API 키 설정"
            >
              <span>⚙️</span>
            </button>
          )}
          {onOpenSaved && (
            <button
              onClick={onOpenSaved}
              type="button"
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs flex items-center gap-1 font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="보관함 저장 및 조회"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">보관함</span>
            </button>
          )}
          <button
            onClick={onReset}
            type="button"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center gap-1 font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="다시 진단하기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
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

        {/* 카테고리별 상세 프로그레스 */}
        <div className="space-y-3 pt-2">
          {report.coverageGaps.map((gap) => {
            const isDeficient = gap.status === 'insufficient';
            return (
              <div key={gap.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{gap.label}</span>
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

                {isDeficient && (
                  <p className="text-[11px] text-rose-600 font-medium">{gap.note}</p>
                )}
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

      {/* 4. 맞춤 상품 추천 리스트 */}
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
    </div>
  );
};
