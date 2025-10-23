import React from 'react';

interface SectionContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ 
  id, 
  children, 
  className = 'group' 
}) => {
  return (
    <section data-section id={id} className={className}>
      <div className="bg-surface-200/30 backdrop-blur-xl rounded-2xl p-8 lg:p-12 border border-border/20 shadow-xl">
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;
