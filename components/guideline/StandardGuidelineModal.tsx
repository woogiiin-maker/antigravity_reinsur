'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { STANDARD_GUIDELINES_16 } from '@/lib/data/standardGuideline';

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

  const categories = [
    '전체',
    '3대 진단비',
    '암 치료비',
    '순환기 치료비',
    '수술비',
    '장해 / 생활 / 배상',
  ];

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
    <>
      {/* ========================================================================= */}
      {/* 1. 화면 전용 대화형 모달 (인쇄 시에는 no-print 로 숨김 처리) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
          >
            {/* 모달 상단 헤더 */}
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
                      분류: 종합보험 필수 핵심 담보 (실손의료비 연계 표준안)
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                    보험 핵심 특약 권장 보장금액 요약표
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  title="A4 단일 페이지 인쇄 및 PDF 저장"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>인쇄/저장 (A4 1장)</span>
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
                💡 업계 손해율 · 가성비 및 최신 치료 환경을 반영한 최적 보장금액 가이드라인입니다.
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

            {/* 화면 스크롤 테이블 영역 */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/50">
              {/* PC & 태블릿 테이블 */}
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
                                {item.category}
                              </td>
                            ) : null
                          ) : (
                            <td className="py-3 px-3 text-center align-middle font-black text-slate-800 bg-slate-50/80 border-r border-slate-200 text-xs">
                              {item.category}
                            </td>
                          )}

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

                          <td className="py-3 px-3.5 border-r border-slate-200">
                            <span className="font-extrabold text-blue-700 bg-blue-50/70 px-2 py-1 rounded-md border border-blue-100 inline-block">
                              {item.recommendedAmount}
                            </span>
                          </td>

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

              {/* 하단 안내 문구 */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">가이드라인 활용 팁:</span> 이 핵심 특약 요약표는 보험 가입 및 리모델링 시 반드시 갖추어야 할 최적의 표준 기준입니다. 내 보험 분석 결과와 비교하여 부족한 항목은 우선 보강하고 중복되거나 과도한 항목은 조정하시기 바랍니다.
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

      {/* ========================================================================= */}
      {/* 2. A4 1페이지 전용 초정밀 인쇄/저장 시트 (window.print() 시에만 활성화) */}
      {/* ========================================================================= */}
      <div id="guideline-a4-print-sheet" className="guideline-a4-print-sheet">
        {/* 상단 헤더 */}
        <div className="print-header">
          <div className="print-header-left">
            <span className="print-badge">설계 표준 가이드</span>
            <h1 className="print-title">보험 핵심 특약 권장 보장금액 요약표</h1>
            <p className="print-subtitle">
              업계 손해율·가성비 및 최신 치료 환경을 반영한 최적 보장금액 가이드
            </p>
          </div>
          <div className="print-header-right">
            <div>분류: 종합보험 필수 핵심 담보</div>
            <div>기준: 실손의료비 연계 표준안</div>
          </div>
        </div>

        {/* 17개 전 항목 요약표 테이블 */}
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>카테고리</th>
              <th style={{ width: '25%' }}>특약명</th>
              <th style={{ width: '27%' }}>권장 보장금액</th>
              <th style={{ width: '35%' }}>핵심 설계 포인트</th>
            </tr>
          </thead>
          <tbody>
            {STANDARD_GUIDELINES_16.map((item, idx) => {
              const isFirstOfCategory =
                idx === 0 || STANDARD_GUIDELINES_16[idx - 1].category !== item.category;
              const categoryRowCount = STANDARD_GUIDELINES_16.filter(
                (i) => i.category === item.category
              ).length;

              return (
                <tr key={item.id}>
                  {isFirstOfCategory && (
                    <td rowSpan={categoryRowCount} className="print-category-cell">
                      {item.category}
                    </td>
                  )}
                  <td className="print-rider-name">
                    <span className="font-bold">{item.name}</span>
                    {item.badge && (
                      <span className={`print-tag print-tag-${item.badge.text}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </td>
                  <td className="print-amount">
                    <span>{item.recommendedAmount}</span>
                  </td>
                  <td className="print-points">{item.keyPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 하단 푸터 */}
        <div className="print-footer">
          <span>보험 핵심 특약 권장 보장금액 요약표</span>
          <span>A4 단일 페이지 인쇄/보관용</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. A4 한 페이지 맞춤 글로벌 인쇄 스타일 (CSS) */}
      {/* ========================================================================= */}
      <style jsx global>{`
        /* 화면에서는 인쇄 전용 시트 숨김 */
        .guideline-a4-print-sheet {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm 5mm 8mm !important;
          }

          /* html, body 높이를 A4 1장으로 엄격 제한 및 여백/배경 리셋 */
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 화면상의 모든 배경 요소 및 모달 숨김 */
          .no-print,
          .print\:hidden {
            display: none !important;
          }

          /* A4 인쇄 전용 시트만 1페이지로 완벽 렌더링 */
          .guideline-a4-print-sheet {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }

          /* 인쇄 헤더 */
          .print-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            border-bottom: 2px solid #2563eb !important;
            padding-bottom: 3px !important;
            margin-bottom: 4px !important;
          }
          .print-badge {
            display: inline-block !important;
            font-size: 7.5pt !important;
            font-weight: 800 !important;
            color: #1d4ed8 !important;
            background: #dbeafe !important;
            border: 1px solid #bfdbfe !important;
            padding: 1px 5px !important;
            border-radius: 3px !important;
            margin-bottom: 1px !important;
          }
          .print-title {
            font-size: 13pt !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            margin: 1px 0 !important;
            letter-spacing: -0.5px !important;
          }
          .print-subtitle {
            font-size: 7.2pt !important;
            color: #64748b !important;
            margin: 0 !important;
          }
          .print-header-right {
            text-align: right !important;
            font-size: 7pt !important;
            color: #475569 !important;
            font-weight: 600 !important;
            line-height: 1.3 !important;
          }

          /* 인쇄 테이블 (A4 1페이지 엄격 피팅: 17개 특약 전 항목) */
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1.2px solid #94a3b8 !important;
            font-size: 7.6pt !important;
            line-height: 1.18 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-table th {
            background: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
            padding: 2.5px 4px !important;
            font-size: 7.6pt !important;
            font-weight: 800 !important;
            color: #1e293b !important;
            text-align: center !important;
          }
          .print-table td {
            border: 1px solid #e2e8f0 !important;
            padding: 2px 4px !important;
            vertical-align: middle !important;
          }

          /* 카테고리 열 */
          .print-category-cell {
            text-align: center !important;
            font-weight: 800 !important;
            background: #f8fafc !important;
            color: #0f172a !important;
            border-right: 1.2px solid #cbd5e1 !important;
            font-size: 7.6pt !important;
          }

          /* 특약명 및 태그 */
          .print-rider-name {
            color: #0f172a !important;
            font-weight: 700 !important;
          }
          .print-tag {
            display: inline-block !important;
            font-size: 6.5pt !important;
            font-weight: 800 !important;
            margin-left: 3px !important;
            padding: 0.5px 3px !important;
            border-radius: 2.5px !important;
            vertical-align: middle !important;
          }
          .print-tag-필수 {
            background: #ffe4e6 !important;
            color: #be123c !important;
            border: 0.8px solid #fecdd3 !important;
          }
          .print-tag-신설 {
            background: #cffafe !important;
            color: #0e7490 !important;
            border: 0.8px solid #a5f3fc !important;
          }
          .print-tag-트렌드 {
            background: #f3e8ff !important;
            color: #7e22ce !important;
            border: 0.8px solid #e9d5ff !important;
          }
          .print-tag-초가성비 {
            background: #dcfce7 !important;
            color: #15803d !important;
            border: 0.8px solid #bbf7d0 !important;
          }
          .print-tag-인기 {
            background: #fef3c7 !important;
            color: #b45309 !important;
            border: 0.8px solid #fde68a !important;
          }

          /* 권장금액 열 */
          .print-amount {
            color: #1d4ed8 !important;
            font-weight: 800 !important;
            background: #f8faff !important;
            white-space: nowrap !important;
          }

          /* 포인트 열 */
          .print-points {
            color: #334155 !important;
            font-size: 7pt !important;
            line-height: 1.15 !important;
          }

          /* 인쇄 푸터 */
          .print-footer {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 6.8pt !important;
            color: #94a3b8 !important;
            margin-top: 3px !important;
            padding-top: 1px !important;
            border-top: 1px solid #e2e8f0 !important;
          }
      `}</style>
    </>
  );
};

