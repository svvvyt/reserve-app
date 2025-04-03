import { useMemo } from 'react';
import { Employee, Branch, BarberService } from '@/types';

interface BookingFiltersResult {
  filteredBranches: Branch[];
  filteredEmployees: Employee[];
}

export const useBookingFilters = (
  employees: Employee[],
  services: BarberService[],
  branches: Branch[],
  selectedService: string | undefined,
  selectedBranch: string | undefined
): BookingFiltersResult => {
  const filteredBranches = useMemo(() => {
    if (!selectedService || !branches.length) return branches;

    const serviceId = parseInt(selectedService);
    if (isNaN(serviceId)) return branches;

    const branchIds = new Set<number>(
      employees
        .filter((employee) => employee.services.includes(serviceId))
        .map((employee) => employee.branch)
    );

    return branches.filter((branch) => branchIds.has(branch.id));
  }, [selectedService, branches, employees]);

  const filteredEmployees = useMemo(() => {
    if (!selectedService || !selectedBranch) return [];

    const serviceId = parseInt(selectedService);
    const branchId = selectedBranch;

    if (isNaN(serviceId)) return [];

    return employees.filter(
      (employee) =>
        employee.services.includes(serviceId) &&
        employee.branch.toString() === branchId
    );
  }, [selectedService, selectedBranch, employees]);

  return { filteredBranches, filteredEmployees };
};
