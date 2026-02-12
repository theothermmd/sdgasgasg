import { Collapse } from 'antd';
import Risks from './Risks';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';

const RisksConstraintsTab = ({ serverConfigs }) => {
  const one =
    serverConfigs && serverConfigs.at(0)?.Visible
      ? {
          key: '1',
          label: <span className='text-blue-600'>ریسک های کلی</span>,
          children: <Risks />,
        }
      : undefined;

  const collapses = [];
  if (one) {
    collapses.push(one);
  }

  return (
    <>
      {!!collapses ? <Collapse accordion items={collapses} className='!mt-4' /> : ''}
      <DynamicFormComponent formStructure={serverConfigs.filter((value) => value.Order > 1)} />
    </>
  );
};
export default RisksConstraintsTab;
