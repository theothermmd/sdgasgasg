import React from 'react';
import CreateAccessGroup from '../CreateAccessGroup';
import SystemParts from '../SystemParts';
import TypeProjectAccessGroup from '../TypeProjectAccessGroup';
import ProjectPortfolioAccessGroup from '../ProjectPortfolioAccessGroup';
import UnitAccessGroup from '../UnitAccessGroup';

const AccessGroupItems = () => {
  return [
    {
      key: '1',
      label: 'ایجاد گروه دسترسی',
      children: <CreateAccessGroup />,
    },
    {
      key: '2',
      label: 'نوع پروژه',
      children: <TypeProjectAccessGroup />,
    },
    {
      key: '3',
      label: ' واحد سازمانی',
      children: <UnitAccessGroup />,
    },
    {
      key: '4',
      label: 'سبد طراحی/پروژه',
      children: <ProjectPortfolioAccessGroup />,
    },
    {
      key: '5',
      label: 'بخش های سامانه',
      children: <SystemParts />,
    },
  ];
};

export default AccessGroupItems;
