'use client';

import React, { useState, useEffect } from 'react';
import { MultiStepForm } from '@/components/form/MultiStepForm';
import { DiagnosisReportView } from '@/components/report/DiagnosisReportView';
import { SavedRecordsModal } from '@/components/storage/SavedRecordsModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { diagnoseInsurance } from '@/lib/engine/diagnosis';
import { DiagnosisReport, ExistingPolicy, UserProfile } from '@/types/insurance';
import { createClient } from '@/lib/supabase/client';
import { Bookmark } from 'lucide-react';

export default function Home() {
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // 모바일 뒤로가기(popstate) 제어: 사이트 이탈 방지
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isSavedModalOpen) {
        setIsSavedModalOpen(false);
        return;
      }
      if (report) {
        setReport(null);
        setUserProfile(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [report, isSavedModalOpen]);

  const handleFormComplete = async (profile: UserProfile, policies: ExistingPolicy[]) => {
    const generatedReport = diagnoseInsurance(profile, policies);
    setUserProfile(profile);
    setReport(generatedReport);

    // 브라우저 뒤로가기 히스토리 추가
    window.history.pushState({ view: 'report' }, '');

    // Supabase 연동 시도
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const userId = session.user.id;

        await (supabase.from('users') as any).upsert({
          id: userId,
          age: profile.age,
          gender: profile.gender,
          family_history: profile.familyHistory,
          has_existing_policy: profile.hasExistingPolicy,
        });

        if (policies.length > 0) {
          for (const p of policies) {
            await (supabase.from('existing_policies') as any).insert({
              user_id: userId,
              insurer_name: p.insurerName,
              policy_name: p.policyName,
              monthly_premium: p.monthlyPremium,
              coverage_details: p.coverageDetails as any,
              document_url: p.documentUrl,
            });
          }
        }

        await (supabase.from('diagnosis_reports') as any).insert({
          user_id: userId,
          total_score: generatedReport.totalScore,
          status_summary: generatedReport.statusSummary,
          coverage_scores: generatedReport.coverageGaps as any,
          gap_analysis: {
            priorityItems: generatedReport.priorityItems,
            scoreGrade: generatedReport.scoreGrade,
          } as any,
          advice_tags: generatedReport.adviceTags,
          recommended_product_ids: generatedReport.recommendedProducts.map((p) => p.id),
        });
      }
    } catch (err) {
      console.log('Supabase 저장 건너뜀 (로컬 진단 모드):', err);
    }
  };

  const handleReset = () => {
    setReport(null);
    setUserProfile(null);
  };

  const handleLoadRecord = (profile: UserProfile, savedReport: DiagnosisReport) => {
    setUserProfile(profile);
    setReport(savedReport);
    window.history.pushState({ view: 'report' }, '');
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div className="w-full flex justify-center items-start min-h-screen relative">
      {/* 우측 상단 플로팅 보관함 & 설정 버튼 모음 */}
      <div className="fixed top-3 right-3 sm:right-6 z-40 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setIsSettingsOpen(true);
            window.history.pushState({ modal: 'settings' }, '');
          }}
          className="p-1.5 bg-white/95 hover:bg-white text-slate-600 hover:text-slate-900 rounded-full border border-slate-200 shadow-md transition-all backdrop-blur-xs"
          title="Gemini API 키 설정"
        >
          <span className="text-xs">⚙️</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSavedModalOpen(true);
            window.history.pushState({ modal: 'saved' }, '');
          }}
          className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 font-bold text-xs rounded-full border border-slate-200 shadow-md flex items-center gap-1.5 transition-all backdrop-blur-xs"
        >
          <Bookmark className="w-3.5 h-3.5 text-blue-600" />
          <span>보관함</span>
        </button>
      </div>

      {/* 진단 결과 뷰 또는 입력 폼 */}
      {report && userProfile ? (
        <DiagnosisReportView
          report={report}
          profile={userProfile}
          onReset={handleReset}
        />
      ) : (
        <MultiStepForm onComplete={handleFormComplete} />
      )}

      {/* 가족별 진단 결과 보관함 모달 */}
      <SavedRecordsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadRecord={handleLoadRecord}
        currentProfile={userProfile}
        currentReport={report}
      />

      {/* API 키 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
