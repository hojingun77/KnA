import { useTranslation } from 'react-i18next';
import searchBack from '@/assets/figma/search-back.svg';

export default function BackButton({ onClick, className = '' }) {
  const { t } = useTranslation();
  return <button className={`back-button${className ? ` ${className}` : ''}`} type="button" onClick={onClick} aria-label={t('common.back')}>
    <img src={searchBack} alt="" />
  </button>;
}