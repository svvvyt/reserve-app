import { toast } from 'sonner';
import type {
  AppointmentRequest,
  BarberService,
  Branch,
  Company,
  Employee,
  ServiceCategory,
} from '@/types/index';
import { API_BASE_URL } from './constants';

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  toast.error('Произошла ошибка при загрузке данных');
  return null;
};

async function fetchData<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
}

// Companies
export const getCompanies = (): Promise<{ result: Company[] } | null> =>
  fetchData<{ result: Company[] }>('/companies/');

// Company details
export const getCompanyDetails = (companyId: number): Promise<Company | null> =>
  fetchData<Company>(`/companies/detail/${companyId}/`);

// Branches
export const getBranchesByCompany = (
  companyId: number
): Promise<Branch[] | null> =>
  fetchData<Branch[]>(`/branches/company/${companyId}/`);

// Employees
export const getEmployeesByCompany = (
  companyId: number,
  params?: { branch?: number; services?: number[]; is_active?: boolean }
): Promise<Employee[] | null> => {
  let url = `/employees/company/${companyId}/`;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.branch) queryParams.append('branch', params.branch.toString());
    if (params.services)
      params.services.forEach((s) =>
        queryParams.append('services', s.toString())
      );
    if (params.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (queryParams.toString()) url += `?${queryParams.toString()}`;
  }
  return fetchData<{ result: Employee[] }>(url).then(
    (data) => data?.result || null
  );
};

// Service Categories
export const getServiceCategoriesByCompany = (
  companyId: number,
  params?: { branch?: number; is_active?: boolean }
): Promise<ServiceCategory[] | null> => {
  let url = `/service-categories/company/${companyId}/`;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.branch) queryParams.append('branch', params.branch.toString());
    if (params.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (queryParams.toString()) url += `?${queryParams.toString()}`;
  }
  return fetchData<ServiceCategory[]>(url);
};

// Barber Services
export const getServicesByCompany = (
  companyId: number,
  params?: { branch?: number; employee?: number; is_active?: boolean }
): Promise<BarberService[] | null> => {
  let url = `/barber-services/company/${companyId}/`;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.branch) queryParams.append('branch', params.branch.toString());
    if (params.employee)
      queryParams.append('employee', params.employee.toString());
    if (params.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (queryParams.toString()) url += `?${queryParams.toString()}`;
  }
  return fetchData<{ result: BarberService[] }>(url).then(
    (data) => data?.result || null
  );
};

// Appointments
export const createAppointment = async (
  appointmentData: AppointmentRequest
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([appointmentData]),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
