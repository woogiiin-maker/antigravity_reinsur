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
  AgeGroupStrategyInfo,
} from '@/types/insurance';
import { SAMPLE_PRODUCTS } from '@/lib/data/sampleProducts';

/**
 * 연령대별 보험사 및 유튜브 전문 설계사 공통 권장 설계 전략 및 기준 산출 (태아~시니어 전 생애주기)
 */
export function getAgeGroupStrategy(age: number, isFetus?: boolean): AgeGroupStrategyInfo {
  if (isFetus || age < 0) {
    return {
      groupLabel: '태아 (임신 중 / 출산 전)',
      strategyTitle: '선천이상·신생아 입원일당 보장 & 30세 만기 계약전환 가성비 전략',
      strategyDesc:
        '출생 직후 발생 가능한 선천성 기형(Q코드 다빈도 혀유착/이개전우공 및 심장/뇌 기형) 수술비와 미숙아 인큐베이터 입원일당 확보가 최우선입니다. 유튜브 전문 분석 채널들은 100세 만기로 무리하게 10만원 이상 지출하기보다, 30세 만기로 3~5만원대 슬림하게 필수 특약을 채우고 30세 시점에 무심사 100세 계약전환하는 것을 만장일치로 추천합니다.',
      sources: '유튜브 대표 보험 채널(보부상, 보험탈출, 시그널플래너) 태아보험 팩트체크 & 주요 손보사(현대/KB/DB) 인수 가이드',
      keyPoints: [
        '임신 22주 이내 태아특약(선천이상 수술비, 저체중아/인큐베이터 입원일당) 필수 탑재',
        '30세 만기 가성비 플랜 + 30세 계약전환 제도 활용 (보험료 50% 이상 절감)',
        '성인 축소 담보인 뇌혈관·허혈성 각 5,000만원 및 소아암/백혈병 1억원 조기 선점',
      ],
      fetusSpecificNote: '출생 전 심사는 기본 남아 기준으로 산출되며, 출생 후 여아일 경우 차액이 환급 및 보험료가 인하됩니다.',
    };
  }
  if (age <= 18) {
    return {
      groupLabel: '영유아·어린이·청소년 (0~10대)',
      strategyTitle: '면책 없는 3대 질병 최대 한도 선점 & 평생 보장 뼈대 완성 플랜',
      strategyDesc:
        '성인과 달리 암 90일 면책기간이나 1년 감액기간 없이 가입 즉시 100% 보장됩니다. 나이가 들면 축소되는 뇌혈관·허혈성 진단비를 각 5,000만원 최대로 확보하고, 질병후유장해(3%~) 및 일상배상책임 1억원을 채워 평생 든든한 뼈대를 완성합니다.',
      sources: '주요 손보사 어린이보험 인수 가이드라인 및 전문 설계 채널 추천',
      keyPoints: [
        '가입 즉시 100% 보장 (성인 암 90일 면책 및 1년 50% 감액기간 없음)',
        '뇌혈관·허혈성 각 3,000~5,000만원 최대 한도 비갱신 선점',
        '질병후유장해 3% 이상(5,000만원) 및 가족일상생활배상책임(1억원) 탑재',
      ],
    };
  }
  if (age < 30) {
    return {
      groupLabel: '사회초년생·청년 (20대)',
      strategyTitle: '무해지 비갱신형 선점 및 2대 질환 한도 극대화 플랜',
      strategyDesc:
        '보험료가 가장 저렴한 20대 골든타임입니다. 해약환급금 미지급형(무해지)으로 보험료를 20~30% 절감하면서, 나이가 들면 축소되는 뇌혈관·허혈성 진단비를 3,000만원까지 확보하고 일반암 4,000~5,000만원을 20년납 90세만기 비갱신형으로 구축합니다.',
      sources: '유튜브 인기 보험 설계 채널(보부상, 보험탈출, 시그널플래너 등) 20대 표준 설계안',
      keyPoints: [
        '해약환급금 미지급형(무해지) 선택으로 표준형 대비 20~30% 저렴하게 가입',
        '뇌혈관·허혈성 진단비 3,000만원 축소 전 선점',
        '일반암 4,000~5,000만원 20년납 90세만기 비갱신형 완성',
      ],
    };
  }
  if (age < 50) {
    return {
      groupLabel: '경제활동·가장 (30~40대)',
      strategyTitle: '소득 공백(생활비) 방어 및 고액 암진단비 + 비급여 치료비 결합',
      strategyDesc:
        '가계 지출과 자녀 양육 부담이 가장 큰 시기입니다. 중대 질환 발병 시 최소 1~2년 치 연봉 수준(5,000~7,000만원)의 일반암 진단비를 확보하여 치료 기간의 생활비를 방어하고, 최신 표적·중입자 치료를 대비하는 종합 비급여 암치료비를 결합하는 것이 정석입니다.',
      sources: '주요 손보사(삼성·현대·DB·KB) 표준 보장 분석 및 유튜브 전문 설계사 공통 권장안',
      keyPoints: [
        '최소 1~2년 치 연봉 수준(5,000~7,000만원) 일반암 진단비로 소득 공백 방어',
        '종합 비급여 암주요치료비(연간 최대 2,000만원~1억원) 결합',
        '가족력(암/뇌/심장) 보유 시 해당 질환 1.3~1.5배 집중 상향',
      ],
    };
  }
  if (age < 60) {
    return {
      groupLabel: '발병 집중기 (50대)',
      strategyTitle: '3대 질병 발병 정점 대비 + 비급여 치료비·수술비 강화 플랜',
      strategyDesc:
        '암·뇌·심장 발병률이 급격히 치솟는 위험 구간입니다. 진단비 보험료 부담을 고려하여 일반암 4,000만원 수준을 방어선으로 두고, 최신 표적·중입자 치료를 보장하는 비급여 주요치료비와 다빈도 1~5종 수술비, 혈관질환 산정특례를 탄탄히 보강합니다.',
      sources: '50대 맞춤 리모델링 설계 기준 및 손해보험협회 질환별 진료비 통계',
      keyPoints: [
        '과도한 고액 진단비보다 비급여 치료비와 종수술비 조합으로 보험료 7~9만원대 방어',
        '뇌·심혈관 산정특례 진단비 및 1~5종 종합 수술비 탑재',
        '투약/유병력 시 3.5.5 또는 3.10.5 초간편 건강체 심사 활용',
      ],
    };
  }
  return {
    groupLabel: '시니어·노후기 (60대 이상)',
    strategyTitle: '가성비 실속형 치료비 및 간병인 사용일당·수술비 중심 플랜',
    strategyDesc:
      '보험사 인수 한도가 줄고 진단비 보험료가 매우 비싼 시기입니다. 무리한 고액 진단비보다 적은 보험료로 고액 비급여 치료를 해결하는 비급여암 주요치료비와 하루 15만원 지급되는 간병인 사용일당, 다빈도 수술비 위주로 실속 있게 구성합니다.',
    sources: '시니어 보험 리모델링 가이드 및 유튜브 노후 보장 분석 기준',
    keyPoints: [
      '비싼 진단비 지양, 하루 15만원 간병인 사용일당 최우선 확보',
      '고액 비급여 치료를 보장하는 비급여암 주요치료비 탑재',
      '골절/골다공증 및 노인성 다빈도 수술비 실속 구성',
    ],
  };
}

