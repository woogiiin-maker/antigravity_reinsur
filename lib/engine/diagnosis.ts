import {
  CoverageDetails,
  CoverageGap,
  CoverageKey,
  COVERAGE_CATEGORIES,
  DiagnosisReport,
  ExistingPolicy,
  InsuranceProduct,
  PolicyContribution,
  ProposedComparisonResult,
  UserProfile,
} from '@/types/insurance';
import { SAMPLE_PRODUCTS } from '@/lib/data/sampleProducts';

/**
 * 나이에 따른 연령대 그룹 판별
 */
export function getAgeGroup(age: number): '20s' | '30_40s' | '50s_plus' {
  if (age < 30) return '20s';
  if (age < 50) return '30_40s';
  return '50s_plus';
}

/**
 * 9대 핵심 보장 항목별 표준 권장 보장금액 산출
 */
export function calculateRecommendedCoverages(profile: UserProfile): Record<CoverageKey, number> {
  const ageGroup = getAgeGroup(profile.age);

  // 연령대 기본 표준 권장 보장금액 (원 단위)
  const base: Record<CoverageKey, number> = {
    cancer: ageGroup === '20s' ? 30_000_000 : ageGroup === '30_40s' ? 50_000_000 : 35_000_000,
    brain: ageGroup === '20s' ? 20_000_000 : ageGroup === '30_40s' ? 30_000_000 : 25_000_000,
    heart: ageGroup === '20s' ? 20_000_000 : ageGroup === '30_40s' ? 30_000_000 : 25_000_000,
    nonReimbursedCancer: ageGroup === '20s' ? 20_000_000 : 30_000_000,
    cancerLivingCare: 20_000_000,
    heavyParticle: 30_000_000,
    diseaseDisability80: ageGroup === '50s_plus' ? 30_000_000 : 20_000_000,
    surgery: ageGroup === '20s' ? 5_000_000 : ageGroup === '30_40s' ? 15_000_000 : 10_000_000,
    circulatoryCare: 15_000_000,
    indemnity: 50_000_000, // 실손 기준
  };

  // 가족력 가중치 적용
  const history = profile.familyHistory || [];

  if (history.includes('cancer')) {
    base.cancer = Math.round(base.cancer * 1.5);
    base.nonReimbursedCancer = Math.round(base.nonReimbursedCancer * 1.3);
  }
  if (history.includes('brain') || history.includes('hypertension')) {
    const factor = history.includes('brain') ? 1.5 : 1.25;
    base.brain = Math.round(base.brain * factor);
    base.circulatoryCare = Math.round(base.circulatoryCare * factor);
  }
  if (history.includes('heart') || history.includes('diabetes')) {
    const factor = history.includes('heart') ? 1.5 : 1.25;
    base.heart = Math.round(base.heart * factor);
    base.circulatoryCare = Math.round(base.circulatoryCare * factor);
  }

  return base;
}

/**
 * 기존 가입 보험 9대 핵심 보장 합산
 */
export function aggregateExistingCoverages(policies: ExistingPolicy[]): CoverageDetails {
  const total: CoverageDetails = {
    cancer: 0,
    brain: 0,
    heart: 0,
    nonReimbursedCancer: 0,
    cancerLivingCare: 0,
    heavyParticle: 0,
    diseaseDisability80: 0,
    surgery: 0,
    circulatoryCare: 0,
    indemnity: false,
  };

  for (const p of policies) {
    if (!p.coverageDetails) continue;
    total.cancer += p.coverageDetails.cancer || 0;
    total.brain += p.coverageDetails.brain || 0;
    total.heart += p.coverageDetails.heart || 0;
    total.nonReimbursedCancer = (total.nonReimbursedCancer || 0) + (p.coverageDetails.nonReimbursedCancer || 0);
    total.cancerLivingCare = (total.cancerLivingCare || 0) + (p.coverageDetails.cancerLivingCare || 0);
    total.heavyParticle = (total.heavyParticle || 0) + (p.coverageDetails.heavyParticle || 0);
    total.diseaseDisability80 = (total.diseaseDisability80 || 0) + (p.coverageDetails.diseaseDisability80 || 0);
    total.surgery += p.coverageDetails.surgery || 0;
    total.circulatoryCare = (total.circulatoryCare || 0) + (p.coverageDetails.circulatoryCare || 0);
    if (p.coverageDetails.indemnity) {
      total.indemnity = true;
    }
  }

  return total;
}

/**
 * 보험 보장 진단 및 리모델링 종합 분석 함수
 */
