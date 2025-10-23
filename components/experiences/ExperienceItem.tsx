import React from "react";
import { formatDateRange } from '@/utils/dateUtils';

interface ExperienceItemProps {
  title: string;
  company: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
  logo: string;
  skills: string[];
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({
  title,
  company,
  href,
  startDate,
  endDate,
  description,
  logo,
  skills
}) => {
  return (
    <div className="group flex flex-col lg:flex-row mb-4 p-4 lg:p-5 transition-all hover:bg-surface-200 rounded-lg border border-transparent hover:border-border-accent/20 hover:shadow-lg">
      <div className="flex flex-row lg:flex-col lg:basis-1/4 lg:mr-2 mb-3 lg:mb-0">
        <div className={`flex items-center justify-center w-[50px] h-[50px] lg:w-[70px] lg:h-[70px] rounded-full mr-3 lg:mr-0 lg:mb-2 aspect-square ${
          company === 'Logix Operations' ? 'bg-primary-200' :
          company === 'Université Laval' ? 'bg-secondary-200' :
          'bg-primary-400'
        }`}>
          <span className='text-surface-100 font-bold text-lg lg:text-xl'>{logo}</span>
        </div>
        <div className='lg:hidden'>
          <a href={href} target="_blank" rel="noopener noreferrer" className='font-medium transition-all hover:text-primary-200 text-sm lg:text-base'>{title} | {company} </a>
          <div className='text-text-secondary text-xs lg:text-sm'>{formatDateRange(startDate, endDate)}</div>
        </div>
      </div>
      <div className='lg:basis-3/4'>
        <div className='hidden lg:block'>
          <a href={href} target="_blank" rel="noopener noreferrer" className='font-medium transition-all hover:text-primary-200'>{title} | {company} </a>
          <div className='mb-2 text-text-secondary'>{formatDateRange(startDate, endDate)}</div>
        </div>
        <div className='text-text-secondary mb-4 text-sm lg:text-base leading-relaxed'>{description}</div>
        <div className='flex flex-row flex-wrap gap-2'>
          {skills && skills.map((skill, index) => (
            <div key={index} className='bg-surface-400 hover:bg-secondary-200 hover:text-surface-100 transition-all py-1 px-2 lg:px-3 rounded-full text-xs cursor-default'>{skill}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceItem;
