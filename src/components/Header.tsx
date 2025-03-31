import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

import { useApiData } from '@/hooks/use-api-data';
import { getCompanies } from '@/lib/api';

import { cn, scrollToSection } from '@/lib/utils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: companiesData, loading } = useApiData(getCompanies);

  const companyName =
    loading || !companiesData?.result?.length
      ? 'BeautyReserve'
      : companiesData.result[0].name;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <div className='text-salon-dark text-xl md:text-2xl font-bold tracking-tight'>
          {companyName}
        </div>
        <nav className='hidden md:flex space-x-8'>
          <button
            onClick={() => scrollToSection('services')}
            className='text-salon-dark hover:text-salon-accent transition-colors font-medium'
          >
            Наши услуги
          </button>
          <button
            onClick={() => scrollToSection('booking')}
            className='text-salon-dark hover:text-salon-accent transition-colors font-medium'
          >
            Записаться к нам
          </button>
          <button
            onClick={() => scrollToSection('address')}
            className='text-salon-dark hover:text-salon-accent transition-colors font-medium'
          >
            Адрес
          </button>
          <button
            onClick={() => scrollToSection('footer')}
            className='text-salon-dark hover:text-salon-accent transition-colors font-medium'
          >
            Контакты
          </button>
        </nav>
        <button
          className='md:hidden text-salon-dark'
          onClick={toggleMobileMenu}
          aria-label='Toggle menu'
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div
        className={cn(
          'fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out pt-20',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className='flex flex-col items-center space-y-6 p-8'>
          <button
            onClick={() => {
              scrollToSection('services');
              setMobileMenuOpen(false);
            }}
            className='text-salon-dark text-xl font-medium'
          >
            Наши услуги
          </button>
          <button
            onClick={() => {
              scrollToSection('booking');
              setMobileMenuOpen(false);
            }}
            className='text-salon-dark text-xl font-medium'
          >
            Записаться к нам
          </button>
          <button
            onClick={() => {
              scrollToSection('address');
              setMobileMenuOpen(false);
            }}
            className='text-salon-dark text-xl font-medium'
          >
            Адрес
          </button>
          <button
            onClick={() => {
              scrollToSection('footer');
              setMobileMenuOpen(false);
            }}
            className='text-salon-dark text-xl font-medium'
          >
            Контакты
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
