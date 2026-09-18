'use client';

import React, { useState } from 'react';
import { MultiStepForm } from '@/components/form/MultiStepForm';
import { DiagnosisReportView } from '@/components/report/DiagnosisReportView';
import { diagnoseInsurance } from '@/lib/engine/diagnosis';
import { DiagnosisReport, ExistingPolicy, UserProfile } from '@/types/insurance';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleFormComplete = async (profile: UserProfile, policies: ExistingPolicy[]) => {
    // 1. 진단 및 리모델링 엔진 실행
    const generatedReport = diagnoseInsurance(profile, policies);
    setUserProfile(profile);
    setReport(generatedReport);

    // 2. Supabase DB 비동기 저장 시도 (환경변수가 설정되어 있고 사용자가 로그인되어 있는 경우)
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const userId = session.user.id;

        // user profile 저장/업데이트
        await (supabase.from('users') as any).upsert({
          id: userId,
          age: profile.age,
          gender: profile.gender,
          family_history: profile.familyHistory,
          has_existing_policy: profile.hasExistingPolicy,
        });

        // 기존 증권 정보 저장
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

        // 진단 리포트 저장
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
      // Supabase 연동 미완료 개발 환경에서도 UI 진단 리포트는 정상 동작
      console.log('Supabase 저장 건너뜀 (로컬 진단 모드):', err);
    }
  };

  const handleReset = () => {
    setReport(null);
    setUserProfile(null);
  };

  return (
    <div className="w-full flex justify-center items-start min-h-screen">
      {report && userProfile ? (
        <DiagnosisReportView
          report={report}
          profile={userProfile}
          onReset={handleReset}
        />
      ) : (
        <MultiStepForm onComplete={handleFormComplete} />
      )}
    </div>
  );
}
