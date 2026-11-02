import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryLabel } from '@/constants/categories';
import { DEFAULT_TITLE, TITLE_CATEGORIES, TITLE_GOAL, TITLE_ICONS, titleProgress } from '@/constants/titles';
import { readRecord, writeRecord } from '@/data/database';
import QAHeader from '@/components/layout/QAHeader';
import useAuthStore from '@/store/authStore';

export default function TitlePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const progress = titleProgress(user.id);
  const unlocked = progress === TITLE_GOAL;
  const [selected, setSelected] = useState(unlocked ? DEFAULT_TITLE : null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    readRecord('settings', user.id).then((settings) => {
      if (active) setSelected(unlocked ? settings?.selectedTitle ?? DEFAULT_TITLE : null);
    });
    return () => { active = false; };
  }, [user.id, unlocked]);

  async function selectTitle(id) {
    if (!unlocked || busy || selected === id) return;
    setBusy(true);
    try {
      const settings = await readRecord('settings', user.id);
      await writeRecord('settings', {
        ...settings,
        id: user.id,
        ownerId: user.id,
        selectedTitle: id,
        updatedAt: new Date().toISOString(),
        revision: (settings?.revision ?? 0) + 1,
      });
      setSelected(id);
    } finally { setBusy(false); }
  }

  return <div className="screen titles-screen"><QAHeader onBack={() => navigate(-1)} />
    <div className="titles-scroll">
      <section className="titles-summary">
        <div><small>{t('titles.current')}</small><strong>{selected ? t(`titles.names.${selected}`) : t('titles.none')}</strong><span>{t('titles.achieved', { count: unlocked ? TITLE_CATEGORIES.length : 0, total: TITLE_CATEGORIES.length })} · {t('titles.average')} <b>{progress}%</b></span></div>
        <span className="titles-applied">{selected ? t('titles.applied') : t('titles.locked')}</span>
        <div className="titles-summary-track"><i style={{ width: `${progress}%` }} /></div>
      </section>
      <div className="titles-heading"><h2>{t('titles.progress')}</h2><span>{t('titles.hint')}</span></div>
      <div className="titles-grid">{TITLE_CATEGORIES.map((id) => <button
        key={id}
        type="button"
        className={`title-card${selected === id ? ' selected' : ''}${unlocked ? ' achieved' : ''}`}
        onClick={() => selectTitle(id)}
        disabled={!unlocked || busy}
        aria-pressed={selected === id}
      >
        <div className="title-card-top"><span className={`title-icon title-icon-${id}`}><img src={TITLE_ICONS[id]} alt="" /></span><span className="title-card-name"><strong>{t(`titles.names.${id}`)}</strong><small>{t('titles.goal', { category: categoryLabel(id, i18n.language), count: TITLE_GOAL })}</small></span></div>
        <div className="title-track"><i style={{ width: `${progress}%` }} /></div>
        <div className="title-card-bottom"><small>{progress} / {TITLE_GOAL}{t('titles.times')}</small><b>{selected === id ? t('titles.active') : unlocked ? t('titles.achievedTag') : `${progress}%`}</b></div>
        {selected === id && <span className="title-check" aria-hidden="true">✓</span>}
      </button>)}</div>
    </div>
  </div>;
}
