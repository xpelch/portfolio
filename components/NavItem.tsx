import React from "react";

interface NavItemProps {
  active: boolean;
  href: string;
  num: string;
  name: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, href, num, name }) => {
  return (
    <a 
      href={href} 
      className={`
        group flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-surface-300/50
        ${active 
          ? 'bg-primary-400/20 text-primary-400 border-l-4 border-primary-400' 
          : 'text-text-secondary hover:text-on-surface hover:border-l-4 hover:border-primary-400/50'
        }
      `}
    >
      <span className={`
        text-sm font-mono mr-4 transition-colors duration-300
        ${active ? 'text-primary-400' : 'text-text-secondary group-hover:text-primary-400'}
      `}>
        {num}
      </span>
      <span className="font-medium transition-colors duration-300">
        {name}
      </span>
    </a>
  );
};

export default NavItem;
