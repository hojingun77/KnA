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

// The title achievements are fixed demo states until answer counting is implemented.
export function titleProgress(userId) {
  return userId === 'demo-ghwlsrns03' ? TITLE_GOAL : 0;
}
