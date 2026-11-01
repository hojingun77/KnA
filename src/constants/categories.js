import visa from '@/assets/figma/visa.svg';
import housing from '@/assets/figma/housing.svg';
import medical from '@/assets/figma/medical.svg';
import finance from '@/assets/figma/finance.svg';
import work from '@/assets/figma/work.svg';
import transport from '@/assets/figma/transport.svg';
import telecom from '@/assets/figma/telecom.svg';
import life from '@/assets/figma/life.svg';

export const CATEGORY_ICONS = { visa, housing, medical, finance, work, transport, telecom, life };
export const CATEGORIES = [
  ['visa', '비자', 'Visa', 'Thị thực', '签证'], ['housing', '주거', 'Housing', 'Nhà ở', '住房'],
  ['medical', '의료', 'Medical', 'Y tế', '医疗'], ['finance', '금융', 'Finance', 'Tài chính', '金融'],
  ['work', '직장', 'Work', 'Việc làm', '工作'], ['transport', '교통', 'Transit', 'Giao thông', '交通'],
  ['telecom', '통신', 'Telecom', 'Viễn thông', '通信'], ['life', '생활', 'Life', 'Đời sống', '生活'],
];

export function categoryLabel(id, language) {
  const category = CATEGORIES.find(([key]) => key === id);
  const column = { ko: 1, en: 2, vi: 3, 'zh-CN': 4 }[language] ?? 2;
  return category?.[column] ?? id;
}
