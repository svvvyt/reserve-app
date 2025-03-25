import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { YMapsWidget } from '@/components/YMapsWidget';
import BranchInfo from '@/components/BranchInfo';

import { getCompanies, getBranchesByCompany } from '@/lib/api';
import { useApiData } from '@/hooks/use-api-data';
import { BranchMapObject } from '@/types/index';

const Address = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: companiesData, loading: companiesLoading } = useApiData(
    () => getCompanies(),
    []
  );
  const companyId = companiesData?.result?.[0]?.id;

  const { data: branches, loading: branchesLoading } = useApiData(
    () =>
      companyId
        ? getBranchesByCompany(companyId).then(
            (branches) => branches?.filter((b) => b.is_active) || []
          )
        : Promise.resolve(null),
    [companyId]
  );

  const loading = companiesLoading || branchesLoading;

  const branchMapObjects: BranchMapObject[] =
    branches?.map((branch) => ({
      iframeSrc: `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent(
        branch.address
      )}&z=14`,
      width: '750px',
      height: '500px',
    })) || [];

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === (branches?.length ?? 0) - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? (branches?.length ?? 0) - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <section className='section-container bg-white relative overflow-hidden'>
        <p className='text-center text-salon-dark/70'>Загрузка филиалов...</p>
      </section>
    );
  }

  if (!branches?.length) {
    return (
      <section className='section-container bg-white relative overflow-hidden'>
        <p className='text-center text-salon-dark/70'>Филиалы не найдены</p>
      </section>
    );
  }

  const currentBranch = branches[currentIndex];
  const currentMapObject = branchMapObjects[currentIndex];

  return (
    <section
      id='address'
      className='section-container bg-white relative overflow-hidden'
    >
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-salon-accent/5 rounded-full blur-3xl'></div>
      <div className='max-w-5xl mx-auto px-12'>
        <h2 className='text-3xl font-semibold text-salon-dark mb-8 text-center'>
          Наши филиалы
        </h2>
        <div className='relative'>
          {branches.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className='absolute -left-12 top-1/2 -translate-y-1/2 z-10 p-2 bg-salon-accent/80 hover:bg-salon-accent text-white rounded-full'
              >
                <ChevronLeft className='h-6 w-6' />
              </button>
              <button
                onClick={nextSlide}
                className='absolute -right-12 top-1/2 -translate-y-1/2 z-10 p-2 bg-salon-accent/80 hover:bg-salon-accent text-white rounded-full'
              >
                <ChevronRight className='h-6 w-6' />
              </button>
            </>
          )}
          <div
            key={currentIndex}
            className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-slide-in'
          >
            <div className='rounded-lg overflow-hidden h-96 glass-card animate-fade-up'>
              <YMapsWidget iframeSrc={currentMapObject.iframeSrc} />
            </div>
            <div className='space-y-8 animate-slide-in-right'>
              <BranchInfo branch={currentBranch} showPhone />
              {branches.length > 1 && (
                <div className='flex justify-center gap-2 mt-4'>
                  {branches.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        currentIndex === index
                          ? 'bg-salon-accent'
                          : 'bg-salon-dark/20'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Address;
