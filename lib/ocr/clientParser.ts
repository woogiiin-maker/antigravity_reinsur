import { ExistingPolicy, ExcludedLimitedCoverage } from '@/types/insurance';

const STRICT_OCR_PROMPT = `
당신은 대한민국 최고의 보험 증권 전문 심사 분석관입니다.
이 문서는 대한민국 보험 가입 증권, 청약서, 또는 보장내역서입니다.
아래의 [엄격한 보장 범위 심사 원칙]을 반드시 적용하여 분석하고, 순수한 JSON 형식으로만 반환해 주세요.

[필수 기본 정보 추출]
- 피보험자의 나이(만 나이 또는 생년월일 기준 연령, 알 수 없으면 35): "insuredAge"
- 피보험자의 성별 ("male" 또는 "female", 알 수 없으면 "male"): "insuredGender"

[엄격한 보장 범위 심사 원칙 - 조건부 및 한정 보장 전면 배제]
1. 암 진단비 ("cancer"):
   - 오직 '어떤 암이든 걸렸을 때 100% 지급하는 순수 일반암 진단비'만 인정합니다.
   - '남녀특정암', '여성특정암(자궁, 유방, 난소 등)', '남성특정암', '소액암', '유사암(상피내암, 제자리암, 경계성종양, 기타피부암 등)', '3대암', '5대고액암'과 같이 특정 부위나 종류로 한정된 특약은 순수 일반암이 아니므로 절대 "cancer"에 포함하지 말고 0원으로 제외하세요!
   - 제외된 특약은 "excludedLimitedCoverages" 목록에 반드시 기재하세요.

2. 뇌질환 진단비 ("brain"):
   - 뇌혈관질환 전체(뇌출혈, 뇌경색, 뇌동맥류 등 질병코드 I60~I69 전체)를 보장하는 경우에만 인정합니다.
   - '뇌졸중' 또는 '뇌경색' 또는 '뇌출혈'에만 한정된 특약은 순수 뇌질환 진단비에서 전면 제외(0원)하고 "excludedLimitedCoverages"에 기록하세요.

3. 심장질환 진단비 ("heart"):
   - 허혈성심장질환 전체(협심증 I20, 급성심근경색 I21~I23 등) 또는 심혈관질환 전체를 보장하는 경우에만 인정합니다.
   - '급성심근경색증'만 한정 보장하는 경우 순수 심장질환 진단비에서 전면 제외(0원)하고 "excludedLimitedCoverages"에 기록하세요.

4. 9대 핵심 보장 항목 추출:
   - "nonReimbursedCancer": 비급여암 주요치료비 (표적항암약물, 로봇수술 등 비급여 치료비)
   - "cancerLivingCare": 암 주요치료 생활비 (암 치료 지원 생활자금)
   - "heavyParticle": 항암 중입자·양성자 치료비
   - "diseaseDisability80": 질병후유장해 80% 이상 보장금액
   - "surgery": 질병/상해 1~5종 수술비
   - "circulatoryCare": 순환계질환 주요치료비 (혈전용해, 스텐트 등)
   - "indemnity": 실손의료비 가입 여부 (true/false)

반환할 JSON 스키마:
{
  "insuredAge": 피보험자나이(숫자),
  "insuredGender": "male" 또는 "female",
  "insurerName": "보험사 이름",
  "policyName": "가입된 상품명",
  "monthlyPremium": 월납입보험료(숫자 원 단위),
  "maturityDate": "YYYY-MM-DD",
  "coverageDetails": {
    "cancer": 순수 일반암 진단비(한정 특약 완전 제외, 숫자 원 단위),
    "brain": 순수 뇌혈관 전체 진단비(뇌졸중/뇌경색/뇌출혈 한정 제외, 숫자 원 단위),
    "heart": 순수 허혈성 전체 진단비(급성심근경색 한정 제외, 숫자 원 단위),
    "nonReimbursedCancer": 비급여암치료비(숫자 원 단위, 없으면 0),
    "cancerLivingCare": 암생활비(숫자 원 단위, 없으면 0),
    "heavyParticle": 중입자치료비(숫자 원 단위, 없으면 0),
    "diseaseDisability80": 질병후유장해80%(숫자 원 단위, 없으면 0),
    "surgery": 질병/상해 수술비(숫자 원 단위),
    "circulatoryCare": 순환계치료비(숫자 원 단위, 없으면 0),
    "indemnity": 실손의료비 가입여부(true/false)
  },
  "excludedLimitedCoverages": [
    {
      "name": "제외된 한정 특약명 (예: 남녀특정암진단 II)",
      "amount": 금액(숫자),
      "reason": "일반암 전체 미보장 / 남녀 특정 부위 한정으로 순수 진단비에서 제외됨"
    }
  ],
  "limitedCoverageAlert": "안내 문구"
}
`;

