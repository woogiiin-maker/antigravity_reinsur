export type GuidelineCategory =
  | '3대 진단비'
  | '암 치료비'
  | '순환기 치료비'
  | '수술비'
  | '장해 / 생활 / 배상';

export interface StandardGuidelineItem {
  id: string;
  category: GuidelineCategory;
  name: string;
  badge?: {
    text: '필수' | '트렌드' | '초가성비' | '인기' | '신설';
    color: string;
  };
  recommendedAmount: string;
  keyPoints: string;
  maxAmountValue?: number; // 표에 적힌 권장금액 범위의 최대 수치 (원 단위)
}

export const STANDARD_GUIDELINES_16: StandardGuidelineItem[] = [
  // 1. 3대 진단비
  {
    id: 'cancer_diag',
    category: '3대 진단비',
    name: '암진단비 (유사암 포함)',
    badge: { text: '필수', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    recommendedAmount: '일반암 5,000만 / 유사암 1,000만',
    keyPoints: '연봉 1~2년 치 생활비 대체 기준 (유사암은 법정한도 20%로 최대 세팅)',
    maxAmountValue: 50_000_000,
  },
  {
    id: 'brain_diag',
    category: '3대 진단비',
    name: '뇌혈관질환 진단비',
    badge: { text: '필수', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    recommendedAmount: '2,000만원 ~ 3,000만원',
    keyPoints: '뇌출혈·뇌졸중보다 범위가 넓어 뇌경색 및 비파열동맥류까지 커버',
    maxAmountValue: 30_000_000,
  },
  {
    id: 'heart_diag',
    category: '3대 진단비',
    name: '허혈성 심장질환 진단비',
    badge: { text: '필수', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    recommendedAmount: '1,000만원 ~ 2,000만원',
    keyPoints: '급성심근경색증뿐만 아니라 협심증까지 포괄 대비하는 필수 가성비 특약',
    maxAmountValue: 20_000_000,
  },
  {
    id: 'cardio_diag',
    category: '3대 진단비',
    name: '심혈관질환 진단비 (부정맥)',
    recommendedAmount: '1,000만원 (산정특례 권장)',
    keyPoints: '허혈성 제외 영역인 부정맥·심부전 보장 (보험료 고려해 1,000만 적정)',
    maxAmountValue: 10_000_000,
  },

  // 2. 암 치료비
  {
    id: 'cancer_main_treat',
    category: '암 치료비',
    name: '암주요치료비',
    recommendedAmount: '연간 1,000만 ~ 2,000만원',
    keyPoints: '수술, 방사선, 항암약물 치료 시 각각 연간 1회 지급',
    maxAmountValue: 20_000_000,
  },
  {
    id: 'cancer_non_reimbursed',
    category: '암 치료비',
    name: '비급여 암주요치료비',
    badge: { text: '트렌드', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    recommendedAmount: '연간 2,000만 ~ 3,000만원',
    keyPoints: '(표적·면역 등 비급여 대비)수술, 방사선, 항암약물 치료 시 최초 연간 1회 보장',
    maxAmountValue: 30_000_000,
  },
  {
    id: 'cancer_living_care',
    category: '암 치료비',
    name: '암 주요치료생활비',
    badge: { text: '신설', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    recommendedAmount: '연간 최초 1회한 1,000만원',
    keyPoints: '수술, 방사선, 항암약물 치료 시 최초 연간 1회 보장',
    maxAmountValue: 10_000_000,
  },
  {
    id: 'heavy_particle',
    category: '암 치료비',
    name: '항암 중입자치료비',
    badge: { text: '신설', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    recommendedAmount: '5,000만원',
    keyPoints: '회당 5천만원대 초고가 비급여 중입자선 가속 치료 단독 집중 대비',
    maxAmountValue: 50_000_000,
  },

  // 3. 순환기 치료비
  {
    id: 'circulatory_treat',
    category: '순환기 치료비',
    name: '순환계 주요치료비',
    recommendedAmount: '1,000만원 ~ 2,000만원',
    keyPoints: '뇌·심장 혈관 스텐트 삽입술, 혈전용해치료 등 정액 보장',
    maxAmountValue: 20_000_000,
  },

  // 4. 수술비
  {
    id: 'disease_surgery_1_5',
    category: '수술비',
    name: '질병 1-5종 수술비',
    badge: { text: '필수', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    recommendedAmount: '1종 20~30만 / 5종 1,000만원',
    keyPoints: '약관 기준 종별 차등 지급, 비급여 수술까지 폭넓게 반복 보장',
    maxAmountValue: 10_000_000,
  },
  {
    id: 'disease_surgery_general',
    category: '수술비',
    name: '질병 수술비 (상급종합병원)',
    recommendedAmount: '기본 30만 / 상급 100~200만원',
    keyPoints: '모든 질병에 포괄 지급되며, 대학병원 진료 시 추가 정액 지급 연계',
    maxAmountValue: 2_000_000,
  },
  {
    id: 'n_disease_surgery',
    category: '수술비',
    name: 'N대 질병 수술비',
    recommendedAmount: '관혈 1,000만 / 비관혈 500만원',
    keyPoints: '생활 질환(백내장·관절 등)부터 중대 질환까지 종수술비와 중복 수령 목적',
    maxAmountValue: 10_000_000,
  },
  {
    id: 'injury_surgery',
    category: '수술비',
    name: '상해 수술비',
    recommendedAmount: '100만원',
    keyPoints: '골절 핀 고정, 열상 등 일상 상해 사고 대비용으로 가성비 우수',
    maxAmountValue: 1_000_000,
  },
  {
    id: 'injury_surgery_1_5',
    category: '수술비',
    name: '상해 1-5종 수술비',
    recommendedAmount: '1종 20~30만 / 5종 1,000만원',
    keyPoints: '대형 교통사고 등 중증 외상에 따른 4~5종 고액 수술비 집중 대비',
    maxAmountValue: 10_000_000,
  },

  // 5. 장해 / 생활 / 배상
  {
    id: 'injury_disability',
    category: '장해 / 생활 / 배상',
    name: '상해후유장해 (3~100%)',
    badge: { text: '초가성비', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    recommendedAmount: '1억원 ~ 2억원',
    keyPoints: '보험료가 매우 저렴하며 장해율에 따라 반복 지급되므로 최대 가입 권장',
    maxAmountValue: 200_000_000,
  },
  {
    id: 'disease_disability',
    category: '장해 / 생활 / 배상',
    name: '질병후유장해 (3~100%)',
    recommendedAmount: '3,000만원 ~ 5,000만원',
    keyPoints: '치매, 디스크, 당뇨 합병증 등 신체 기능 저하 대비 (연령별 보험료 조율)',
    maxAmountValue: 50_000_000,
  },
  {
    id: 'caregiver_daily',
    category: '장해 / 생활 / 배상',
    name: '간병인 보장 SET',
    badge: { text: '인기', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    recommendedAmount: '일당 15만원 ~ 20만원',
    keyPoints: "파견형보다 직접 고용 후 영수증 청구하는 '간병인 사용일당(체증형)' 추천",
    maxAmountValue: 200_000,
  },
  {
    id: 'family_liability',
    category: '장해 / 생활 / 배상',
    name: '가족일상생활 배상책임',
    badge: { text: '필수', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    recommendedAmount: '1억원 (대물 자기부담 20만)',
    keyPoints: '누수, 타인 대인/대물 피해 보상 (월 1,000원 안팎의 필수 담보)',
    maxAmountValue: 100_000_000,
  },
];
