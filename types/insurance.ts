export type Gender = 'male' | 'female';
export type TargetGender = 'male' | 'female' | 'all';

// 엄격한 순수 전체 보장 9대 핵심 항목 + 실손
export type CoverageKey =
  | 'cancer'
  | 'brain'
  | 'heart'
  | 'nonReimbursedCancer'
  | 'cancerLivingCare'
  | 'heavyParticle'
  | 'diseaseDisability80'
  | 'surgery'
  | 'circulatoryCare'
  | 'indemnity';

export interface CoverageItem {
  key: CoverageKey;
  label: string;
  unit: string;
  description: string;
  ruleNote: string;
}

export const COVERAGE_CATEGORIES: Record<CoverageKey, { label: string; unit: string; description: string; ruleNote: string }> = {
  cancer: {
    label: '암 진단비',
    unit: '원',
    description: '어떤 암이든 확정 진단 시 100% 지급',
    ruleNote: '순수 일반암만 인정 (남녀특정암, 여성특정암, 3대/5대암, 소액암, 유사암 제외)',
  },
  brain: {
    label: '뇌혈관질환 진단비',
    unit: '원',
    description: '뇌출혈, 뇌경색 등 뇌혈관 질환 전체(I60~I69) 보장',
    ruleNote: '뇌혈관 전체만 인정 (뇌졸중, 뇌경색, 뇌출혈 한정 제외)',
  },
  heart: {
    label: '허혈성심장질환 진단비',
    unit: '원',
    description: '협심증(I20), 급성심근경색(I21) 등 허혈성 심장질환 전체 보장',
    ruleNote: '협심증 포함 허혈성 전체만 인정 (급성심근경색증 한정 제외)',
  },
  nonReimbursedCancer: {
    label: '비급여암 주요치료비',
    unit: '원',
    description: '표적항암제, 면역항암제, 로봇수술 등 최신 비급여 암치료비',
    ruleNote: '비급여 항암 및 치료비 전체 인정 (특정 병원/부위 한정 제외)',
  },
  cancerLivingCare: {
    label: '암 주요치료 생활비',
    unit: '원',
    description: '암 치료 및 투병 기간 중 소득 공백을 보전하는 생활자금',
    ruleNote: '암 치료 기간 계속 지급 생활자금 인정',
  },
  heavyParticle: {
    label: '항암 중입자·양성자 치료비',
    unit: '원',
    description: '꿈의 암 치료기인 중입자 가속 및 양성자 방사선 치료비',
    ruleNote: '중입자/양성자 방사선 치료비 전체 인정',
  },
  diseaseDisability80: {
    label: '질병후유장해 (80% 이상)',
    unit: '원',
    description: '질병으로 인한 80% 이상 중증 후유장해 발생 시 일시금/연금 지급',
    ruleNote: '신체 전반 80% 이상 중증 질병후유장해 전체 인정',
  },
  surgery: {
    label: '질병·상해 종수술비',
    unit: '원',
    description: '질병 및 상해 1~5종 관혈/비관혈 수술 회당 반복 지급',
    ruleNote: '질병/상해 1~5종 전체 수술비 인정 (특정질환 수술비 제외)',
  },
  circulatoryCare: {
    label: '순환계질환 주요치료비',
    unit: '원',
    description: '뇌·심장 순환계 질환 관상동맥스텐트, 혈전용해치료비 등 주요 치료비',
    ruleNote: '순환계 주요 치료비 전체 인정',
  },
  indemnity: {
    label: '실손의료비',
    unit: '보장여부',
    description: '병원 입원 및 통원 치료비 실손 보상',
    ruleNote: '표준 실손의료비 가입 여부',
  },
};

export interface CoverageDetails {
  cancer: number;
  brain: number;
  heart: number;
  nonReimbursedCancer?: number;
  cancerLivingCare?: number;
  heavyParticle?: number;
  diseaseDisability80?: number;
  surgery: number;
  circulatoryCare?: number;
  indemnity: boolean; // 실비 가입 여부
}

export interface UserProfile {
  id?: string;
  age: number;
  gender: Gender;
  familyHistory: string[]; // e.g. ['cancer', 'brain', 'heart', 'hypertension', 'diabetes']
  hasExistingPolicy: boolean;
}

