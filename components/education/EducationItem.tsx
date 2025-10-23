import React from "react";
import { formatDateRange } from '@/utils/dateUtils';

interface EducationItemProps {
  subject: string;
  degree: string;
  university: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
}

const EducationItem: React.FC<EducationItemProps> = ({
  subject,
  degree,
  university,
  href,
  startDate,
  endDate,
  description
}) => {
  return (
    <div className="group flex flex-col lg:flex-row mb-4 p-4 lg:p-5 transition-all bg-surface-200 hover:bg-surface-300 rounded-lg border border-transparent hover:border-border-accent/20 hover:shadow-lg">
      <div className='mb-2 lg:mb-0 lg:mr-2 text-text-secondary text-xs lg:basis-1/4'>{formatDateRange(startDate, endDate)}</div>
      <div className='lg:basis-3/4'>
        <a href={href} target="_blank" rel="noopener noreferrer" className='font-medium transition-all hover:text-primary-200 text-sm lg:text-base'>{subject} ({degree})</a>
        <div className='text-text-secondary mb-4 text-sm lg:text-base'>{university}</div>
        <div className='text-text-secondary text-sm lg:text-base leading-relaxed'>{description}</div>
      </div>
    </div>
  );
};

export default EducationItem;
