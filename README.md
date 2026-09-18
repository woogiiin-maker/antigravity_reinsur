# 🏥 연령대별 맞춤 건강보험 추천 및 리모델링 플랫폼

Next.js 14(App Router), Tailwind CSS, Supabase, AI Vision(Gemini)을 기반으로 구축된 모바일 퍼스트 건강보험 진단 및 리모델링 추천 솔루션입니다.

---

## 🌟 핵심 기능

1. **1단계: 데이터 모델링 및 Supabase PostgreSQL 스키마 (`/supabase`)**
   - `users`: 사용자 프로필, 연령, 성별, 가족력, 가입 여부
   - `existing_policies`: 기존 가입 보험 증권 및 보장 항목(암/뇌/심장/실비/수술비 등), 월 보험료, 파일 URL
   - `insurance_products`: 한국 주요 보험사(현대해상, 삼성화재, 메리츠, 한화생명, KB손보 등) 실전 상품 마스터
   - `recommendation_rules`: 연령대별/가족력별 표준 권장 보장금액 및 질환별 가중치 규칙
   - `diagnosis_reports`: 진단 결과 보장 점수, 카테고리별 충족도, 리모델링 제안 태그 저장
   - RLS(Row Level Security) 정책 및 시드 데이터(`seed.sql`) 포함

2. **2단계: 모바일 퍼스트 Multi-step Form (`components/form/MultiStepForm.tsx`)**
   - 390px 모바일 화면 최적화 반응형 UI
   - **Step 1**: 연령 슬라이더 & 성별 선택
   - **Step 2**: 직관적인 가족력 칩 다중 선택 UI
   - **Step 3**:
     - [신규 가입 모드]: 미가입 확인 후 즉시 최적 플랜 진단
     - [리모델링 모드]: 증권 이미지/PDF 업로드 + AI 자동 추출 및 가입 금액 검수/직접 수정 폼

3. **3단계: 연령대·가족력 기반 맞춤 추천 & 리모델링 로직 (`lib/engine/diagnosis.ts`)**
   - **연령별 기본 권장선**: 20대(청년 가성비 플랜), 30~40대(소득공백 대비 3대 질병 집중), 50대 이상(간편/유병자 케어)
   - **가족력 가중치 엔진**: 암 가족력(1.5배), 뇌혈관/고혈압(1.25~1.5배), 심장/당뇨(1.25~1.5배) 자동 상향
   - **리모델링 알고리즘**: 가중 충족률(%) 기반 100점 만점 보장 점수, 부족 항목 및 과다 지출 식별, 맞춤형 추천 상품 매칭

4. **4단계: 진단 결과 및 리모델링 리포트 UI (`components/report/DiagnosisReportView.tsx`)**
   - 100점 만점 종합 보장 점수 게이지 및 안심/보통/주의/위험 등급 카드
   - Recharts 레이더 차트 및 항목별 가입금액 vs 권장금액 충족도 바
   - 직관적인 리모델링 태그 (`#기존 보험 유지 권장`, `#특약 추가 보완 필요`, `#중복 보장 감축`)
   - 연령/가족력 최적 매칭 추천 상품 카드 및 상세 혜택 안내

---

## 🚀 빠른 시작

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local.example` 파일을 복사하여 `.env.local`을 생성하고 키를 입력합니다.
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```
*(환경변수가 비어있어도 내장된 시뮬레이션 및 로컬 엔진으로 모든 기능을 즉시 테스트할 수 있습니다.)*

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`에 접속합니다.

### 4. Supabase DB 적용 (SQL Editor)
- `supabase/schema.sql` 실행
- `supabase/seed.sql` 실행
