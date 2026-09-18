import {
  CoverageDetails,
  CoverageGap,
  CoverageKey,
  COVERAGE_CATEGORIES,
  DiagnosisReport,
  ExistingPolicy,
  InsuranceProduct,
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
 * 연령대 및 가족력에 따른 표준 권장 보장금액 산출
 */
export function calculateRecommendedCoverages(profile: UserProfile): Record<CoverageKey, number> {
  const ageGroup = getAgeGroup(profile.age);

  // 연령대 기본 표준 보장금액 (원 단위)
  const base: Record<CoverageKey, number> = {
    cancer: ageGroup === '20s' ? 30_000_000 : ageGroup === '30_40s' ? 50_000_000 : 35_000_000,
    brain: ageGroup === '20s' ? 20_000_000 : ageGroup === '30_40s' ? 30_000_000 : 25_000_000,
    heart: ageGroup === '20s' ? 20_000_000 : ageGroup === '30_40s' ? 30_000_000 : 25_000_000,
    surgery: ageGroup === '20s' ? 5_000_000 : ageGroup === '30_40s' ? 15_000_000 : 10_000_000,
    indemnity: 50_000_000, // 실손 기준
  };

  // 가족력 가중치 적용
  const history = profile.familyHistory || [];

  if (history.includes('cancer')) {
    base.cancer = Math.round(base.cancer * 1.5);
  }
  if (history.includes('brain') || history.includes('hypertension')) {
    const factor = history.includes('brain') ? 1.5 : 1.25;
    base.brain = Math.round(base.brain * factor);
  }
  if (history.includes('heart') || history.includes('diabetes')) {
    const factor = history.includes('heart') ? 1.5 : 1.25;
    base.heart = Math.round(base.heart * factor);
  }

  return base;
}

/**
 * 기존 가입 보험 보장 합산
 */
export function aggregateExistingCoverages(policies: ExistingPolicy[]): CoverageDetails {
  const total: CoverageDetails = {
    cancer: 0,
    brain: 0,
    heart: 0,
    surgery: 0,
    indemnity: false,
  };

  for (const p of policies) {
    if (!p.coverageDetails) continue;
    total.cancer += p.coverageDetails.cancer || 0;
    total.brain += p.coverageDetails.brain || 0;
    total.heart += p.coverageDetails.heart || 0;
    total.surgery += p.coverageDetails.surgery || 0;
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
  const isRemodeling = profile.hasExistingPolicy && policies.length > 0;

  // 항목별 가중치 (총 100%)
  const weights: Record<CoverageKey, number> = {
    cancer: 0.30,
    brain: 0.25,
    heart: 0.25,
    indemnity: 0.10,
    surgery: 0.10,
  };

  const coverageGaps: CoverageGap[] = [];
  const priorityItems: string[] = [];
  const adviceTags: string[] = [];

  const keys: CoverageKey[] = ['cancer', 'brain', 'heart', 'indemnity', 'surgery'];

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
      curAmt = current[key] || 0;
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

    coverageGaps.push({
      category: key,
      label: info.label,
      currentAmount: curAmt,
      recommendedAmount: recAmt,
      fulfillmentRate: Math.min(100, rate),
      status,
      note,
    });
  });

  const totalScore = isRemodeling ? Math.round(weightedScoreSum) : 15;

  let scoreGrade: '안심' | '보통' | '주의' | '위험' = '보통';
  let statusSummary = '';

  if (totalScore >= 85) {
    scoreGrade = '안심';
    statusSummary = '주요 핵심 질병에 대한 든든한 보장망을 이미 구축하셨습니다.';
    adviceTags.push('기존 보험 유지 권장', '특약 주기적 점검');
  } else if (totalScore >= 65) {
    scoreGrade = '보통';
    statusSummary = '기본 뼈대는 갖추었으나, 특정 질병군에 대한 핀셋 보완이 필요합니다.';
    adviceTags.push('특약 추가 보완 필요');
  } else if (totalScore >= 40) {
    scoreGrade = '주의';
    statusSummary = '3대 질병 중 일부 공백이 있어 큰 병 발생 시 자부담 위험이 큽니다.';
    adviceTags.push('보장 공백 집중 리모델링', '특약 추가 보완 필요');
  } else {
    scoreGrade = '위험';
    statusSummary = isRemodeling
      ? '가입된 보험료 대비 필수 보장 항목이 크게 부족합니다.'
      : '현재 가입된 보장이 없어 질병 및 사고 발생 시 전액 자부담 위험이 있습니다.';
    adviceTags.push(isRemodeling ? '전면 리모델링 시급' : '신규 건강보험 필수 가입');
  }

  // 특정 질환 한정 보장(여성특정암, 뇌졸중 등) 감지 시 리스크 분석
  const allExcludedCoverages = policies.flatMap((p) => p.excludedLimitedCoverages || []);
  const hasLimitedCoverageRisk = allExcludedCoverages.length > 0;

  if (hasLimitedCoverageRisk) {
    adviceTags.push('보장 범위 협소(한정 특약)', '순수 일반 진단비 전환 필요');
    if (isRemodeling) {
      statusSummary += ' (※ 기존 증권의 여성특정암·뇌졸중 등 한정 보장은 미지급 위험으로 인해 제외되었습니다.)';
    }
  }

  // 가족력 관련 태그 추가
  if (profile.familyHistory && profile.familyHistory.length > 0) {
    adviceTags.push('가족력 맞춤 강화');
  }

  // 보험료 과다 여부 체크 (가입 보험료가 30만원 이상인데 점수가 70점 미만일 때)
  if (totalCurrentPremium > 250_000 && totalScore < 70) {
    adviceTags.push('중복 보장 감축 권장');
  }

  // 추천 상품 필터링
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
 * 사용자 상황 및 부족한 보장 갭에 가장 적합한 상품 2~3종 매칭
 */
export function selectBestProducts(
  profile: UserProfile,
  gaps: CoverageGap[],
  allProducts: InsuranceProduct[]
): InsuranceProduct[] {
  const age = profile.age;
  const gender = profile.gender;

  // 1차 필터링: 나이와 성별 부합 상품
  const eligible = allProducts.filter((p) => {
    const ageOk = age >= p.targetAgeMin && age <= p.targetAgeMax;
    const genderOk = p.targetGender === 'all' || p.targetGender === gender;
    return ageOk && genderOk;
  });

  // 부족 항목 파악
  const deficientKeys = gaps.filter((g) => g.status === 'insufficient').map((g) => g.category);

  // 상품 스코어링
  const scored = eligible.map((prod) => {
    let matchScore = 0;

    // 연령 카테고리 매칭
    if (age < 30 && prod.category === 'youth') matchScore += 30;
    if (age >= 30 && age < 50 && prod.category === 'standard_health') matchScore += 30;
    if (age >= 50 && prod.category === 'simplified_care') matchScore += 30;

    // 가족력 및 부족 갭 보완도 매칭
    if (deficientKeys.includes('cancer') && prod.baseCoverages.cancer >= 40_000_000) {
      matchScore += 25;
    }
    if (deficientKeys.includes('brain') && prod.baseCoverages.brain >= 30_000_000) {
      matchScore += 20;
    }
    if (deficientKeys.includes('heart') && prod.baseCoverages.heart >= 30_000_000) {
      matchScore += 20;
    }

    // 핀셋 보완 상품
    if (prod.category === 'cancer_focus' && profile.familyHistory?.includes('cancer')) {
      matchScore += 25;
    }
    if (prod.category === 'heart_brain' && (profile.familyHistory?.includes('brain') || profile.familyHistory?.includes('heart'))) {
      matchScore += 25;
    }

    return { product: prod, score: matchScore };
  });

  scored.sort((a, b) => b.score - a.score);

  // 상위 3개 상품 반환
  return scored.slice(0, 3).map((item) => item.product);
}
