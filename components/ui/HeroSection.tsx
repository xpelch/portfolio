import React from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Socials from '@/components/Socials';
import { GeneralData } from '@/types';

interface HeroSectionProps {
  generalData: GeneralData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ generalData }) => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <Header data={generalData} />
          </div>
          
          <div className="lg:col-span-7">
            <div className="bg-surface-200/50 backdrop-blur-xl rounded-2xl p-8 border border-border/20 shadow-2xl">
              <Navigation />
              <div className="mt-8">
                <Socials data={generalData.socials} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
