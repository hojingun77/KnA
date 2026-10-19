/**
 * 지원 국가 - 기본 언어 매핑
 * 가입 시 본국가 선택 → 기본 언어 자동 결정
 * 지원 국가/언어 목록은 기획 확정 후 업데이트 필요
 */
export const SUPPORTED_COUNTRIES = [
  { code: 'KR', name: '대한민국',    nameEn: 'South Korea',    languageCode: 'ko' },
  { code: 'US', name: '미국',        nameEn: 'United States',   languageCode: 'en' },
  { code: 'CN', name: '중국',        nameEn: 'China',           languageCode: 'zh' },
  { code: 'JP', name: '일본',        nameEn: 'Japan',           languageCode: 'ja' },
  { code: 'VN', name: '베트남',      nameEn: 'Vietnam',         languageCode: 'vi' },
  { code: 'PH', name: '필리핀',      nameEn: 'Philippines',     languageCode: 'en' },
  { code: 'MN', name: '몽골',        nameEn: 'Mongolia',        languageCode: 'mn' },
  { code: 'UZ', name: '우즈베키스탄', nameEn: 'Uzbekistan',      languageCode: 'uz' },
  { code: 'KH', name: '캄보디아',    nameEn: 'Cambodia',        languageCode: 'km' },
  { code: 'NP', name: '네팔',        nameEn: 'Nepal',           languageCode: 'ne' },
  { code: 'TH', name: '태국',        nameEn: 'Thailand',        languageCode: 'th' },
  { code: 'ID', name: '인도네시아',  nameEn: 'Indonesia',       languageCode: 'id' },
];

/** 국가 코드로 기본 언어 코드 반환 */
export function getLanguageByCountry(countryCode) {
  const found = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);
  return found?.languageCode ?? 'ko';
}
