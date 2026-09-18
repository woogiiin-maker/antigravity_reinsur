export type Gender = 'male' | 'female';
export type TargetGender = 'male' | 'female' | 'all';

// 보장 대분류 (2번 그림 기준)
export type CoverageGroup = '암' | '뇌,심장' | '기타';

// 2번 그림 기준 12대 핵심 보장 항목 + 실손
export type CoverageKey =
  | 'cancer'                // 일반암 진단비
  | 'similarCancer'         // 유사암 진단비
  | 'nonReimbursedCancer'   // 비급여암 주요치료비
  | 'cancerLivingCare'      // 암주요치료 생활비
  | 'heavyParticle'         // 항암중입자 방사선치료비
  | 'brain'                 // 뇌혈관 진단비
  | 'heart'                 // 허혈성심장질환 진단비
  | 'injuryDisability'      // 상해 후유장해 (3% 이상)
  | 'diseaseDisability80'   // 질병 후유장해 (80% 이상)
  | 'injurySurgery'         // 상해 수술비 (1~5종)
  | 'diseaseSurgery'        // 질병 수술비 (1~5종)
  | 'surgery'               // 기본/통합 수술비 (하위호환)
  | 'circulatoryCare'       // 순환계질환 주요치료비
  | 'indemnity';            // 실손의료비 (보조)

export interface CoverageItem {
  key: CoverageKey;
  group: CoverageGroup;
  label: string;
  unit: string;
  description: string;
  ruleNote: string;
  standardAmount: number; // 2번 그림 기준 표준 권장 금액
}

export const COVERAGE_CATEGORIES: Record<CoverageKey, {
  group: CoverageGroup;
  label: string;
  unit: string;
  description: string;
  ruleNote: string;
  standardAmount: number;
}> = {
  // [1] 암 보장군
  cancer: {
    group: '암',
    label: '일반암 진단비',
    unit: '원',
    description: '어떤 암이든 확정 진단 시 100% 지급',
    ruleNote: '순수 일반암만 인정 (남녀특정암, 여성특정암, 3대/5대암, 소액암, 유사암 제외)',
    standardAmount: 40_000_000,
  },
  similarCancer: {
    group: '암',
    label: '유사암 진단비',
    unit: '원',
    description: '갑상선암, 기타피부암, 제자리암, 경계성종양 확정 진단비',
    ruleNote: '4대 유사암(갑상선암, 기타피부암, 제자리암, 경계성종양) 진단비 인정',
    standardAmount: 10_000_000,
  },
  nonReimbursedCancer: {
    group: '암',
    label: '비급여암 주요치료비',
    unit: '원',
    description: '표적항암제, 면역항암제, 로봇수술 등 최신 비급여 암치료비 (연간 1회한)',
    ruleNote: '비급여 항암 및 치료비 전체 인정 (특정 병원/부위 한정 제외)',
    standardAmount: 20_000_000,
  },
  cancerLivingCare: {
    group: '암',
    label: '암주요치료 생활비',
    unit: '원',
    description: '암 치료 및 투병 기간 중 소득 공백을 보전하는 생활자금 (연간 1회한)',
    ruleNote: '암 치료 기간 계속 지급 생활자금 인정',
    standardAmount: 20_000_000,
  },
  heavyParticle: {
    group: '암',
    label: '항암중입자 방사선치료비',
    unit: '원',
    description: '중입자 가속 및 양성자 방사선 치료비',
    ruleNote: '중입자/양성자 방사선 치료비 전체 인정',
    standardAmount: 50_000_000,
  },

  // [2] 뇌, 심장 보장군
  brain: {
    group: '뇌,심장',
    label: '뇌혈관 진단비',
    unit: '원',
    description: '뇌출혈, 뇌경색 등 뇌혈관 질환 전체(I60~I69) 보장',
    ruleNote: '뇌혈관 전체만 인정 (뇌졸중, 뇌경색, 뇌출혈 한정 제외)',
    standardAmount: 20_000_000,
  },
  heart: {
    group: '뇌,심장',
    label: '허혈성심장질환 진단비',
    unit: '원',
    description: '협심증(I20), 급성심근경색(I21) 등 허혈성 심장질환 전체 보장',
    ruleNote: '협심증 포함 허혈성 전체만 인정 (급성심근경색증 한정 제외)',
    standardAmount: 20_000_000,
  },

  // [3] 기타 핵심 보장군
  injuryDisability: {
    group: '기타',
    label: '상해 후유장해',
    unit: '원',
    description: '상해로 인한 신체 장해 발생 시 지급 (3% 이상)',
    ruleNote: '상해 후유장해 3% 이상 전체 인정',
    standardAmount: 50_000_000,
  },
  diseaseDisability80: {
    group: '기타',
    label: '질병 후유장해',
    unit: '원',
    description: '질병으로 인한 80% 이상 중증 후유장해 발생 시 일시금/연금 지급',
    ruleNote: '질병 80% 이상 고도후유장해 인정',
    standardAmount: 20_000_000,
  },
  injurySurgery: {
    group: '기타',
    label: '상해 수술비',
    unit: '원',
    description: '상해 1~5종 수술 회당 지급 (20만~1,000만원)',
    ruleNote: '상해 1~5종 전체 수술비 인정 (특정상해 한정 제외)',
    standardAmount: 500_000,
  },
  diseaseSurgery: {
    group: '기타',
    label: '질병 수술비',
    unit: '원',
    description: '질병 1~5종 수술 회당 지급 (20만~500만원)',
    ruleNote: '질병 1~5종 전체 수술비 인정 (특정질병 한정 제외)',
    standardAmount: 300_000,
  },
  circulatoryCare: {
    group: '기타',
    label: '순환계질환 주요치료비',
    unit: '원',
    description: '뇌·심장 혈전용해치료, 관상동맥스텐트 등 순환계 치료비',
    ruleNote: '순환계 주요 치료비 전체 인정',
    standardAmount: 10_000_000,
  },
  surgery: {
    group: '기타',
    label: '종수술비 (질병/상해)',
    unit: '원',
    description: '질병 및 상해 1~5종 관혈/비관혈 수술비 회당 반복 지급',
    ruleNote: '질병/상해 1~5종 전체 수술비 인정 (특정질환 수술비 제외)',
    standardAmount: 5_000_000,
  },

  // 보조 실손
  indemnity: {
    group: '기타',
    label: '실손의료비',
    unit: '보장여부',
    description: '병원 입원 및 통원 치료비 실손 보상',
    ruleNote: '표준 실손의료비 가입 여부',
    standardAmount: 50_000_000,
  },
};

