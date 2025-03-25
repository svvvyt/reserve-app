import React from 'react';

import { BranchMapObject } from '@/types/index';

export const YMapsWidget: React.FC<BranchMapObject> = ({ iframeSrc }) => {
  return (
    <div className='relative overflow-hidden w-full h-full'>
      <iframe
        src={iframeSrc}
        className='relative w-full h-full border border-gray-300'
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};
