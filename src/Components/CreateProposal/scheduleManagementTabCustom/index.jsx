import { Collapse } from 'antd';
import ProjectTimeline from './projectTimeline';
import Milestone from './Milestone';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';

const ScheduleManagementTab = ({ serverConfigs }) => {
  const one =
    serverConfigs && serverConfigs.at(0)?.Visible
      ? {
          key: '1',
          label: <span className='text-blue-600'>زمانبندی کلان اجرای پروژه</span>,
          children: <ProjectTimeline />,
        }
      : null;
  const tow =
    serverConfigs && serverConfigs.at(1)?.Visible
      ? {
          key: '2',
          label: <span className='text-blue-600'>مایلستون کلی</span>,
          children: <Milestone />,
        }
      : null;

  const collapses = [];
  if (one) {
    collapses.push(one);
  }
  if (tow) {
    collapses.push(tow);
  }

  return (
    <>
      {!!collapses ? <Collapse accordion items={collapses} className='!mt-4' /> : ''}
      <DynamicFormComponent formStructure={serverConfigs.filter((value) => value.Order > 2)} />
    </>
  );
};
export default ScheduleManagementTab;
