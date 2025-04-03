import React from 'react';

import { BranchMapObject } from '@/types/index';

export const YMapsWidget: React.FC<BranchMapObject> = ({
  mainLink,
  mainLinkText,
  categoryLink,
  categoryLinkText,
  iframeSrc,
  width = '500px',
  height = '500px',
}) => {
  return (
    <div
      className='map-iframe-container'
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <a
        href={mainLink}
        style={{
          color: '#eee',
          fontSize: '12px',
          position: 'absolute',
          top: '0px',
          textDecoration: 'none',
        }}
      >
        {mainLinkText}
      </a>
      <a
        href={categoryLink}
        style={{
          color: '#eee',
          fontSize: '12px',
          position: 'absolute',
          top: '14px',
          textDecoration: 'none',
        }}
      >
        {categoryLinkText}
      </a>
      <iframe
        src={iframeSrc}
        width={width}
        height={height}
        frameBorder='1'
        allowFullScreen={true}
        style={{ position: 'relative' }}
      ></iframe>
    </div>
  );
};
