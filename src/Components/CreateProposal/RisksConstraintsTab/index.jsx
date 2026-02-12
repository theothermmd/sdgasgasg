import { Collapse } from 'antd';
import Risks from './Risks';

const RisksConstraintsTab = () => {
  const collapses = [
    {
      key: '1',
      label: <span className='text-blue-600'>ریسک های کلی</span>,
      children: <Risks />,
    },
  ];
  return (
    <>
      <Collapse accordion items={collapses} className='mt-4' />
    </>
  );
};
export default RisksConstraintsTab;
