import React from 'react';
import { Collapse } from 'antd';
import { OtherSettingsOption } from '../CollapseItems';
import ProjectType from './ProjectType';
//صفحه اصلی تنظیمات

const OtherSetting = () => {
  const otherSettingsOption = OtherSettingsOption();

  return (
    <div className='bg-white h-[92vh] overflow-y-auto py-6 pb-10'>
      <div className='px-4  ms-5 mb-3'>تنظیمات</div>
      <div className='px-3 min-h-screen'>
        <Collapse accordion items={otherSettingsOption} className='mt-4' />
      </div>
    </div>
  );
};

export default OtherSetting;
