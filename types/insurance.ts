export type Gender = 'male' | 'female';
export type TargetGender = 'male' | 'female' | 'all';

export type CoverageKey = 'cancer' | 'brain' | 'heart' | 'indemnity' | 'surgery';

export interface CoverageItem {
  key: CoverageKey;
  label: string;
  unit: string;
  description: string;
}

export const COVERAGE_CATEGORIES: Record<CoverageKey, { label: string; unit: string; description: string }> = {
  cancer: {
    label: '암 진단비',
    unit: '원',
    description: '일반암 및 고액암 확정 진단 시 지급',
  },
  brain: {
    label: '뇌혈관질환 진단비',
    unit: '원',
    description: '뇌출혈, 뇌경색 등 뇌혈관 전반 진단 시 지급',
  },
  heart: {
    label: '허혈성심장질환 진단비',
    unit: '원',
    description: '협심증, 급성심근경색 등 심장 질환 진단 시 지급',
  },
  indemnity: {
    label: '실손의료비',
    unit: '보장여부',
    description: '병원 입원/통원 치료비 실손 보상',
  },
  surgery: {
    label: '질병/상해 수술비',
    unit: '원',
    description: '각종 질병 및 상해 수술 회당/종별 지급',
  },
};

export interface CoverageDetails {
  cancer: number;
  brain: number;
  heart: number;
  surgery: number;
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
  rawExtractedData?: any;
  excludedLimitedCoverages?: ExcludedLimitedCoverage[];
  limitedCoverageAlert?: string;
}

export interface InsuranceProduct {
  id: string;
  productName: string;
  insurerName: string;
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: TargetGender;
  category: 'youth' | 'standard_health' | 'simplified_care' | 'cancer_focus' | 'heart_brain';
  baseCoverages: CoverageDetails;
  monthlyPremiumEstimate: number;
  keyFeatures: string[];
  isActive?: boolean;
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

export interface CoverageGap {
  category: CoverageKey;
  label: string;
  currentAmount: number;
  recommendedAmount: number;
  fulfillmentRate: number; // 0 ~ 100 (%)
  status: 'insufficient' | 'adequate' | 'excessive';
  note: string;
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
  createdAt?: string;
}
