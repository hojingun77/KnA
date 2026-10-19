/**
 * 8개 주요 생활 정착 카테고리
 * 기획: 홈에 카테고리 이름, 보조 설명, 아이콘 표시
 * 아이콘은 피그마 확정 후 업데이트
 */
export const CATEGORIES = [
  { id: 'visa',     label: '비자·체류',   description: '비자 발급, 체류 연장, 영주권 관련 정보' },
  { id: 'work',     label: '취업·노동',   description: '취업, 근로 계약, 임금, 산재 등 노동 권리' },
  { id: 'housing',  label: '주거·부동산', description: '전세, 월세, 주거 지원 제도 안내' },
  { id: 'finance',  label: '금융·세금',   description: '은행 계좌 개설, 세금, 건강보험 등' },
  { id: 'education',label: '교육·어학',   description: '한국어 교육, 자녀 교육, 학교 정보' },
  { id: 'health',   label: '의료·건강',   description: '병원 이용, 건강보험, 의료비 지원' },
  { id: 'daily',    label: '일상생활',    description: '교통, 통신, 생활 편의 서비스 이용' },
  { id: 'legal',    label: '법률·분쟁',   description: '계약 분쟁, 법률 상담 기관 안내' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