/**
 * 연령대별(보험사 및 유튜브 전문 설계 기준) 12대 핵심 보장 항목별 맞춤 권장 보장금액 산출
 */
export function calculateRecommendedCoverages(profile: UserProfile): Record<CoverageKey, number> {
  const isFetus = profile.isFetus || profile.age < 0;
  const age = isFetus ? 0 : profile.age || 35;
  let base: Record<CoverageKey, number>;

  if (isFetus || age <= 18) {
    // 태아 및 10대 이하 (태아·어린이·청소년 플랜: 뇌심장 한도 최대 선점 & 고액 소아암)
    base = {
      cancer: isFetus ? 70_000_000 : 50_000_000,
      similarCancer: 15_000_000,
      nonReimbursedCancer: 20_000_000,
      cancerLivingCare: 20_000_000,
      heavyParticle: 50_000_000,
      brain: 50_000_000, // 어린이 뇌혈관 최대 한도 5천만원
      heart: 50_000_000, // 어린이 허혈성 최대 한도 5천만원
      injuryDisability: 100_000_000,
      diseaseDisability80: 50_000_000,
      injurySurgery: 1_000_000,
      diseaseSurgery: 500_000,
      circulatoryCare: 10_000_000,
      surgery: 10_000_000,
      indemnity: 50_000_000,
    };
  } else if (age < 30) {
    // 20대 (사회초년생·청년 플랜: 비갱신 선점 및 뇌/심장 한도 최대화)
    base = {
      cancer: 50_000_000,
      similarCancer: 10_000_000,
      nonReimbursedCancer: 20_000_000,
      cancerLivingCare: 20_000_000,
      heavyParticle: 50_000_000,
      brain: 30_000_000,
      heart: 20_000_000,
      injuryDisability: 100_000_000,
      diseaseDisability80: 30_000_000,
      injurySurgery: 1_000_000,
      diseaseSurgery: 500_000,
      circulatoryCare: 15_000_000,
      surgery: 10_000_000,
      indemnity: 50_000_000,
    };
  } else if (age < 50) {
    // 30~40대 (경제활동·가장 플랜: 1~2년치 연봉 수준 암진단비 및 소득공백 방어)
    base = {
      cancer: 50_000_000,
      similarCancer: 10_000_000,
      nonReimbursedCancer: 20_000_000,
      cancerLivingCare: 20_000_000,
      heavyParticle: 50_000_000,
      brain: 25_000_000,
      heart: 15_000_000,
      injuryDisability: 100_000_000,
      diseaseDisability80: 30_000_000,
      injurySurgery: 1_000_000,
      diseaseSurgery: 500_000,
      circulatoryCare: 15_000_000,
      surgery: 10_000_000,
      indemnity: 50_000_000,
    };
  } else if (age < 60) {
    // 50대 (발병집중기 플랜: 암/뇌/심장 발병 정점 대비 + 비급여 치료비/수술비 조합)
    base = {
      cancer: 40_000_000,
      similarCancer: 10_000_000,
      nonReimbursedCancer: 20_000_000,
      cancerLivingCare: 20_000_000,
      heavyParticle: 50_000_000,
      brain: 20_000_000,
      heart: 15_000_000,
      injuryDisability: 100_000_000,
      diseaseDisability80: 30_000_000,
      injurySurgery: 1_000_000,
      diseaseSurgery: 500_000,
      circulatoryCare: 15_000_000,
      surgery: 10_000_000,
      indemnity: 50_000_000,
    };
  } else {
    // 60대 이상 (시니어·노후 플랜: 고액 진단비 대신 비급여 치료비 및 수술비 실속 중심)
    base = {
      cancer: 30_000_000,
      similarCancer: 6_000_000,
      nonReimbursedCancer: 20_000_000,
      cancerLivingCare: 10_000_000,
      heavyParticle: 30_000_000,
      brain: 15_000_000,
      heart: 10_000_000,
      injuryDisability: 50_000_000,
      diseaseDisability80: 20_000_000,
      injurySurgery: 1_000_000,
      diseaseSurgery: 500_000,
      circulatoryCare: 10_000_000,
      surgery: 5_000_000,
      indemnity: 50_000_000,
    };
  }

  // 성별 특화 가중치 적용 (전문가 분석 기준)
  if (profile.gender === 'female') {
    // 여성: 갑상선암(유사암) 발병률 및 부인과 질환 수술비 가중
    base.similarCancer = Math.round(base.similarCancer * 1.2);
    base.diseaseSurgery = Math.round(base.diseaseSurgery * 1.2);
  } else {
    // 남성: 3대 질병 중 뇌혈관/심혈관 발병률 우세
    base.brain = Math.round(base.brain * 1.1);
    base.heart = Math.round(base.heart * 1.1);
  }

  // 가족력 가중치 적용 (가족력 질환 1.3배 증액 및 암 최신 치료비 보강)
  const history = profile.familyHistory || [];

  if (history.includes('cancer')) {
    base.cancer = Math.round(base.cancer * 1.3);
    base.nonReimbursedCancer = Math.round(base.nonReimbursedCancer * 1.3);
    base.heavyParticle = Math.round(base.heavyParticle * 1.25);
  }
  if (history.includes('brain') || history.includes('hypertension')) {
    base.brain = Math.round(base.brain * 1.3);
    base.circulatoryCare = Math.round(base.circulatoryCare * 1.3);
  }
  if (history.includes('heart') || history.includes('diabetes')) {
    base.heart = Math.round(base.heart * 1.3);
    base.circulatoryCare = Math.round(base.circulatoryCare * 1.3);
  }

  return base;
}

