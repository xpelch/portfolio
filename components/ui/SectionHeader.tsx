import React from 'react';

interface SectionHeaderProps {
  number: string;
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title }) => {
  return (
    <div className="flex items-center mb-8">
      <div className="w-12 h-12 bg-primary-400/20 rounded-xl flex items-center justify-center mr-4">
        <span className="text-primary-400 text-xl font-bold">{number}</span>
      </div>
      <h2 className='text-3xl font-bold text-on-surface'>
        {title}
      </h2>
    </div>
  );
};

export default SectionHeader;
