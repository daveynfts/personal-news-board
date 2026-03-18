'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';

const categoryKeys = [
  { value: 'All', i18nKey: 'filter.all' },
  { value: 'News', i18nKey: 'filter.news' },
  { value: 'Blog', i18nKey: 'filter.blog' },
  { value: 'X', i18nKey: 'filter.x' },
];

export default function FilterBar() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const { t } = useTranslation();

  // Google Material You ripple handler
  const createRipple = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rippleEl = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    rippleEl.className = 'ripple';
    rippleEl.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      position: absolute;
      pointer-events: none;
    `;

    btn.appendChild(rippleEl);
    rippleEl.addEventListener('animationend', () => rippleEl.remove());
  };

  return (
    <div className="filter-container" style={{ margin: '0 auto 48px' }}>
      {categoryKeys.map((cat) => {
        const isActive = (!filter && cat.value === 'All') || filter === cat.value.toLowerCase();
        return (
          <Link
            key={cat.value}
            href={cat.value === 'All' ? '/' : `/?filter=${cat.value.toLowerCase()}`}
            className={`filter-btn ${isActive ? 'active' : ''}`}
            onClick={createRipple}
            scroll={false}
            aria-current={isActive ? 'page' : undefined}
          >
            {t(cat.i18nKey)}
          </Link>
        );
      })}
    </div>
  );
}
