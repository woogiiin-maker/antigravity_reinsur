export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          age: number;
          gender: 'male' | 'female';
          family_history: string[];
          has_existing_policy: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          age: number;
          gender: 'male' | 'female';
          family_history?: string[];
          has_existing_policy?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          age?: number;
          gender?: 'male' | 'female';
          family_history?: string[];
          has_existing_policy?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      existing_policies: {
        Row: {
          id: string;
          user_id: string;
          insurer_name: string;
          policy_name: string | null;
          coverage_details: Json;
          monthly_premium: number;
          maturity_date: string | null;
          document_url: string | null;
          raw_extracted_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insurer_name: string;
          policy_name?: string | null;
          coverage_details?: Json;
          monthly_premium?: number;
          maturity_date?: string | null;
          document_url?: string | null;
          raw_extracted_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          insurer_name?: string;
          policy_name?: string | null;
          coverage_details?: Json;
          monthly_premium?: number;
          maturity_date?: string | null;
          document_url?: string | null;
          raw_extracted_data?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      insurance_products: {
        Row: {
          id: string;
          product_name: string;
          insurer_name: string;
          target_age_min: number;
          target_age_max: number;
          target_gender: 'male' | 'female' | 'all';
          category: string;
          base_coverages: Json;
          monthly_premium_estimate: number;
          key_features: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_name: string;
          insurer_name: string;
          target_age_min?: number;
          target_age_max?: number;
          target_gender?: 'male' | 'female' | 'all';
          category: string;
          base_coverages?: Json;
          monthly_premium_estimate: number;
          key_features?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          insurer_name?: string;
          target_age_min?: number;
          target_age_max?: number;
          target_gender?: 'male' | 'female' | 'all';
          category?: string;
          base_coverages?: Json;
          monthly_premium_estimate?: number;
          key_features?: string[];
          is_active?: boolean;
        };
        Relationships: [];
      };
      recommendation_rules: {
        Row: {
          id: string;
          age_group: string;
          gender: string;
          family_disease: string | null;
          target_coverage_category: string;
          standard_coverage_amount: number;
          weight: number;
          priority: number;
          recommendation_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          age_group: string;
          gender: string;
          family_disease?: string | null;
          target_coverage_category: string;
          standard_coverage_amount: number;
          weight?: number;
          priority?: number;
          recommendation_note?: string | null;
          created_at?: string;
        };
        Update: {
          age_group?: string;
          gender?: string;
          family_disease?: string | null;
          target_coverage_category?: string;
          standard_coverage_amount?: number;
          weight?: number;
          priority?: number;
          recommendation_note?: string | null;
        };
        Relationships: [];
      };
      diagnosis_reports: {
        Row: {
          id: string;
          user_id: string;
          total_score: number;
          status_summary: string;
          coverage_scores: Json;
          gap_analysis: Json;
          advice_tags: string[];
          recommended_product_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_score: number;
          status_summary: string;
          coverage_scores: Json;
          gap_analysis: Json;
          advice_tags?: string[];
          recommended_product_ids?: string[];
          created_at?: string;
        };
        Update: {
          total_score?: number;
          status_summary?: string;
          coverage_scores?: Json;
          gap_analysis?: Json;
          advice_tags?: string[];
          recommended_product_ids?: string[];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