/**
 * 기존 가입 보험 12대 핵심 보장 합산
 */
export function aggregateExistingCoverages(policies: ExistingPolicy[]): CoverageDetails {
  const total: CoverageDetails = {
    cancer: 0,
    similarCancer: 0,
    nonReimbursedCancer: 0,
    cancerLivingCare: 0,
    heavyParticle: 0,
    brain: 0,
    heart: 0,
    injuryDisability: 0,
    diseaseDisability80: 0,
    injurySurgery: 0,
    diseaseSurgery: 0,
    surgery: 0,
    circulatoryCare: 0,
    indemnity: false,
  };

  for (const p of policies) {
    if (!p.coverageDetails) continue;
    total.cancer += p.coverageDetails.cancer || 0;
    total.similarCancer = (total.similarCancer || 0) + (p.coverageDetails.similarCancer || 0);
    total.nonReimbursedCancer = (total.nonReimbursedCancer || 0) + (p.coverageDetails.nonReimbursedCancer || 0);
    total.cancerLivingCare = (total.cancerLivingCare || 0) + (p.coverageDetails.cancerLivingCare || 0);
    total.heavyParticle = (total.heavyParticle || 0) + (p.coverageDetails.heavyParticle || 0);
    total.brain += p.coverageDetails.brain || 0;
    total.heart += p.coverageDetails.heart || 0;
    total.injuryDisability = (total.injuryDisability || 0) + (p.coverageDetails.injuryDisability || 0);
    total.diseaseDisability80 = (total.diseaseDisability80 || 0) + (p.coverageDetails.diseaseDisability80 || 0);

    const injurySurg = p.coverageDetails.injurySurgery !== undefined ? p.coverageDetails.injurySurgery : (p.coverageDetails.surgery || 0);
    const diseaseSurg = p.coverageDetails.diseaseSurgery !== undefined ? p.coverageDetails.diseaseSurgery : (p.coverageDetails.surgery || 0);
    total.injurySurgery = (total.injurySurgery || 0) + injurySurg;
    total.diseaseSurgery = (total.diseaseSurgery || 0) + diseaseSurg;
    total.surgery = (total.surgery || 0) + (p.coverageDetails.surgery || 0);

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

  // 12대 핵심 항목별 가중치 (총 100%)
  const weights: Record<CoverageKey, number> = {
    cancer: 0.16,
    similarCancer: 0.08,
    nonReimbursedCancer: 0.08,
    cancerLivingCare: 0.08,
    heavyParticle: 0.06,
    brain: 0.14,
    heart: 0.14,
    injuryDisability: 0.06,
    diseaseDisability80: 0.06,
    injurySurgery: 0.05,
    diseaseSurgery: 0.05,
    circulatoryCare: 0.04,
    surgery: 0.00,
    indemnity: 0.00,
  };

  const coverageGaps: CoverageGap[] = [];
  const priorityItems: string[] = [];
  const adviceTags: string[] = [];

  // 2번 그림 기준 12개 핵심 보장 항목
  const keys: CoverageKey[] = [
    'cancer',
    'similarCancer',
    'nonReimbursedCancer',
    'cancerLivingCare',
    'heavyParticle',
    'brain',
    'heart',
    'injuryDisability',
    'diseaseDisability80',
    'injurySurgery',
    'diseaseSurgery',
    'circulatoryCare',
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
    } else if (key === 'injurySurgery') {
      curAmt = current.injurySurgery !== undefined ? current.injurySurgery : (current.surgery || 0);
      rate = recAmt > 0 ? Math.min(150, Math.round((curAmt / recAmt) * 100)) : 100;
    } else if (key === 'diseaseSurgery') {
      curAmt = current.diseaseSurgery !== undefined ? current.diseaseSurgery : (current.surgery || 0);
      rate = recAmt > 0 ? Math.min(150, Math.round((curAmt / recAmt) * 100)) : 100;
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
      let amt = 0;
      if (key === 'injurySurgery') {
        amt = p.coverageDetails.injurySurgery !== undefined ? p.coverageDetails.injurySurgery : (p.coverageDetails.surgery || 0);
      } else if (key === 'diseaseSurgery') {
        amt = p.coverageDetails.diseaseSurgery !== undefined ? p.coverageDetails.diseaseSurgery : (p.coverageDetails.surgery || 0);
      } else {
        amt = (p.coverageDetails as any)[key] || 0;
      }
      const policyMatched = p.matchedRiders?.[key] || [];

      if (key === 'indemnity' && p.coverageDetails.indemnity) {
        contributions.push({
          insurerName: p.insurerName,
          policyName: p.policyName,
          amount: recAmt,
          hasIndemnity: true,
          matchedRiders:
            policyMatched.length > 0
              ? policyMatched
              : [
                  {
                    riderName: '상해·질병 입원의료비 / 통원의료비 담보',
                    amount: recAmt,
                    note: '병원 실제 발생 치료비 보상 (자기부담금 차감 후 지급)',
                  },
                ],
          riderName: policyMatched[0]?.riderName || '실손의료비 담보',
          riderNote: policyMatched[0]?.note || '입원/통원 실제 의료비 보상',
        });
      } else if (amt > 0) {
        contributions.push({
          insurerName: p.insurerName,
          policyName: p.policyName,
          amount: amt,
          matchedRiders:
            policyMatched.length > 0
              ? policyMatched
              : [
                  {
                    riderName: `${info.label} 기본/주계약 담보`,
                    amount: amt,
                    note: `${p.insurerName} 정규 보장`,
                  },
                ],
          riderName: policyMatched[0]?.riderName || `${info.label} 정규 담보`,
          riderNote: policyMatched[0]?.note,
        });
      }
    }

    // 해당 카테고리에 속하는 제외된 한정보장 필터링
    const excludedForThisCategory = allExcludedCoverages.filter((ex) => {
      if (ex.targetCategory) return ex.targetCategory === key;
      const name = ex.name.toLowerCase();
      if (key === 'cancer') return name.includes('암') && !name.includes('유사') && !name.includes('수술') && !name.includes('치료');
      if (key === 'similarCancer') return name.includes('유사') || name.includes('소액');
      if (key === 'nonReimbursedCancer') return name.includes('표적') || name.includes('로봇') || (name.includes('항암') && !name.includes('중입자')) || (name.includes('암') && name.includes('치료'));
      if (key === 'cancerLivingCare') return name.includes('생활') || name.includes('자금');
      if (key === 'heavyParticle') return name.includes('중입자') || name.includes('양성자');
      if (key === 'brain') return name.includes('뇌') || name.includes('졸중');
      if (key === 'heart') return name.includes('심') || name.includes('경색');
      if (key === 'injuryDisability') return name.includes('상해') && (name.includes('장해') || name.includes('후유'));
      if (key === 'diseaseDisability80') return name.includes('질병') && (name.includes('장해') || name.includes('후유'));
      if (key === 'injurySurgery') return (name.includes('상해') && name.includes('수술')) || name.includes('골절');
      if (key === 'diseaseSurgery') return (name.includes('질병') || name.includes('암') || name.includes('부인') || name.includes('여성')) && name.includes('수술');
      if (key === 'circulatoryCare') return name.includes('순환') || name.includes('혈전');
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
    ageGroupStrategy: getAgeGroupStrategy(profile.age, profile.isFetus),
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
 * 유튜브 전문가 및 전 보험사 기준 나이, 성별, 가족력, 보장 갭 다차원 맞춤 상품 랭킹 매칭
 */
export function selectBestProducts(
  profile: UserProfile,
  gaps: CoverageGap[],
  allProducts: InsuranceProduct[]
): InsuranceProduct[] {
  const isFetus = Boolean(profile.isFetus || profile.age < 0);
  const age = isFetus ? -1 : profile.age;
  const gender = profile.gender;
  const familyHistory = profile.familyHistory || [];

  const eligible = allProducts.filter((p) => {
    // 태아일 때
    if (isFetus) {
      return p.targetAgeMin <= 0 && p.category === 'fetus_child';
    }
    // 어린이/청소년 (0~18세)
    if (age <= 18) {
      return (p.category === 'fetus_child' || p.category === 'youth') && age <= p.targetAgeMax;
    }
    // 성인 (19세 이상)
    const ageOk = age >= p.targetAgeMin && age <= p.targetAgeMax;
    const genderOk = p.targetGender === 'all' || p.targetGender === gender;
    return ageOk && genderOk;
  });

  const deficientKeys = gaps.filter((g) => g.status === 'insufficient').map((g) => g.category);

  const scored = eligible.map((prod) => {
    let matchScore = 0;
    const reasons: string[] = [];

    // 1. 태아 / 어린이 맞춤 평가
    if (isFetus) {
      if (prod.category === 'fetus_child') {
        matchScore += 60;
        reasons.push('임신 22주 이내 필수 태아 특약(선천이상 수술, 인큐베이터 입원) 완비');
      }
      if (prod.insurerName === '현대해상') {
        matchScore += 20;
        reasons.push('유튜브 전문가 선호도 1위 (대한민국 태아보험 부동의 점유율)');
      }
      if (prod.insurerName === 'KB손해보험') {
        matchScore += 15;
        reasons.push('무해지형 최고 가성비 및 성장기 발달 케어 특약');
      }
    } else if (age <= 18) {
      if (prod.category === 'fetus_child') {
        matchScore += 50;
        reasons.push('어린이 뇌혈관·허혈성 5천만원 한도 및 소아 고액암 선점');
      }
    }

    // 2. 성별 특화 평가
    if (gender === 'female' && prod.targetGender === 'female') {
      matchScore += 45;
      reasons.push('여성암(유방/자궁/난소) 100% 보장 및 부인과 다빈도 수술비 특화');
    }

    // 3. 연령대별 유튜브 전문가 가이드 평가
    if (age >= 19 && age < 30) {
      if (prod.category === 'youth') {
        matchScore += 35;
        reasons.push('20대 청년 전용 무해지 비갱신형 최저 보험료 플랜');
      }
    } else if (age >= 30 && age < 50) {
      if (prod.category === 'standard_health') {
        matchScore += 35;
        reasons.push('3040 가장 소득공백기 대비 든든한 3대 진단비 중심 설계');
      }
    } else if (age >= 50) {
      if (prod.category === 'simplified_care' || prod.category === 'senior_care') {
        matchScore += 40;
        reasons.push('50대 이상 발병 집중기 간편심사 및 수술비·간병비 실속형 플랜');
      }
    }

    // 4. 가족력 맞춤 가산점
    if (familyHistory.includes('cancer')) {
      if (prod.category === 'cancer_focus') {
        matchScore += 40;
        reasons.push('암 가족력 보유에 최적화된 원발·전이·재발암 계속 보장');
      } else if (prod.baseCoverages.cancer >= 50_000_000) {
        matchScore += 25;
        reasons.push('암 가족력 대비 일반암 5,000만원 고액 한도 확보');
      }
    }

    if (familyHistory.includes('brain') || familyHistory.includes('hypertension')) {
      if (prod.category === 'heart_brain' || prod.baseCoverages.brain >= 30_000_000) {
        matchScore += 30;
        reasons.push('뇌혈관/고혈압 가족력 방어를 위한 뇌혈관질환 집중 플랜');
      }
    }

    if (familyHistory.includes('heart') || familyHistory.includes('diabetes')) {
      if (prod.category === 'heart_brain' || prod.baseCoverages.heart >= 30_000_000) {
        matchScore += 30;
        reasons.push('심장/당뇨 합병증 방어를 위한 허혈성심장질환 집중 플랜');
      }
    }

    // 5. 현재 보장 갭 해소 기여도
    if (deficientKeys.includes('cancer') && prod.baseCoverages.cancer >= 40_000_000) {
      matchScore += 20;
    }
    if (deficientKeys.includes('brain') && prod.baseCoverages.brain >= 30_000_000) {
      matchScore += 15;
    }
    if (deficientKeys.includes('heart') && prod.baseCoverages.heart >= 30_000_000) {
      matchScore += 15;
    }
    if (deficientKeys.includes('surgery') && prod.baseCoverages.surgery >= 10_000_000) {
      matchScore += 15;
    }

    const enhancedProd = {
      ...prod,
      recommendationScoreReasons: reasons.length > 0 ? reasons : ['나이와 성별 기준 표준 권장 충족'],
    };

    return { product: enhancedProd, score: matchScore };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.product);
}