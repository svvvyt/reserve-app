// Footer.tsx
import { useState, useEffect } from 'react';
import { Instagram, Facebook, Send, Phone, Mail } from 'lucide-react';
import { getCompanyDetails } from '@/lib/api';
import { Company } from '@/types';
import { toast } from 'sonner';

const Footer = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const companyId = 1;

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const companyData = await getCompanyDetails(companyId);
        setCompany(companyData);
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast.error('Не удалось загрузить данные компании');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return (
      <footer
        id='footer'
        className='bg-salon-dark text-white py-12 relative overflow-hidden'
      >
        <p className='text-center'>Загрузка...</p>
      </footer>
    );
  }

  return (
    <footer
      id='footer'
      className='bg-salon-dark text-white py-12 relative overflow-hidden'
    >
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='mb-8 md:mb-0 text-center md:text-left'>
            <h3 className='text-xl font-bold mb-4'>{company.name}</h3>
            <p className='text-white/70 max-w-xs'>
              {company?.headline ||
                'Качественный сервис и профессиональный подход к каждому клиенту'}
            </p>
          </div>
          <div className='mb-8 md:mb-0 text-center md:text-left'>
            <h4 className='text-lg font-semibold mb-4'>Контакты</h4>
            <div className='space-y-2'>
              <div className='flex items-center justify-center md:justify-start'>
                <Phone className='h-5 w-5 text-salon-accent mr-2' />
                <span>
                  {company?.phone_number_main || '+7 (999) 123-45-67'}
                </span>
              </div>
              <div className='flex items-center justify-center md:justify-start'>
                <Mail className='h-5 w-5 text-salon-accent mr-2' />
                <span>{company?.email || 'info@beautyreserve.ru'}</span>
              </div>
            </div>
          </div>
          <div className='text-center md:text-left'>
            <h4 className='text-lg font-semibold mb-4'>Социальные сети</h4>
            <div className='flex space-x-4 justify-center md:justify-start'>
              <a
                href={company?.link_inst || '#'}
                className='bg-white/10 hover:bg-salon-accent p-2 rounded-full transition-colors'
                aria-label='Instagram'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href={company?.link_fb || '#'}
                className='bg-white/10 hover:bg-salon-accent p-2 rounded-full transition-colors'
                aria-label='Facebook'
              >
                <Facebook className='h-5 w-5' />
              </a>
              <a
                href={company?.link_tg || '#'}
                className='bg-white/10 hover:bg-salon-accent p-2 rounded-full transition-colors'
                aria-label='Telegram'
              >
                <Send className='h-5 w-5' />
              </a>
            </div>
          </div>
        </div>
        <div className='mt-12 pt-6 border-t border-white/10 text-center text-white/50 text-sm'>
          <p>© {new Date().getFullYear()} BeautyReserve. Все права защищены.</p>
        </div>
      </div>
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-salon-accent to-transparent opacity-30'></div>
    </footer>
  );
};

export default Footer;
