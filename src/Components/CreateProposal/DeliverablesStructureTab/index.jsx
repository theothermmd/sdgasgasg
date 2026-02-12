import { Collapse } from 'antd';
import DeliverablesTable from './DeliverablesTable';
import ProjectExecutionChart from './ProjectExecutionChart';

const DeliverablesStructureTab = () => {
  const collapses = [
    {
      key: '1',
      label: <span className='text-blue-600'>چارت اجرایی پروژه ها</span>,
      children: <ProjectExecutionChart />,
    },
    {
      key: '2',
      label: <span className='text-blue-600'>اقلام قابل تحویل</span>,
      children: <DeliverablesTable />,
    },
  ];
  return (
    <>
      <Collapse accordion items={collapses} className='mt-4' />
    </>
  );
};
export default DeliverablesStructureTab;
