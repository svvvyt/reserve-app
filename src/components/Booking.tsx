import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, Scissors, MapPin } from 'lucide-react';
import { cn, generateTimeSlots } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, BookingFormData } from '@/lib/booking-schema';
import { useApiData } from '@/hooks/use-api-data';
import {
  getCompanies,
  getEmployeesByCompany,
  getServicesByCompany,
  createAppointment,
  getBranchesByCompany,
} from '@/lib/api';
import { useBookingFilters } from '@/hooks/use-booking-filters';
import { Employee, BarberService, Branch, AppointmentRequest } from '@/types';

interface SalonData {
  employees: Employee[];
  services: BarberService[];
  branches: Branch[];
}

const Booking = () => {
  const { data: companiesData, loading: companiesLoading } = useApiData(
    () => getCompanies(),
    []
  );
  const companyId = companiesData?.result?.[0]?.id;

  const { data, loading: dataLoading } = useApiData(
    () =>
      companyId
        ? Promise.all([
            getEmployeesByCompany(companyId, { is_active: true }),
            getServicesByCompany(companyId, { is_active: true }),
            getBranchesByCompany(companyId),
          ]).then(([employees, services, branches]) => ({
            employees: employees ?? [],
            services: services ?? [],
            branches: branches?.filter((b) => b.is_active) ?? [],
          }))
        : Promise.resolve({ employees: [], services: [], branches: [] }),
    [companyId]
  );

  const [salonData, setSalonData] = useState<SalonData>({
    employees: [],
    services: [],
    branches: [],
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      branch: '',
      specialist: '',
      service: '',
      date: new Date(),
      time: '',
      fullName: '',
      phone: '',
      telegram: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedService = watch('service');
  const selectedBranch = watch('branch');

  useEffect(() => {
    if (data) {
      setSalonData(data);
    }
  }, [data]);

  const { filteredBranches, filteredEmployees } = useBookingFilters(
    salonData.employees,
    salonData.services,
    salonData.branches,
    selectedService,
    selectedBranch
  );

  const selectedBranchData = salonData.branches.find(
    (b) => b.id.toString() === selectedBranch
  );
  const timeSlots = useMemo(
    () =>
      selectedBranchData
        ? generateTimeSlots(
            selectedBranchData.opening_time,
            selectedBranchData.closing_time
          )
        : [],
    [selectedBranchData]
  );

  const handleResetOnChange = (field: 'service' | 'branch') => {
    const currentValues = watch();
    reset({
      ...currentValues,
      ...(field === 'service' && { branch: '', specialist: '', time: '' }),
      ...(field === 'branch' && { specialist: '', time: '' }),
    });
  };

  const onSubmit = async (formData: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const appointmentData: AppointmentRequest = {
        specialist: parseInt(formData.specialist),
        services: [parseInt(formData.service)],
        date: format(formData.date, 'yyyy-MM-dd'),
        time: formData.time,
        full_name: formData.fullName,
        phone: formData.phone,
        user_tg: formData.telegram || undefined,
        branch: parseInt(formData.branch),
      };

      const result = await createAppointment(appointmentData);
      if (result) {
        toast.success('Запись успешно создана!');
        reset();
      } else {
        toast.error('Не удалось создать запись');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Произошла ошибка при создании записи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = companiesLoading || dataLoading;

  return (
    <section
      id='booking'
      className='section-container relative overflow-hidden'
    >
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-salon-accent/5 rounded-full blur-3xl' />
      <h2 className='section-title text-salon-dark'>Записаться к нам</h2>
      <div className='max-w-3xl mx-auto'>
        <div className='glass-card p-8 animate-fade-up'>
          {isLoading ? (
            <div className='flex justify-center py-12'>
              <p className='text-salon-dark/70'>
                Загрузка формы бронирования...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='service' className='text-salon-dark'>
                  Выбрать услугу <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='service'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleResetOnChange('service');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите услугу' />
                      </SelectTrigger>
                      <SelectContent>
                        {salonData.services.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id.toString()}
                          >
                            <div className='flex items-center'>
                              <Scissors className='mr-2 h-4 w-4 text-salon-accent' />
                              <span>{service.name}</span>
                              <span className='ml-2 text-sm text-salon-accent'>
                                {service.price} ₽
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.service && (
                  <p className='text-red-500 text-sm'>
                    {errors.service.message}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='branch' className='text-salon-dark'>
                    Выбрать филиал <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='branch'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleResetOnChange('branch');
                        }}
                        disabled={!selectedService}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedService
                                ? 'Сначала выберите услугу'
                                : 'Выберите филиал'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBranches.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id.toString()}
                            >
                              <div className='flex items-center'>
                                <MapPin className='mr-2 h-4 w-4 text-salon-accent' />
                                <span>{branch.name}</span>
                                <span className='ml-2 text-sm text-salon-dark/60'>
                                  ({branch.address})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.branch && (
                    <p className='text-red-500 text-sm'>
                      {errors.branch.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='specialist' className='text-salon-dark'>
                    Выбрать специалиста <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='specialist'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedBranch}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedBranch
                                ? 'Сначала выберите филиал'
                                : 'Выберите специалиста'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEmployees.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={employee.id.toString()}
                            >
                              <div className='flex items-center'>
                                <User className='mr-2 h-4 w-4 text-salon-accent' />
                                <span>{employee.full_name}</span>
                                <span className='ml-2 text-sm text-salon-dark/60'>
                                  ({employee.grade})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.specialist && (
                    <p className='text-red-500 text-sm'>
                      {errors.specialist.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='date' className='text-salon-dark'>
                    Выбрать дату <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='date'
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Выберите дату</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.date && (
                    <p className='text-red-500 text-sm'>
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='time' className='text-salon-dark'>
                    Выбрать время <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='time'
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!watch('date') || !timeSlots.length}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Выберите время' />
                        </SelectTrigger>
                        <SelectContent className='max-h-[300px]'>
                          <SelectGroup>
                            <SelectLabel>Доступное время</SelectLabel>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                <div className='flex items-center'>
                                  <Clock className='mr-2 h-4 w-4 text-salon-accent' />
                                  <span>{time}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.time && (
                    <p className='text-red-500 text-sm'>
                      {errors.time.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fullName' className='text-salon-dark'>
                    Ваше имя <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='fullName'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='fullName'
                        placeholder='Иванов Иван'
                        {...field}
                      />
                    )}
                  />
                  {errors.fullName && (
                    <p className='text-red-500 text-sm'>
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone' className='text-salon-dark'>
                    Ваш телефон <span className='text-red-500'>*</span>
                  </Label>
                  <Controller
                    name='phone'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='phone'
                        type='tel'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .replace(/[^0-9+]/g, '')
                              .replace(/^7/, '+7')
                          )
                        }
                        placeholder='+79871234567'
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className='text-red-500 text-sm'>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='telegram' className='text-salon-dark'>
                    Telegram (опционально)
                  </Label>
                  <Controller
                    name='telegram'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='telegram'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.startsWith('@')
                              ? e.target.value
                              : `@${e.target.value}`
                          )
                        }
                        placeholder='@username'
                      />
                    )}
                  />
                  {errors.telegram && (
                    <p className='text-red-500 text-sm'>
                      {errors.telegram.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type='submit'
                className='w-full btn-primary'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Обработка...' : 'Записаться'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Booking;
