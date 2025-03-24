import React from 'react';

import { BranchMapObject } from '@/lib/constants';

export const YMapsWidget: React.FC<BranchMapObject> = ({
  mainLink,
  mainLinkText,
  categoryLink,
  categoryLinkText,
  iframeSrc,
}) => {
  return (
    <div className='relative overflow-hidden w-full h-full'>
      <a
        href={mainLink}
        className='absolute top-0 left-0 text-gray-200 text-xs no-underline z-10'
      >
        {mainLinkText}
      </a>
      <a
        href={categoryLink}
        className='absolute top-3.5 left-0 text-gray-200 text-xs no-underline z-10'
      >
        {categoryLinkText}
      </a>
      <iframe
        src={iframeSrc}
        className='relative w-full h-full border border-gray-300'
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};
