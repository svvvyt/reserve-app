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
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [telegram, setTelegram] = useState<string>('');

  useEffect(() => {
    if (data) {
      setEmployees(data.employees);
      setServices(data.services);
      setBranches(data.branches);
      const mainBranch = data.branches.find((b) => b.is_main);
      if (mainBranch) setSelectedBranch(mainBranch.id.toString());
    }
  }, [data]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedBranch ||
      !selectedEmployee ||
      !selectedService ||
      !selectedDate ||
      !selectedTime ||
      !fullName ||
      !phone
    ) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }
    try {
      setFormSubmitting(true);
      const appointmentData: AppointmentRequest = {
        specialist: parseInt(selectedEmployee),
        services: [parseInt(selectedService)],
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        full_name: fullName,
        phone: phone,
        user_tg: telegram || undefined,
        branch: parseInt(selectedBranch),
      };
      const result = await createAppointment(appointmentData);
      if (result) {
        toast.success('Запись успешно создана!');
        setSelectedBranch('');
        setSelectedEmployee('');
        setSelectedService('');
        setSelectedDate(new Date());
        setSelectedTime('');
        setFullName('');
        setPhone('');
        setTelegram('');
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

  const filteredEmployees = useMemo(
    () =>
      selectedBranch
        ? employees.filter((e) => e.branch.toString() === selectedBranch)
        : employees,
    [selectedBranch, employees]
  );

  const filteredServices = useMemo(
    () =>
      selectedEmployee
        ? services.filter((s) =>
            filteredEmployees
              .find((e) => e.id.toString() === selectedEmployee)
              ?.services.includes(s.id)
          )
        : services,
    [selectedEmployee, filteredEmployees, services]
  );

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
    setSelectedEmployee('');
    setSelectedService('');
    setSelectedTime('');
  }, [selectedBranch]);

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
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='branch' className='text-salon-dark'>
                  Выбрать филиал <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Выберите филиал' />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
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
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='specialist' className='text-salon-dark'>
                    Выбрать специалиста <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
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
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='service' className='text-salon-dark'>
                    Выбрать услугу <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                    disabled={!selectedEmployee}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={
                          !selectedEmployee
                            ? 'Сначала выберите специалиста'
                            : 'Выберите услугу'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredServices.map((service) => (
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
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='date' className='text-salon-dark'>
                    Выбрать дату <span className='text-red-500'>*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {selectedDate ? (
                          format(selectedDate, 'PPP')
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className={cn('p-3 pointer-events-auto')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='time' className='text-salon-dark'>
                    Выбрать время <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    disabled={!selectedDate || !timeSlots.length}
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
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='fullName' className='text-salon-dark'>
                  Полное имя <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='fullName'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder='Иванов Иван'
                  className='w-full'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone' className='text-salon-dark'>
                  Телефон <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='phone'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder='+7 (999) 123-45-67'
                  className='w-full'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='telegram' className='text-salon-dark'>
                  Telegram (необязательно)
                </Label>
                <Input
                  id='telegram'
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder='@username'
                  className='w-full'
                />
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
