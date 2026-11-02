import visa from '@/assets/figma/title-visa.svg';
import housing from '@/assets/figma/title-housing.svg';
import medical from '@/assets/figma/title-medical.svg';
import finance from '@/assets/figma/title-finance.svg';
import work from '@/assets/figma/title-work.svg';
import transport from '@/assets/figma/title-transport.svg';
import telecom from '@/assets/figma/title-telecom.svg';
import life from '@/assets/figma/title-life.svg';

export const TITLE_CATEGORIES = [
  'visa', 'housing', 'medical', 'finance',
  'work', 'transport', 'telecom', 'life',
];
export const TITLE_ICONS = { visa, housing, medical, finance, work, transport, telecom, life };

export const DEFAULT_TITLE = 'visa';
export const TITLE_GOAL = 100;

// 칭호별 대표 색상 (배지 bg + 아이콘 배경에 사용)
export const TITLE_COLORS = {
  visa:      { bg: "#F9ECF2", text: "#B85A7C", icon: "#B85A7C" },
  housing:   { bg: "#ECF6F1", text: "#5CA787", icon: "#5CA787" },
  medical:   { bg: "#FDEEED", text: "#D96F70", icon: "#D96F70" },
  finance:   { bg: "#FEF8EC", text: "#D1A448", icon: "#D1A448" },
  work:      { bg: "#EEE9F6", text: "#654B91", icon: "#654B91" },
  transport: { bg: "#EAF4FA", text: "#579BBD", icon: "#579BBD" },
  telecom:   { bg: "#ECEEF9", text: "#6985CF", icon: "#6985CF" },
  life:      { bg: "#EFF6E9", text: "#7DAA5C", icon: "#7DAA5C" },
};

// The title achievements are fixed demo states until answer counting is implemented.
export function titleProgress(userId) {
  return userId === 'demo-ghwlsrns03' ? TITLE_GOAL : 0;
}
