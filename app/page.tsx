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
  const [currentPolicies, setCurrentPolicies] = useState<ExistingPolicy[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // 모바일 뒤로가기(popstate) 제어: 사이트 이탈 방지
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }
      if (isSavedModalOpen) {
        setIsSavedModalOpen(false);
        return;
      }
      if (report) {
        setReport(null);
        setUserProfile(null);
        setCurrentPolicies([]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [report, isSavedModalOpen, isSettingsOpen]);

  const handleFormComplete = async (profile: UserProfile, policies: ExistingPolicy[]) => {
    const generatedReport = diagnoseInsurance(profile, policies);
    setUserProfile(profile);
    setCurrentPolicies(policies);
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

  return (
    <div className="w-full min-h-screen bg-slate-100/70 flex justify-center items-start py-0 sm:py-6 px-0 sm:px-4 relative">
      {/* 진단 결과 뷰 또는 입력 폼 */}
      {report && userProfile ? (
        <DiagnosisReportView
          report={report}
          profile={userProfile}
          existingPolicies={currentPolicies}
          onReset={handleReset}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSaved={() => setIsSavedModalOpen(true)}
        />
      ) : (
        <MultiStepForm
          onComplete={handleFormComplete}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSaved={() => setIsSavedModalOpen(true)}
        />
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
