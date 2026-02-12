import { Collapse } from 'antd';
import Budget from './Budget';
import Costs from './Costs';

const BudgetManagerTab = () => {
  const collapses = [
    {
      key: '1',
      label: <span className='text-blue-600'> پیش بینی و برآورد درآمد پروژه‌ها</span>,
      children: <Budget />,
    },
    {
      key: '2',
      label: <span className='text-blue-600'>توزیع هزینه اجرای پروژه</span>,

      children: <Costs />,
    },
  ];
  return (
    <>
      <Collapse accordion items={collapses} className='mt-4' />
    </>
  );
};
export default BudgetManagerTab;