export interface ExcludedLimitedCoverage {
  name: string;
  amount: number;
  reason: string;
}

export interface ExistingPolicy {
  id?: string;
  userId?: string;
  insurerName: string;
  policyName: string;
  coverageDetails: CoverageDetails;
  monthlyPremium: number;
  maturityDate?: string;
  documentUrl?: string;
  insuredAge?: number; // 자동 추출된 피보험자 나이
  insuredGender?: Gender; // 자동 추출된 피보험자 성별
  isGenderUnknown?: boolean; // 성별 미확인 여부
  genderInferredFrom?: string; // 성별 추정 근거 (예: '상품명(여성전용)', '주민등록번호')
  rawExtractedData?: any;
  excludedLimitedCoverages?: ExcludedLimitedCoverage[];
  limitedCoverageAlert?: string;
}

export interface CoveragePremiumItem {
  name: string; // 특약/담보명 (예: '일반암 진단비 (순수 일반암 100%)')
  coverageAmount: number; // 보장금액 (원)
  monthlyPremium: number; // 개별 월 보험료 (원)
  description?: string; // 보장 상세 설명
  condition?: string; // 보장/감액 조건 (예: '90일 면책, 감액기간 없음')
}

export interface SubscriptionTerms {
  paymentPeriod: string; // 납입 및 보장기간 (예: '20년납 90세만기')
  renewalType: string; // 갱신 유형 (예: '비갱신형')
  underwriting: string; // 심사 유형 (예: '표준체(건강체) 심사' 또는 '간편고지(3.5.5)')
  refundType: string; // 환급금 유형 (예: '해약환급금 미지급형 (약 20~30% 할인)')
  waitingPeriod: string; // 면책 조건 (예: '암 90일 면책 / 뇌·심장 즉시 100%')
}

export interface InsuranceProduct {
  id: string;
  productName: string;
  insurerName: string;
  insurerType?: 'non_life' | 'life'; // 손해보험사 | 생명보험사
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: TargetGender;
  category: 'youth' | 'standard_health' | 'simplified_care' | 'cancer_focus' | 'heart_brain';
  baseCoverages: CoverageDetails;
  monthlyPremiumEstimate: number;
  keyFeatures: string[];
  isActive?: boolean;
  coverageBreakdown?: CoveragePremiumItem[];
  subscriptionTerms?: SubscriptionTerms;
}

export interface RecommendationRule {
  id?: string;
  ageGroup: '20s' | '30_40s' | '50s_plus' | 'all';
  gender: TargetGender;
  familyDisease?: string;
  targetCoverageCategory: CoverageKey;
  standardCoverageAmount: number;
  weight: number;
  priority: number;
  recommendationNote: string;
}

export interface PolicyContribution {
  insurerName: string;
  policyName: string;
  amount: number;
  hasIndemnity?: boolean;
}

export interface CoverageGap {
  category: CoverageKey;
  label: string;
  currentAmount: number;
  recommendedAmount: number;
  fulfillmentRate: number; // 0 ~ 100 (%)
  status: 'insufficient' | 'adequate' | 'excessive';
  note: string;
  ruleNote?: string; // 보장 판정 기준 안내
  contributions?: PolicyContribution[]; // 어느 보험에 얼마 들어있는지
  excludedItems?: ExcludedLimitedCoverage[]; // 해당 항목에서 제외된 한정보장
}

export interface ProposedComparisonResult {
  beforeScore: number;
  afterScore: number;
  beforePremium: number;
  afterPremium: number;
  premiumIncrease: number;
  gapsBefore: CoverageGap[];
  gapsAfter: CoverageGap[];
  improvedCategories: string[];
  redundantCategories: string[];
  aiEvaluation: string;
}

export interface DiagnosisReport {
  id?: string;
  userId?: string;
  totalScore: number;
  scoreGrade: '안심' | '보통' | '주의' | '위험';
  statusSummary: string;
  coverageGaps: CoverageGap[];
  adviceTags: string[];
  priorityItems: string[];
  recommendedProducts: InsuranceProduct[];
  totalCurrentPremium: number;
  excludedLimitedCoverages?: ExcludedLimitedCoverage[];
  hasLimitedCoverageRisk?: boolean;
  proposedComparison?: ProposedComparisonResult;
  createdAt?: string;
}

