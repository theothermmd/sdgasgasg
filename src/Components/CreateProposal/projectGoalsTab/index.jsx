import { Collapse } from 'antd';
import RequiermentProject from '../RequiermentProject';
import Goals from '../Goals';

const ProjectGoalsTab = () => {
  const collapses = [
    {
      key: '1',
      label: <span className='text-blue-600'>الزامات کلی</span>,
      children: <RequiermentProject />,
    },
    {
      key: '2',
      label: <span className='text-blue-600'>اهداف کلی</span>,
      children: <Goals />,
    },
  ];
  return (
    <>
      <Collapse accordion items={collapses} className='mt-4' />
    </>
  );
};
export default ProjectGoalsTab;
