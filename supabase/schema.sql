-- ==========================================================
-- 건강보험 추천 및 리모델링 시스템 PostgreSQL DDL 스키마
-- ==========================================================

-- 확장 기능
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users: 사용자 기본 정보 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    family_history TEXT[] DEFAULT '{}',
    has_existing_policy BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. existing_policies: 기존 가입 보험 정보
CREATE TABLE IF NOT EXISTS public.existing_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    insurer_name VARCHAR(100) NOT NULL,
    policy_name VARCHAR(150),
    coverage_details JSONB NOT NULL DEFAULT '{}'::jsonb, 
    -- e.g. {"cancer": 30000000, "brain": 20000000, "heart": 20000000, "indemnity": true, "surgery": 10000000}
    monthly_premium NUMERIC(12, 0) DEFAULT 0,
    maturity_date DATE,
    document_url TEXT,
    raw_extracted_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. insurance_products: 연령대/성별 추천 보험 상품 및 기본 보장 내역
CREATE TABLE IF NOT EXISTS public.insurance_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(150) NOT NULL,
    insurer_name VARCHAR(100) NOT NULL,
    target_age_min INT DEFAULT 0,
    target_age_max INT DEFAULT 100,
    target_gender VARCHAR(10) DEFAULT 'all' CHECK (target_gender IN ('male', 'female', 'all')),
    category VARCHAR(50) NOT NULL, -- 'youth', 'standard_health', 'simplified_care', 'cancer_focus', 'heart_brain'
    base_coverages JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- e.g. {"cancer": 50000000, "brain": 30000000, "heart": 30000000, "surgery": 10000000}
    monthly_premium_estimate NUMERIC(12, 0) NOT NULL DEFAULT 0,
    key_features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. recommendation_rules: 나이, 성별, 가족력, 보장 갭 기준 리모델링 규칙
CREATE TABLE IF NOT EXISTS public.recommendation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    age_group VARCHAR(20) NOT NULL, -- '20s', '30_40s', '50s_plus', 'all'
    gender VARCHAR(10) DEFAULT 'all' CHECK (gender IN ('male', 'female', 'all')),
    family_disease VARCHAR(50), -- 'cancer', 'brain', 'heart', 'hypertension', 'diabetes' 등
    target_coverage_category VARCHAR(50) NOT NULL, -- 'cancer', 'brain', 'heart', 'indemnity', 'surgery'
    standard_coverage_amount NUMERIC(14, 0) NOT NULL, -- 연령/가족력 권장 표준 보장액
    weight NUMERIC(4, 2) DEFAULT 1.0, -- 가족력 시 가중치 (예: 1.5)
    priority INT DEFAULT 1,
    recommendation_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. diagnosis_reports: 진단 및 리모델링 결과 리포트 저장
CREATE TABLE IF NOT EXISTS public.diagnosis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_score INT NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    status_summary VARCHAR(100) NOT NULL,
    coverage_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    advice_tags TEXT[] DEFAULT '{}',
    recommended_product_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_age_gender ON public.users(age, gender);
CREATE INDEX IF NOT EXISTS idx_existing_policies_user_id ON public.existing_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_products_category ON public.insurance_products(category);
CREATE INDEX IF NOT EXISTS idx_diagnosis_reports_user_id ON public.diagnosis_reports(user_id);

-- RLS (Row Level Security) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.existing_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 데이터만 조회 및 수정 가능
CREATE POLICY "Users can manage own profile" 
    ON public.users FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own policies" 
    ON public.existing_policies FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view insurance products" 
    ON public.insurance_products FOR SELECT TO authenticated, anon USING (is_active = true);

CREATE POLICY "Anyone can view recommendation rules" 
    ON public.recommendation_rules FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users can manage own diagnosis reports" 
    ON public.diagnosis_reports FOR ALL USING (auth.uid() = user_id);
