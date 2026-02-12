import { Collapse } from 'antd';
import Budget from './Budget';
import Costs from './Costs';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';

const BudgetManagerTab = ({ serverConfigs }) => {
  const one =
    serverConfigs && serverConfigs.at(0)?.Visible
      ? {
          key: '1',
          label: <span className='text-blue-600'> پیش بینی و برآورد درآمد پروژه‌ها</span>,
          children: <Budget />,
        }
      : undefined;
  const tow =
    serverConfigs && serverConfigs.at(1)?.Visible
      ? {
          key: '2',
          label: <span className='text-blue-600'>توزیع هزینه اجرای پروژه</span>,
          children: <Costs />,
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
export default BudgetManagerTab;
