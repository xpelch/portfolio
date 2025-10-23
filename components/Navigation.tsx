'use client'

import React from "react";
import NavItem from "./NavItem";
import { useLanguage } from '@/contexts/LanguageContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { NAVIGATION_ITEMS, INTERSECTION_OBSERVER_CONFIG } from '@/constants/navigation';
import { getNavigationName } from '@/utils/navigationUtils';

const Navigation: React.FC = () => {
  const activeSection = useIntersectionObserver(INTERSECTION_OBSERVER_CONFIG.threshold);
  const { translations } = useLanguage();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-6">
        Navigation
      </h3>
      <nav className="space-y-1">
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            active={activeSection === item.id || (item.id === 'projects' && activeSection === 'credits')}
            href={item.href}
            num={item.num}
            name={getNavigationName(item.id, translations)}
          />
        ))}
      </nav>
    </div>
  );
};

export default Navigation;
