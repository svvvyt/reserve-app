import { MapPin, Clock, Phone } from 'lucide-react';
import { Branch } from '@/types';

interface BranchInfoProps {
  branch: Branch;
  showPhone?: boolean;
}

const BranchInfo: React.FC<BranchInfoProps> = ({
  branch,
  showPhone = false,
}) => (
  <div className='space-y-6'>
    <div className='flex items-start space-x-4'>
      <MapPin className='h-6 w-6 text-salon-accent mt-1 flex-shrink-0' />
      <div>
        <h3 className='text-lg font-semibold text-salon-dark mb-1'>
          {branch.name || 'Локация'}
        </h3>
        <p className='text-salon-dark/70'>{branch.address || 'Не указано'}</p>
      </div>
    </div>
    <div className='flex items-start space-x-4'>
      <Clock className='h-6 w-6 text-salon-accent mt-1 flex-shrink-0' />
      <div>
        <h3 className='text-lg font-semibold text-salon-dark mb-1'>
          Время работы
        </h3>
        <p className='text-salon-dark/70'>
          {branch
            ? `${branch.opening_time.slice(0, 5)}-${branch.closing_time.slice(
                0,
                5
              )}`
            : 'Не указано'}
        </p>
      </div>
    </div>
    {showPhone && branch.phone_number_main && (
      <div className='flex items-start space-x-4'>
        <Phone className='h-6 w-6 text-salon-accent mt-1 flex-shrink-0' />
        <div>
          <h3 className='text-lg font-semibold text-salon-dark mb-1'>
            Телефон
          </h3>
          <p className='text-salon-dark/70'>{branch.phone_number_main}</p>
        </div>
      </div>
    )}
  </div>
);

export default BranchInfo;