export interface CoverageDetails {
  cancer: number;
  similarCancer?: number;
  nonReimbursedCancer?: number;
  cancerLivingCare?: number;
  heavyParticle?: number;
  brain: number;
  heart: number;
  injuryDisability?: number;
  diseaseDisability80?: number;
  injurySurgery?: number;
  diseaseSurgery?: number;
  surgery: number; // 하위 호환용 (기본 수술비)
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

export interface MatchedRiderDetail {
  riderName: string; // 구체적 담보/특약명 (예: '표적항암약물허가치료(갱신형)(특별약관)담보')
  amount: number; // 보장 금액 (원)
  note?: string; // 보장 설명 (예: '식약처 허가 표적항암제 투약 치료 시 연간 1회 한도 2,000만원 보장')
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
  insuredName?: string; // 피보험자 이름 (예: '김*형', '홍길동')
  insuredAge?: number; // 자동 추출된 피보험자 나이
  insuredGender?: Gender; // 자동 추출된 피보험자 성별
  isGenderUnknown?: boolean; // 성별 미확인 여부
  genderInferredFrom?: string; // 성별 추정 근거 (예: '상품명(여성전용)', '주민등록번호')
  rawExtractedData?: any;
  excludedLimitedCoverages?: ExcludedLimitedCoverage[];
  limitedCoverageAlert?: string;
  matchedRiders?: Partial<Record<CoverageKey, MatchedRiderDetail[]>>; // 핵심 보장별 실제 매칭된 구체적 담보/특약 목록
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
  matchedRiders?: MatchedRiderDetail[]; // 해당 보장에 기여한 구체적 담보/특약 목록
  riderName?: string; // 대표 담보명
  riderNote?: string; // 부가 설명
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