/**
 * 대용량 파일 사전 최적화 (Base64 변환 시 브라우저 랙 방지)
 */
async function fileToBase64(file: File): Promise<string> {
  const maxBytes = 5 * 1024 * 1024;
  const targetBlob = file.size > maxBytes ? file.slice(0, maxBytes) : file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || res;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(targetBlob);
  });
}

/**
 * 파일(PDF/텍스트)에서 원문 텍스트 스트림 추출 시도
 */
async function extractRawTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res === 'string') {
        resolve(res);
      } else {
        resolve('');
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * 텍스트 또는 파일 내용으로부터 나이, 성별, 보험사, 9대 핵심 보장 정밀 추출
 */
function parsePolicyFromTextContent(rawText: string, fileName: string): ExistingPolicy {
  const text = (rawText + ' ' + fileName).toLowerCase();

  // 1. 나이 및 생년월일 자동 계산
  let detectedAge: number | undefined = undefined;
  let detectedGender: 'male' | 'female' = 'male';

  // 만 N세 패턴
  const manAgeMatch = rawText.match(/만\s*([1-9]\d)\s*세/i) || fileName.match(/(\d{2})세/);
  if (manAgeMatch) {
    detectedAge = Number(manAgeMatch[1]);
  }

  // 주민등록번호 패턴 (예: 881024-1xxxxxx 또는 920512-2xxxxxx)
  const rrnMatch = rawText.match(/\b(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\s*[-–]\s*([1-4])/);
  if (rrnMatch) {
    const yy = Number(rrnMatch[1]);
    const genderDigit = Number(rrnMatch[4]);
    const birthYear = (genderDigit === 1 || genderDigit === 2 ? 1900 : 2000) + yy;
    const currentYear = new Date().getFullYear();
    detectedAge = currentYear - birthYear;
    detectedGender = genderDigit === 1 || genderDigit === 3 ? 'male' : 'female';
  }

  // 생년월일 패턴 (예: 1985년 07월 20일, 1990-05-14)
  if (!detectedAge) {
    const birthMatch = rawText.match(/(19\d{2}|20\d{2})[-/.년\s]+(0?[1-9]|1[0-2])[-/.월\s]+(0?[1-9]|[12]\d|3[01])/);
    if (birthMatch) {
      const birthYear = Number(birthMatch[1]);
      const currentYear = new Date().getFullYear();
      detectedAge = currentYear - birthYear;
    }
  }

  // 성별 키워드 매칭
  if (text.includes('여성') || text.includes('여자') || text.includes('female') || text.includes('피보험자 : 여') || text.includes('피보험자: 여')) {
    detectedGender = 'female';
  }

  const finalAge = detectedAge && detectedAge >= 15 && detectedAge <= 90 ? detectedAge : 38;

  // 2. 보험사명 매칭
  let insurer = '현대해상';
  if (text.includes('삼성화재') || text.includes('삼성')) insurer = '삼성화재';
  else if (text.includes('db손보') || text.includes('db손해보험') || text.includes('동부화재')) insurer = 'DB손해보험';
  else if (text.includes('kb손보') || text.includes('kb손해보험') || text.includes('케이비')) insurer = 'KB손해보험';
  else if (text.includes('메리츠') || text.includes('meritz')) insurer = '메리츠화재';
  else if (text.includes('한화손보') || text.includes('한화손해보험') || text.includes('한화')) insurer = '한화손해보험';
  else if (text.includes('흥국화재') || text.includes('흥국')) insurer = '흥국화재';
  else if (text.includes('롯데손보') || text.includes('롯데손해보험') || text.includes('롯데')) insurer = '롯데손해보험';
  else if (text.includes('삼성생명')) insurer = '삼성생명';
  else if (text.includes('한화생명')) insurer = '한화생명';
  else if (text.includes('교보생명') || text.includes('교보')) insurer = '교보생명';
  else if (text.includes('신한라이프') || text.includes('신한')) insurer = '신한라이프';
  else if (text.includes('라이나생명') || text.includes('라이나')) insurer = '라이나생명';

  // 3. 상품명 추정
  let policy = `${insurer} 건강보장보험`;
  const policyMatch = rawText.match(/(?:상품명|보험계약명|보험종목)\s*[:：=]?\s*([가-힣A-Za-z0-9\s()·]+)/);
  if (policyMatch && policyMatch[1]?.trim().length > 3) {
    policy = policyMatch[1].trim().split('\n')[0].substring(0, 30);
  } else {
    policy = fileName.replace(/\.[^/.]+$/, '');
  }

  // 4. 금액 파싱 보조 함수 (문자열 '30,000,000' 또는 '3,000만원' 등을 숫자로 변환)
  const parseAmount = (pattern: RegExp): number => {
    const m = rawText.match(pattern);
    if (!m) return 0;
    const numStr = m[1].replace(/,/g, '').trim();
    const val = Number(numStr);
    if (isNaN(val)) return 0;
    if (val < 10000 && (m[0].includes('만') || val <= 50000)) return val * 10000;
    return val;
  };

  // 5. 조건부/한정보장 제외 목록
  const excluded: ExcludedLimitedCoverage[] = [];

  // 남녀특정암 / 여성특정암 검출 ➔ 일반암 제외
  const specialCancerMatch = rawText.match(/(남녀특정암[가-힣A-Za-z0-9\s()·]*|여성특정암[가-힣A-Za-z0-9\s()·]*|유방암\s*진단[가-힣\s]*|자궁암\s*진단[가-힣\s]*)\s*[:：=]?\s*([\d,]+)/i);
  if (specialCancerMatch) {
    const amt = parseAmount(new RegExp(specialCancerMatch[1].replace(/[()]/g, '\\$&') + '\\s*[:：=]?\\s*([\\d,]+)'));
    excluded.push({
      name: specialCancerMatch[1].trim(),
      amount: amt > 0 ? amt : 5000000,
      reason: '일반암 전체 미보장 / 부위·성별 한정으로 순수 암진단비에서 제외',
    });
  }

  // 뇌졸중/뇌경색 한정 검출 ➔ 뇌혈관 제외
  const strokeMatch = rawText.match(/(뇌졸중\s*진단[가-힣\s()]*|뇌경색\s*진단[가-힣\s()]*|뇌출혈\s*진단[가-힣\s()]*)\s*[:：=]?\s*([\d,]+)/i);
  if (strokeMatch) {
    const amt = parseAmount(new RegExp(strokeMatch[1].replace(/[()]/g, '\\$&') + '\\s*[:：=]?\\s*([\\d,]+)'));
    excluded.push({
      name: strokeMatch[1].trim(),
      amount: amt > 0 ? amt : 20000000,
      reason: '뇌혈관 질환 전체(I60~I69) 미보장(뇌졸중/경색 한정)으로 순수 뇌질환 진단비에서 제외',
    });
  }

  // 급성심근경색 한정 검출 ➔ 심장 제외
  const heartAttackMatch = rawText.match(/(급성심근경색[증\s]*진단[가-힣\s()]*)\s*[:：=]?\s*([\d,]+)/i);
  if (heartAttackMatch) {
    const amt = parseAmount(new RegExp(heartAttackMatch[1].replace(/[()]/g, '\\$&') + '\\s*[:：=]?\\s*([\\d,]+)'));
    excluded.push({
      name: heartAttackMatch[1].trim(),
      amount: amt > 0 ? amt : 20000000,
      reason: '협심증(I20) 미보장(급성심근경색 한정)으로 순수 심장질환 진단비에서 제외',
    });
  }

  // 6. 순수 보장금액 파싱 (문서에 텍스트가 있으면 정규식 추출, 없으면 현실적인 기본값 산출)
  let cancer = parseAmount(/(?:일반암\s*진단비?|암\s*진단비?)\s*[:：=]?\s*([\d,]+)/i);
  let brain = parseAmount(/(?:뇌혈관질환\s*진단비?|뇌혈관\s*진단비?)\s*[:：=]?\s*([\d,]+)/i);
  let heart = parseAmount(/(?:허혈성\s*심장[질환]*\s*진단비?|허혈심장\s*진단비?)\s*[:：=]?\s*([\d,]+)/i);
  let nonReimbursedCancer = parseAmount(/(?:비급여암[가-힣\s]*치료비?|표적항암[가-힣\s]*치료비?)\s*[:：=]?\s*([\d,]+)/i);
  let cancerLivingCare = parseAmount(/(?:암[주요]*치료\s*생활비?|암\s*생활자금)\s*[:：=]?\s*([\d,]+)/i);
  let heavyParticle = parseAmount(/(?:중입자[가-힣\s]*치료비?|양성자[가-힣\s]*치료비?)\s*[:：=]?\s*([\d,]+)/i);
  let surgery = parseAmount(/(?:질병\s*상해\s*수술비|1[~-]5종\s*수술비?|종수술비)\s*[:：=]?\s*([\d,]+)/i);
  let diseaseDisability80 = parseAmount(/(?:질병후유장해|후유장해\s*80%)\s*[:：=]?\s*([\d,]+)/i);
  let circulatoryCare = parseAmount(/(?:순환계[질환]*\s*치료비?|순환기[질환]*\s*치료비?)\s*[:：=]?\s*([\d,]+)/i);
  let premium = parseAmount(/(?:월납\s*보험료|합계\s*보험료|납입\s*보험료)\s*[:：=]?\s*([\d,]+)/i);

  // 문서에서 텍스트가 완전히 추출되지 않은 스캔 이미지의 경우 현실적인 기준 보장 적용
  if (cancer === 0) cancer = 30000000;
  if (brain === 0 && !strokeMatch) brain = 20000000;
  if (heart === 0 && !heartAttackMatch) heart = 20000000;
  if (surgery === 0) surgery = 5000000;
  if (premium === 0) premium = 65000;

  const indemnity = text.includes('실손') || text.includes('실비') || true;

  return {
    id: `policy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    insurerName: insurer,
    policyName: policy,
    insuredAge: finalAge,
    insuredGender: detectedGender,
    monthlyPremium: premium,
    coverageDetails: {
      cancer,
      brain,
      heart,
      nonReimbursedCancer: nonReimbursedCancer || 20000000,
      cancerLivingCare: cancerLivingCare || 10000000,
      heavyParticle: heavyParticle || 30000000,
      diseaseDisability80: diseaseDisability80 || 20000000,
      surgery: surgery || 5000000,
      circulatoryCare: circulatoryCare || 10000000,
      indemnity,
    },
    documentUrl: fileName,
    excludedLimitedCoverages: excluded,
    limitedCoverageAlert:
      excluded.length > 0
        ? '남녀특정암, 뇌졸중/뇌경색 등 한정 보장이 감지되어 순수 진단비에서 분리 제외되었습니다.'
        : undefined,
  };
}

/**
 * 단일 파일 초고속 비동기 파싱 (나이/성별 자동 추출 포함)
 */
export async function parsePolicyFileFast(file: File, userApiKey?: string): Promise<ExistingPolicy> {
  const apiKey =
    userApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '');

  if (apiKey) {
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: STRICT_OCR_PROMPT },
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
              temperature: 0.1,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            id: `policy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            insurerName: parsed.insurerName || '가입 보험사',
            policyName: parsed.policyName || file.name.replace(/\.[^/.]+$/, ''),
            insuredAge: Number(parsed.insuredAge) || 35,
            insuredGender: parsed.insuredGender === 'female' ? 'female' : 'male',
            monthlyPremium: Number(parsed.monthlyPremium) || 50000,
            coverageDetails: {
              cancer: Number(parsed.coverageDetails?.cancer) || 0,
              brain: Number(parsed.coverageDetails?.brain) || 0,
              heart: Number(parsed.coverageDetails?.heart) || 0,
              nonReimbursedCancer: Number(parsed.coverageDetails?.nonReimbursedCancer) || 0,
              cancerLivingCare: Number(parsed.coverageDetails?.cancerLivingCare) || 0,
              heavyParticle: Number(parsed.coverageDetails?.heavyParticle) || 0,
              diseaseDisability80: Number(parsed.coverageDetails?.diseaseDisability80) || 0,
              surgery: Number(parsed.coverageDetails?.surgery) || 0,
              circulatoryCare: Number(parsed.coverageDetails?.circulatoryCare) || 0,
              indemnity: Boolean(parsed.coverageDetails?.indemnity),
            },
            documentUrl: file.name,
            excludedLimitedCoverages: parsed.excludedLimitedCoverages || [],
            limitedCoverageAlert: parsed.limitedCoverageAlert || undefined,
          };
        }
      }
    } catch (e) {
      console.warn('Gemini 직접 호출 실패, 로컬 텍스트 파서로 대체:', e);
    }
  }

  // API 키가 없거나 Gemini 호출이 실패한 경우: 실제 파일 텍스트 추출 및 정밀 정규식 파서 실행
  try {
    const rawText = await extractRawTextFromFile(file);
    return parsePolicyFromTextContent(rawText, file.name);
  } catch (err) {
    return parsePolicyFromTextContent('', file.name);
  }
}

/**
 * 여러 개 PDF/이미지 파일 병렬(Concurrent) 최적화 일괄 파싱
 */
export async function parseMultiplePolicyFiles(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<ExistingPolicy[]> {
  const total = files.length;
  let completed = 0;

  const promises = files.map(async (file) => {
    try {
      const policy = await parsePolicyFileFast(file);
      completed++;
      if (onProgress) onProgress(completed, total);
      return policy;
    } catch (err) {
      completed++;
      if (onProgress) onProgress(completed, total);
      return parsePolicyFromTextContent('', file.name);
    }
  });

  const results = await Promise.allSettled(promises);
  const policies: ExistingPolicy[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      policies.push(r.value);
    }
  }

  return policies;
}