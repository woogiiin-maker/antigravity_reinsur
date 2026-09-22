'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, ShieldCheck, Sparkles, AlertCircle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { STANDARD_GUIDELINES_16, StandardGuidelineItem } from '@/lib/data/standardGuideline';

interface StandardGuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandardGuidelineModal: React.FC<StandardGuidelineModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('전체');

  if (!isOpen) return null;

  const categories = ['전체', '3대 진단비', '신치료비', '수술비', '장해 / 생활 / 배상'];

  const filteredItems =
    activeCategory === '전체'
      ? STANDARD_GUIDELINES_16
      : STANDARD_GUIDELINES_16.filter((item) => item.category === activeCategory);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        {/* 모달 윈도우 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        >
          {/* 모달 헤더 */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    설계 표준 가이드
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    분류: 종합보험 핵심 담보 (실손의료비 연계 보완안)
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  보험 핵심 16개 특약 권장 보장금액 요약표
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                title="A4 표준 인쇄 / PDF 저장"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">인쇄/저장</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-xs cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 서브 설명 및 카테고리 필터 탭 */}
          <div className="px-4 sm:px-6 pt-3 pb-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <p className="text-xs text-slate-500">
              💡 업계 손해율 · 가성비 및 보장 공백 방지를 고려한 대한민국 표준 설정 가이드라인입니다.
            </p>

            {/* 필터 칩 */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 메인 콘텐츠 (스크롤 영역) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/50">
            {/* 요약 테이블 (PC & 태블릿) */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 w-28 text-center border-r border-slate-200">카테고리</th>
                    <th className="py-2.5 px-3.5 w-48 border-r border-slate-200">특약명</th>
                    <th className="py-2.5 px-3.5 w-52 border-r border-slate-200">권장 보장금액</th>
                    <th className="py-2.5 px-3.5">핵심 설계 포인트</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item, idx) => {
                    const isFirstOfCategory =
                      idx === 0 || filteredItems[idx - 1].category !== item.category;
                    const categoryRowCount = filteredItems.filter(
                      (i) => i.category === item.category
                    ).length;

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        {activeCategory === '전체' ? (
                          isFirstOfCategory ? (
                            <td
                              rowSpan={categoryRowCount}
                              className="py-3 px-3 text-center align-middle font-black text-slate-800 bg-slate-50/80 border-r border-slate-200 text-xs"
                            >
                              <div className="flex flex-col items-center justify-center gap-1">
                                <span>{item.category}</span>
                              </div>
                            </td>
                          ) : null
                        ) : (
                          <td className="py-3 px-3 text-center align-middle font-black text-slate-800 bg-slate-50/80 border-r border-slate-200 text-xs">
                            {item.category}
                          </td>
                        )}

                        {/* 특약명 및 태그 */}
                        <td className="py-3 px-3.5 border-r border-slate-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${item.badge.color}`}
                              >
                                {item.badge.text}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 권장 보장금액 */}
                        <td className="py-3 px-3.5 border-r border-slate-200">
                          <span className="font-extrabold text-blue-700 bg-blue-50/70 px-2 py-1 rounded-md border border-blue-100 inline-block">
                            {item.recommendedAmount}
                          </span>
                        </td>

                        {/* 핵심 설계 포인트 */}
                        <td className="py-3 px-3.5 text-slate-600 leading-relaxed">
                          {item.keyPoints}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 뷰 */}
            <div className="sm:hidden space-y-2.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-[11px] font-black text-slate-500">{item.category}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${item.badge.color}`}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-slate-900 text-sm">{item.name}</div>

                  <div className="bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                    <div className="text-[10px] text-blue-600 font-bold mb-0.5">권장 보장금액</div>
                    <div className="text-xs font-black text-blue-800">{item.recommendedAmount}</div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold mb-0.5">핵심 설계 포인트</div>
                    {item.keyPoints}
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 A4 안내 문구 */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">가이드라인 활용 팁:</span> 이 16개 특약 요약표는 보험 가입 및 리모델링 시 반드시 갖추어야 할 최적의 표준 기준입니다. 내 보험 분석 결과와 비교하여 부족한 항목은 우선 보강하고 중복되거나 과도한 항목은 조정하시기 바랍니다.
              </div>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400">
              A4 단일 페이지 인쇄 / 보관용 표준 가이드
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
