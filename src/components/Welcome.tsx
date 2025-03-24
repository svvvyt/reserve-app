import { ArrowRight, MapPin } from 'lucide-react';

import BranchInfo from '@/components/BranchInfo';
import { YMapsWidget } from '@/components/YMapsWidget';

import { cn, scrollToSection } from '@/lib/utils';
import {
  getCompanies,
  getCompanyDetails,
  getBranchesByCompany,
} from '@/lib/api';

import { BranchMapObjects } from '@/lib/constants';

import { useApiData } from '@/hooks/use-api-data';

const Welcome = () => {
  const { data: companiesData, loading: companiesLoading } = useApiData(
    () => getCompanies(),
    []
  );
  const companyId = companiesData?.result?.[0]?.id;

  const { data: company, loading: companyLoading } = useApiData(
    () => (companyId ? getCompanyDetails(companyId) : Promise.resolve(null)),
    [companyId]
  );

  const { data: branches, loading: branchesLoading } = useApiData(
    () => (companyId ? getBranchesByCompany(companyId) : Promise.resolve(null)),
    [companyId]
  );

  const branch =
    branches?.find((b) => b.is_active && b.is_main) || branches?.[0];
  const loading = companiesLoading || companyLoading || branchesLoading;

  if (loading) {
    return (
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20'>
        <p className='text-salon-dark/70'>Загрузка...</p>
      </section>
    );
  }

  if (!companyId) {
    return (
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20'>
        <p className='text-salon-dark/70'>Компании не найдены</p>
      </section>
    );
  }

  const mapObject = BranchMapObjects[0]; // связать с филиалом

  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20'>
      <div className='container mx-auto px-4 z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='space-y-8 animate-fade-up'>
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-salon-dark'>
              Welcome
            </h1>
            <p className='text-xl sm:text-2xl md:text-3xl font-medium text-salon-accent leading-relaxed'>
              {company?.headline || 'Легендарный барбершоп в Санкт-Петербурге!'}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <button
                onClick={() => scrollToSection('booking')}
                className='btn-primary'
              >
                Записаться
                <ArrowRight className='ml-2 h-5 w-5' />
              </button>
              <button
                onClick={() => scrollToSection('address')}
                className='btn-secondary'
              >
                Показать на карте
                <MapPin className='ml-2 h-5 w-5' />
              </button>
            </div>
          </div>
          <div
            className={cn(
              'glass-card p-8 max-w-md mx-auto w-full',
              'animate-slide-in-right hover:shadow-xl transition-all duration-300'
            )}
          >
            <div className='space-y-6'>
              {branch && <BranchInfo branch={branch} />}
              <div className='rounded-lg overflow-hidden border border-salon-dark/10 h-48'>
                <YMapsWidget
                  mainLink={mapObject.mainLink}
                  mainLinkText={mapObject.mainLinkText}
                  categoryLink={mapObject.categoryLink}
                  categoryLinkText={mapObject.categoryLinkText}
                  iframeSrc={mapObject.iframeSrc}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='absolute -bottom-24 -right-24 w-96 h-96 bg-salon-accent/10 rounded-full blur-3xl opacity-70'></div>
      <div className='absolute -top-24 -left-24 w-80 h-80 bg-salon-accent/5 rounded-full blur-3xl'></div>
    </section>
  );
};

export default Welcome;
