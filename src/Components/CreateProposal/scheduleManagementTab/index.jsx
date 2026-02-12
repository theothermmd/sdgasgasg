import { Collapse } from 'antd';
import ProjectTimeline from './projectTimeline';
import Milestone from './Milestone';

const ScheduleManagementTab = () => {
  const collapses = [
    {
      key: '1',
      label: <span className='text-blue-600'>زمانبندی کلان اجرای پروژه</span>,
      children: <ProjectTimeline />,
    },
    {
      key: '2',
      label: <span className='text-blue-600'>مایلستون کلی</span>,
      children: <Milestone />,
    },
  ];
  return (
    <>
      <Collapse accordion items={collapses} className='mt-4' />
    </>
  );
};
export default ScheduleManagementTab;
