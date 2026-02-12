import { Collapse } from 'antd';
import RequiermentProject from '../RequiermentProject';
import Goals from '../Goals';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';

const ProjectGoalsTab = ({ serverConfigs }) => {
  const one =
    serverConfigs && serverConfigs.at(0)?.Visible
      ? {
          key: '1',
          label: <span className='text-blue-600'>الزامات کلی</span>,
          children: <RequiermentProject />,
        }
      : undefined;
  const tow =
    serverConfigs && serverConfigs.at(1)?.Visible
      ? {
          key: '2',
          label: <span className='text-blue-600'>اهداف کلی</span>,
          children: <Goals />,
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
export default ProjectGoalsTab;
