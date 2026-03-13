'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';

const categories = ['All', 'News', 'Blog', 'X'];

export default function FilterBar() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

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
      {categories.map((cat) => {
        const isActive = (!filter && cat === 'All') || filter === cat.toLowerCase();
        return (
          <Link
            key={cat}
            href={cat === 'All' ? '/' : `/?filter=${cat.toLowerCase()}`}
            className={`filter-btn ${isActive ? 'active' : ''}`}
            onClick={createRipple}
            aria-current={isActive ? 'page' : undefined}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
