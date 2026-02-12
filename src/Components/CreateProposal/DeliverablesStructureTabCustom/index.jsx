import { Collapse } from 'antd';
import DeliverablesTable from './DeliverablesTable';
import ProjectExecutionChart from './ProjectExecutionChart';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';

const DeliverablesStructureTab = ({ serverConfigs }) => {
  const one =
    serverConfigs && serverConfigs.at(0)?.Visible
      ? {
          key: '1',
          label: <span className='text-blue-600'>چارت اجرایی پروژه ها</span>,
          children: <ProjectExecutionChart />,
        }
      : undefined;
  const tow =
    serverConfigs && serverConfigs.at(1)?.Visible
      ? {
          key: '2',
          label: <span className='text-blue-600'>اقلام قابل تحویل</span>,
          children: <DeliverablesTable />,
        }
      : undefined;

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
export default DeliverablesStructureTab;
