import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, Scissors, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { BarberService, Employee, AppointmentRequest, Branch } from '@/types';
import {
  getCompanies,
  getEmployeesByCompany,
  getServicesByCompany,
  createAppointment,
  getBranchesByCompany,
} from '@/lib/api';
import { toast } from 'sonner';
import { useApiData } from '@/hooks/use-api-data';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, BookingFormData } from '@/lib/booking-schema';

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
            employees: employees || [],
            services: services || [],
            branches: branches?.filter((b) => b.is_active) || [],
          }))
        : Promise.resolve(null),
    [companyId]
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<BarberService[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

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

  const selectedService = watch('service');
  const selectedBranch = watch('branch');

  useEffect(() => {
    if (data) {
      setEmployees(data.employees);
      setServices(data.services);
      setBranches(data.branches);
    }
  }, [data]);

  // Фильтрация филиалов по выбранной услуге
  const filteredBranches = useMemo(() => {
    if (!selectedService) return branches;
    const employeesWithService = employees.filter((e) =>
      e.services.includes(parseInt(selectedService))
    );
    const branchIds = employeesWithService.map((e) => e.branch);
    return branches.filter((b) => branchIds.includes(b.id));
  }, [selectedService, branches, employees]);

  // Фильтрация сотрудников по услуге и филиалу
  const filteredEmployees = useMemo(() => {
    if (!selectedService || !selectedBranch) return [];
    return employees.filter(
      (e) =>
        e.services.includes(parseInt(selectedService)) &&
        e.branch.toString() === selectedBranch
    );
  }, [selectedService, selectedBranch, employees]);

  const generateTimeSlots = (openingTime: string, closingTime: string) => {
    const slots = [];
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute
        .toString()
        .padStart(2, '0')}`;
      slots.push(time);

      currentMinute += 15;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const onSubmit = async (formData: BookingFormData) => {
    try {
      setFormSubmitting(true);
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
        reset({
          branch: '',
          specialist: '',
          service: '',
          date: new Date(),
          time: '',
          fullName: '',
          phone: '',
          telegram: '',
        });
      } else {
        toast.error('Не удалось создать запись');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Произошла ошибка при создании записи');
    } finally {
      setFormSubmitting(false);
    }
  };

  const selectedBranchData = branches.find(
    (branch) => branch.id.toString() === selectedBranch
  );
  const timeSlots = selectedBranchData
    ? generateTimeSlots(
        selectedBranchData.opening_time,
        selectedBranchData.closing_time
      )
    : [];

  useEffect(() => {
    if (selectedService) {
      reset({ ...watch(), branch: '', specialist: '', time: '' });
    }
  }, [selectedService, reset]);

  useEffect(() => {
    if (selectedBranch) {
      reset({ ...watch(), specialist: '', time: '' });
    }
  }, [selectedBranch, reset]);

  const loading = companiesLoading || dataLoading;

  return (
    <section
      id='booking'
      className='section-container relative overflow-hidden'
    >
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-salon-accent/5 rounded-full blur-3xl'></div>
      <h2 className='section-title text-salon-dark'>Записаться к нам</h2>
      <div className='max-w-3xl mx-auto'>
        <div className='glass-card p-8 animate-fade-up'>
          {loading ? (
            <div className='flex justify-center py-12'>
              <p className='text-salon-dark/70'>
                Загрузка формы бронирования...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              {/* Услуга */}
              <div className='space-y-2'>
                <Label htmlFor='service' className='text-salon-dark'>
                  Выбрать услугу <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='service'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Выберите услугу' />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
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

              {/* Филиал и Специалист в одной строке */}
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
                        onValueChange={field.onChange}
                        disabled={!selectedService}
                      >
                        <SelectTrigger className='w-full'>
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
                        <SelectTrigger className='w-full'>
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

              {/* Дата и время */}
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
                            variant={'outline'}
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
                            initialFocus
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            className={cn('p-3 pointer-events-auto')}
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
                        <SelectTrigger className='w-full'>
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

              {/* Имя, Номер и Telegram в одной строке */}
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
                        {...field}
                        placeholder='Иванов Иван'
                        className='w-full'
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
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/[^0-9+]/g, '');
                          if (value.startsWith('7')) {
                            value = `+${value}`;
                          }
                          field.onChange(value);
                        }}
                        placeholder='+79871234567'
                        className='w-full'
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
                        onChange={(e) => {
                          let value = e.target.value;
                          if (value && !value.startsWith('@')) {
                            value = `@${value}`;
                          }
                          field.onChange(value);
                        }}
                        placeholder='@username'
                        className='w-full'
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
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Обработка...' : 'Записаться'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Booking;
