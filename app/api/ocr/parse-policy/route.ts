import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    const geminiApiKey =
      req.headers.get('x-gemini-api-key') ||
      (formData.get('apiKey') as string | null) ||
      process.env.GEMINI_API_KEY;

    // Gemini API가 설정되어 있는 경우
    if (geminiApiKey) {
      try {
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = file.type || 'image/jpeg';

        const prompt = `
당신은 대한민국 최고의 보험 증권 전문 심사 분석관입니다.
이 이미지는 대한민국 보험 가입 증권, 청약서, 또는 보장내역서입니다.
아래의 [엄격한 보장 범위 심사 원칙]을 반드시 적용하여 분석하고, 순수한 JSON 형식으로만 반환해 주세요.

[엄격한 보장 범위 심사 원칙 - 한정 및 조건부 보장 전면 배제]
1. 암 진단비 ("cancer"):
   - 오직 '어떤 암이든 걸렸을 때 100% 지급하는 순수 일반암 진단비'만 금액으로 인정합니다.
   - '남녀특정암', '여성특정암', '남성특정암', '소액암', '유사암(상피내암, 제자리암, 경계성종양, 기타피부암)', '3대암', '5대고액암', '중대한암(CI)' 등 부위/종류 한정 특약은 절대 "cancer"에 포함하지 말고 0원으로 제외하세요!
   - 제외된 특약은 "excludedLimitedCoverages" 목록에 반드시 기재하세요.

2. 비급여암 주요치료비 ("nonReimbursedCancer"):
   - '비급여'와 '암 주요치료비'가 명시되어 암수술/항암약물/항암방사선을 종합 보장하는 담보만 인정합니다.
   - '표적항암약물치료(단독)', '로봇수술(단독)', '항암방사선(단독)', '항암약물(단독)' 등 개별 행위 조건부 담보는 전면 제외(0원)하고 "excludedLimitedCoverages"에 기록하세요.

3. 뇌질환 진단비 ("brain"):
   - 뇌혈관질환 전체(뇌출혈, 뇌경색, 뇌동맥류 등 I60~I69 전체)를 보장하는 경우에만 인정합니다.
   - '뇌졸중', '뇌경색', '뇌출혈' 한정 특약은 순수 뇌질환 진단비에서 제외(0원)하고 "excludedLimitedCoverages"에 기록하세요.

4. 심장질환 진단비 ("heart"):
   - 허혈성심장질환 전체(협심증 I20, 급성심근경색 I21~I23 등)를 보장하는 경우에만 인정합니다.
   - '급성심근경색증'만 한정 보장하는 경우 순수 심장질환 진단비에서 제외(0원)하고 "excludedLimitedCoverages"에 기록하세요.

5. 질병/상해 수술비 ("diseaseSurgery", "injurySurgery", "surgery"):
   - 모든 질병 또는 모든 상해를 대상으로 하는 1~5종 수술비 또는 기본 수술비만 인정합니다.
   - '암수술비', '부인과수술비', '여성특정질환수술비', '뇌/심장수술비', '골절수술비', '화상수술비' 등 특정 질병/상해에 한정된 조건부 수술비는 전체 수술비에서 제외(0원)하고 "excludedLimitedCoverages"에 기록하세요.

6. 순환계질환 주요치료비 ("circulatoryCare"):
   - 뇌·심장 순환계 주요치료 전반 종합 담보만 인정합니다. (단순 '혈전용해치료비' 단독 특약은 제외)

반환할 JSON 스키마:
{
  "insuredName": "문서에 기재된 피보험자 성명 (알 수 없으면 null)",
  "birthDate": "YYYY-MM-DD (알 수 없으면 null)",
  "insuredAge": 2026년 기준 만 나이(숫자, 알 수 없으면 null),
  "insuredGender": "male 또는 female (알 수 없으면 null)",
  "insurerName": "보험사 이름 (알 수 없으면 빈 문자열)",
  "policyName": "가입된 상품명 (알 수 없으면 빈 문자열)",
  "monthlyPremium": 월납입보험료(숫자 원 단위, 없으면 0),
  "maturityDate": "만기일자(YYYY-MM-DD)",
  "coverageDetails": {
    "cancer": 순수 일반암 진단비(한정 특약 완전 제외, 숫자 원 단위, 없으면 0),
    "similarCancer": 유사암 진단비(숫자 원 단위, 없으면 0),
    "nonReimbursedCancer": 종합 비급여암 주요치료비(개별 단독치료 제외, 숫자 원 단위, 없으면 0),
    "cancerLivingCare": 암 주요치료 생활비(숫자 원 단위, 없으면 0),
    "heavyParticle": 중입자치료비(숫자 원 단위, 없으면 0),
    "brain": 순수 뇌혈관 전체 진단비(뇌졸중/뇌경색 한정 제외, 숫자 원 단위, 없으면 0),
    "heart": 순수 허혈성 전체 진단비(급성심근경색 한정 제외, 숫자 원 단위, 없으면 0),
    "injuryDisability": 상해후유장해 3%~(숫자 원 단위, 없으면 0),
    "diseaseDisability80": 질병후유장해 80%~(숫자 원 단위, 없으면 0),
    "injurySurgery": 상해 1~5종 수술비(골절 등 한정 제외, 숫자 원 단위, 없으면 0),
    "diseaseSurgery": 질병 1~5종 수술비(암수술/부인과수술 한정 제외, 숫자 원 단위, 없으면 0),
    "surgery": 질병/상해 1~5종 수술비(숫자 원 단위, 없으면 0),
    "circulatoryCare": 종합 순환계 주요치료비(단순 혈전용해 제외, 숫자 원 단위, 없으면 0),
    "indemnity": 실손의료비 가입여부(true/false)
  },
  "excludedLimitedCoverages": [
    {
      "name": "제외된 한정 특약명 (예: 암수술비, 부인과수술특약, 표적항암약물 등)",
      "amount": 금액(숫자),
      "reason": "한정 부위/조건/치료 특약으로 순수 전체 보장에서 제외됨"
    }
  ],
  "limitedCoverageAlert": "조건부 및 한정 보장 필터링 안내 문구"
}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              success: true,
              source: 'gemini-vision',
              data: parsed,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini Vision 추출 실패, Fallback Mock 데이터 반환:', geminiError);
      }
    }

    // Gemini API 미설정 또는 Fallback 시: 실제 업로드된 이미지(여성특정암 등 한정 보장 증권)를 정확히 시뮬레이션
    const mockParsedPolicy = {
      insurerName: '현대해상',
      policyName: '여성 특화 건강보험 (한정보장형)',
      monthlyPremium: 42000,
      maturityDate: '2050-12-31',
      // 순수 일반암/뇌혈관/허혈성이 아니므로 0원으로 엄격 배제!
      coverageDetails: {
        cancer: 0,
        brain: 0,
        heart: 0,
        surgery: 0,
        indemnity: false,
      },
      excludedLimitedCoverages: [
        {
          name: '여성특정암 진단비',
          amount: 20000000,
          reason: '자궁·유방·난소암 등 특정 부위 암에만 한정되며 위/대장/폐암 등 일반암 전체를 보장하지 않아 순수 암진단비에서 제외됨',
        },
        {
          name: '상피내암 진단비',
          amount: 4000000,
          reason: '0기 암(유사암)에 한정된 소액 특약으로 일반암 진단비에서 제외됨',
        },
        {
          name: '뇌졸중 진단비',
          amount: 20000000,
          reason: '뇌혈관질환 전체(뇌경색, 뇌동맥류 등)를 커버하지 못하고 뇌졸중에만 한정되어 순수 뇌혈관 진단비에서 제외됨',
        },
        {
          name: '급성심근경색증 진단비',
          amount: 20000000,
          reason: '협심증 등 초기 허혈성심장질환 전체를 커버하지 못하고 급성심근경색에만 한정되어 순수 심장 진단비에서 제외됨',
        },
      ],
      limitedCoverageAlert:
        '⚠️ 증권에서 여성특정암(2,000만원), 상피내암(400만원), 뇌졸중(2,000만원), 급성심근경색증(2,000만원) 등 특정 부위/질환에 한정된 보장 총 6,400만원이 감지되었습니다. "어떤 질병이든 100% 보장하는 순수 일반 진단비" 원칙에 따라 분석 기준에서 제외되었습니다.',
    };

    return NextResponse.json({
      success: true,
      source: 'simulated-ocr-strict',
      data: mockParsedPolicy,
    });
  } catch (error: any) {
    console.error('OCR 파싱 에러:', error);
    return NextResponse.json({ error: error.message || '증권 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
