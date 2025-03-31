import { useState, useEffect } from 'react';
import { ArrowRight, Scissors } from 'lucide-react';
import { BarberService, ServiceCategory } from '@/types';
import { toast } from 'sonner';
import { getServiceCategoriesByCompany, getServicesByCompany } from '@/lib/api';
import { cn } from '@/lib/utils';

const Services = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<BarberService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const companyId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getServiceCategoriesByCompany(companyId, {
          is_active: true,
        });
        const servicesData = await getServicesByCompany(companyId, {
          is_active: true,
        });

        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
          setSelectedCategory(categoriesData[0].id);
        }
        if (servicesData) {
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Error fetching services data:', error);
        toast.error('Не удалось загрузить услуги');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  const filteredServices = services.filter(
    (service) => service.category === selectedCategory
  );
  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  const handleCategoryChange = (categoryId: number) => {
    console.log('Switching to category:', categoryId);
    setSelectedCategory((prev) => (prev !== categoryId ? categoryId : prev));
  };

  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section
      id='services'
      className='section-container bg-white relative overflow-hidden'
    >
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-salon-accent/5 rounded-full blur-3xl pointer-events-none'></div>
      <h2 className='section-title text-salon-dark'>Наши услуги</h2>

      <div className='flex justify-center mb-12'>
        <div className='inline-flex rounded-md shadow-sm bg-gray-100 p-1 space-x-1'>
          {categories.map((category) => (
            <button
              key={category.id}
              className={cn(
                // Базовые стили для мобильных устройств (до 768px)
                'px-4 py-1 text-xs font-medium rounded-md transition-colors duration-300 cursor-pointer min-w-[80px] text-center',
                // Стили для десктопа (от 768px и выше)
                'md:px-6 md:py-2 md:text-sm md:min-w-[100px]',
                selectedCategory === category.id
                  ? 'bg-white shadow-sm text-salon-dark'
                  : 'bg-transparent text-salon-dark/70 hover:text-salon-dark'
              )}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center py-12'>
          <div className='animate-pulse space-y-4 w-full max-w-3xl'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded-md'></div>
            ))}
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
          <div className='space-y-6 animate-fade-up'>
            <h3 className='text-2xl font-semibold text-salon-dark mb-6'>
              {currentCategory?.name || 'Услуги'}
            </h3>
            <div className='space-y-4'>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className='flex justify-between items-center p-4 border-b border-salon-dark/10 group hover:bg-gray-50 transition-colors rounded-md'
                  >
                    <div>
                      <h4 className='text-lg font-medium text-salon-dark group-hover:text-salon-accent transition-colors'>
                        {service.name}
                      </h4>
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-semibold text-salon-accent'>
                        {service.price} ₽
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-salon-dark/70 italic'>
                  Нет доступных услуг в этой категории
                </p>
              )}
            </div>
            <button onClick={scrollToBooking} className='btn-primary mt-8'>
              Записаться
              <ArrowRight className='ml-2 h-5 w-5' />
            </button>
          </div>
          <div className='relative hidden lg:block'>
            <div className='glass-card overflow-hidden rounded-lg aspect-square animate-slide-in-right'>
              <img
                src={currentCategory?.photo || '/placeholder.svg'}
                alt={currentCategory?.name || 'Услуги'}
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-salon-dark/70 to-transparent flex flex-col justify-end p-8'>
                <h3 className='text-white text-3xl font-semibold mb-2'>
                  {currentCategory?.name || 'Услуги'}
                </h3>
                <p className='text-white/80'>Профессиональные услуги для вас</p>
              </div>
            </div>
            <div className='absolute -bottom-6 -right-6 w-32 h-32 bg-salon-accent rounded-full opacity-10 blur-2xl pointer-events-none'></div>
            <div className='absolute -top-4 -left-4 w-16 h-16'>
              <div className='relative w-full h-full'>
                <div className='absolute inset-0 bg-salon-accent rounded-full animate-pulse opacity-20 pointer-events-none'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Scissors className='h-8 w-8 text-salon-dark' />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