export function diagnoseInsurance(
  profile: UserProfile,
  policies: ExistingPolicy[] = [],
  availableProducts: InsuranceProduct[] = SAMPLE_PRODUCTS
): DiagnosisReport {
  const recommended = calculateRecommendedCoverages(profile);
  const current = aggregateExistingCoverages(policies);
  const totalCurrentPremium = policies.reduce((sum, p) => sum + (Number(p.monthlyPremium) || 0), 0);

  // 모든 증권의 제외된 한정보장 수집
  const allExcludedCoverages = policies.flatMap((p) => p.excludedLimitedCoverages || []);
  const hasLimitedCoverageRisk = allExcludedCoverages.length > 0;

  // 항목별 가중치 (총 100%)
  const weights: Record<CoverageKey, number> = {
    cancer: 0.20,
    brain: 0.18,
    heart: 0.18,
    nonReimbursedCancer: 0.08,
    cancerLivingCare: 0.06,
    heavyParticle: 0.06,
    diseaseDisability80: 0.06,
    surgery: 0.08,
    circulatoryCare: 0.05,
    indemnity: 0.05,
  };

  const coverageGaps: CoverageGap[] = [];
  const priorityItems: string[] = [];
  const adviceTags: string[] = [];

  const keys: CoverageKey[] = [
    'cancer',
    'brain',
    'heart',
    'nonReimbursedCancer',
    'cancerLivingCare',
    'heavyParticle',
    'diseaseDisability80',
    'surgery',
    'circulatoryCare',
    'indemnity',
  ];

  let weightedScoreSum = 0;

  keys.forEach((key) => {
    const info = COVERAGE_CATEGORIES[key];
    const recAmt = recommended[key];
    let curAmt = 0;
    let rate = 0;

    if (key === 'indemnity') {
      curAmt = current.indemnity ? recAmt : 0;
      rate = current.indemnity ? 100 : 0;
    } else {
      curAmt = (current as any)[key] || 0;
      rate = recAmt > 0 ? Math.min(150, Math.round((curAmt / recAmt) * 100)) : 100;
    }

    weightedScoreSum += Math.min(100, rate) * weights[key];

    let status: 'insufficient' | 'adequate' | 'excessive' = 'adequate';
    let note = '';

    if (rate < 70) {
      status = 'insufficient';
      note = `권장 대비 ${(recAmt - curAmt).toLocaleString()}원 부족`;
      priorityItems.push(info.label);
    } else if (rate > 130) {
      status = 'excessive';
      note = `권장 대비 보장 규모가 충분하며 초과 가입 상태`;
    } else {
      status = 'adequate';
      note = `권장 기준에 적합하게 충족`;
    }

    // 증권별 기여 내역 추출
    const contributions: PolicyContribution[] = [];
    for (const p of policies) {
      if (!p.coverageDetails) continue;
      const amt = (p.coverageDetails as any)[key] || 0;
      if (key === 'indemnity' && p.coverageDetails.indemnity) {
        contributions.push({
          insurerName: p.insurerName,
          policyName: p.policyName,
          amount: recAmt,
          hasIndemnity: true,
        });
      } else if (amt > 0) {
        contributions.push({
          insurerName: p.insurerName,
          policyName: p.policyName,
          amount: amt,
        });
      }
    }

    // 해당 카테고리에 속하는 제외된 한정보장 필터링
    const excludedForThisCategory = allExcludedCoverages.filter((ex) => {
      const name = ex.name.toLowerCase();
      if (key === 'cancer') return name.includes('암');
      if (key === 'brain') return name.includes('뇌') || name.includes('졸중');
      if (key === 'heart') return name.includes('심') || name.includes('경색');
      if (key === 'surgery') return name.includes('수술');
      return false;
    });

    coverageGaps.push({
      category: key,
      label: info.label,
      currentAmount: curAmt,
      recommendedAmount: recAmt,
      fulfillmentRate: rate,
      status,
      note,
      ruleNote: info.ruleNote,
      contributions,
      excludedItems: excludedForThisCategory,
    });
  });

  const totalScore = Math.round(weightedScoreSum);

  let scoreGrade: '안심' | '보통' | '주의' | '위험' = '보통';
  let statusSummary = '';

  if (totalScore >= 85) {
    scoreGrade = '안심';
    statusSummary = '전반적인 핵심 9대 보장이 든든하게 구성되어 있습니다.';
  } else if (totalScore >= 70) {
    scoreGrade = '보통';
    statusSummary = '필수 보장은 있으나 일부 핵심 질환의 진단비 및 최신 치료비 보강이 권장됩니다.';
  } else if (totalScore >= 50) {
    scoreGrade = '주의';
    statusSummary = '주요 질환 보장에 상당한 공백이 있어 정밀 리모델링이 시급합니다.';
  } else {
    scoreGrade = '위험';
    statusSummary = '핵심 질병 진단비 및 수술비가 절대적으로 부족한 고위험 상태입니다.';
  }

  // 리모델링 어드바이스 태그
  if (priorityItems.includes('암 진단비')) adviceTags.push('순수 일반암 집중 보강');
  if (priorityItems.includes('뇌혈관질환 진단비')) adviceTags.push('뇌혈관(I60~I69) 필수 방어');
  if (priorityItems.includes('허혈성심장질환 진단비')) adviceTags.push('협심증 대비 심장 보강');
  if (priorityItems.includes('비급여암 주요치료비')) adviceTags.push('최신 표적·비급여 치료비 탑재');
  if (priorityItems.includes('질병·상해 종수술비')) adviceTags.push('1~5종 다빈도 수술비 보강');
  if (!current.indemnity) adviceTags.push('실손의료비 최우선 가입');
  if (hasLimitedCoverageRisk) adviceTags.push('한정 보장 ➔ 순수 진단비 전환');

  // 추천 상품 매칭
  const recommendedProducts = selectBestProducts(profile, coverageGaps, availableProducts);

  return {
    totalScore,
    scoreGrade,
    statusSummary,
    coverageGaps,
    adviceTags: Array.from(new Set(adviceTags)),
    priorityItems,
    recommendedProducts,
    totalCurrentPremium,
    excludedLimitedCoverages: allExcludedCoverages,
    hasLimitedCoverageRisk,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 제안/견적받은 보험 추가 시 보완 효과 Before vs After 비교 함수
 */
export function compareProposedPolicies(
  profile: UserProfile,
  existingPolicies: ExistingPolicy[],
  proposedPolicies: ExistingPolicy[]
): ProposedComparisonResult {
  const beforeReport = diagnoseInsurance(profile, existingPolicies);
  const combinedPolicies = [...existingPolicies, ...proposedPolicies];
  const afterReport = diagnoseInsurance(profile, combinedPolicies);

  const beforePremium = beforeReport.totalCurrentPremium;
  const afterPremium = afterReport.totalCurrentPremium;
  const premiumIncrease = afterPremium - beforePremium;

  const improvedCategories: string[] = [];
  const redundantCategories: string[] = [];

  afterReport.coverageGaps.forEach((afterGap) => {
    const beforeGap = beforeReport.coverageGaps.find((g) => g.category === afterGap.category);
    if (!beforeGap) return;

    if (beforeGap.status === 'insufficient' && (afterGap.status === 'adequate' || afterGap.fulfillmentRate > beforeGap.fulfillmentRate)) {
      improvedCategories.push(afterGap.label);
    } else if (beforeGap.status === 'excessive' || (beforeGap.fulfillmentRate >= 100 && afterGap.fulfillmentRate > 130)) {
      redundantCategories.push(afterGap.label);
    }
  });

  let aiEvaluation = '';
  if (improvedCategories.length > 0 && redundantCategories.length === 0) {
    aiEvaluation = `부족했던 [${improvedCategories.join(', ')}] 보장이 이상적으로 보강되어 매우 추천하는 리모델링 플랜입니다.`;
  } else if (improvedCategories.length > 0 && redundantCategories.length > 0) {
    aiEvaluation = `[${improvedCategories.join(', ')}]의 보완 효과는 우수하나, 이미 충분한 [${redundantCategories.join(', ')}]이 중복 설계되어 불필요한 보험료 지출이 발생할 수 있습니다.`;
  } else if (redundantCategories.length > 0) {
    aiEvaluation = `현재 보장으로도 충분한 상태에서 [${redundantCategories.join(', ')}]이 과도하게 중복 가입되어 가입 실익이 낮습니다.`;
  } else {
    aiEvaluation = `월 ${premiumIncrease.toLocaleString()}원의 추가 비용 대비 실질적 보완 체감 효과를 재검토하시기 바랍니다.`;
  }

  return {
    beforeScore: beforeReport.totalScore,
    afterScore: afterReport.totalScore,
    beforePremium,
    afterPremium,
    premiumIncrease,
    gapsBefore: beforeReport.coverageGaps,
    gapsAfter: afterReport.coverageGaps,
    improvedCategories,
    redundantCategories,
    aiEvaluation,
  };
}

/**
 * 사용자 상황 및 부족한 보장 갭에 가장 적합한 상품 매칭
 */
export function selectBestProducts(
  profile: UserProfile,
  gaps: CoverageGap[],
  allProducts: InsuranceProduct[]
): InsuranceProduct[] {
  const age = profile.age;
  const gender = profile.gender;

  const eligible = allProducts.filter((p) => {
    const ageOk = age >= p.targetAgeMin && age <= p.targetAgeMax;
    const genderOk = p.targetGender === 'all' || p.targetGender === gender;
    return ageOk && genderOk;
  });

  const deficientKeys = gaps.filter((g) => g.status === 'insufficient').map((g) => g.category);

  const scored = eligible.map((prod) => {
    let matchScore = 0;

    if (age < 30 && prod.category === 'youth') matchScore += 30;
    if (age >= 30 && age < 50 && prod.category === 'standard_health') matchScore += 30;
    if (age >= 50 && prod.category === 'simplified_care') matchScore += 30;

    if (deficientKeys.includes('cancer') && prod.baseCoverages.cancer >= 40_000_000) matchScore += 25;
    if (deficientKeys.includes('brain') && prod.baseCoverages.brain >= 30_000_000) matchScore += 20;
    if (deficientKeys.includes('heart') && prod.baseCoverages.heart >= 30_000_000) matchScore += 20;

    if (prod.category === 'cancer_focus' && profile.familyHistory?.includes('cancer')) matchScore += 25;
    if (prod.category === 'heart_brain' && (profile.familyHistory?.includes('brain') || profile.familyHistory?.includes('heart'))) matchScore += 25;

    return { product: prod, score: matchScore };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.product);
}