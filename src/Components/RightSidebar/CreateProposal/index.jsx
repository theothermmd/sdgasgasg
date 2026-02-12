import { Link, NavLink, useSearchParams } from 'react-router-dom';
import {
  RiCalendarTodoFill,
  RiFileEditFill,
  RiFileList3Fill,
  RiFlag2Fill,
  RiFolderReceivedFill,
  RiMoneyDollarCircleFill,
  RiPushpin2Fill,
  RiShieldUserFill,
  RiTeamFill,
  RiClipboardFill,
} from 'react-icons/ri';
import ActionButtons from '../../CreateProposal/ActionButtons';
import { useGetTabCheckListWithId } from '../../../ApiHooks/OtherSetting/TabCheckList';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { handleAddTabCheckListId } from '../../../features/Form';

const CreateProposal = () => {
  const [Tabs, setTabs] = useState([]);
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

  const TabFormId = searchParams.get('TabFormId');

  const FormId = useSelector((state) => state.Form?.TabCategorieId);

  const FormName = useSelector((state) => state.Form?.FormName);

  const { data: TabCheckLists } = useGetTabCheckListWithId(FormId);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (TabCheckLists && Tabs.length === 0 && TabFormId === null) {
      const temp = TabCheckLists.data
        .filter((value) => value.Visible === true)
        .map((value) => ({
          name: value.Title,
          onClick: () => {
            dispatch(handleAddTabCheckListId(value.Id));
          },
        }));

      const defualttabchecklist = {
        name: 'اطلاعات کلی فرم',
        onClick: () => {
          dispatch(handleAddTabCheckListId('0E247A7F-3E54-490A-91F9-8F83816A504C'));
        },
      };
      if (FormId === '7cc5ad4c-8579-484c-ac44-dbcfc2426bcd') {
        setTabs([...temp]);
        dispatch(handleAddTabCheckListId('32ce553c-43e1-48d5-6e61-08dde5a6bb38'));
        setActiveTab('اطلاعات کلی پروژه');
      } else {
        setTabs([defualttabchecklist, ...temp]);
        dispatch(handleAddTabCheckListId('0E247A7F-3E54-490A-91F9-8F83816A504C'));
        setActiveTab('اطلاعات کلی فرم');
      }
    }
  }, [TabCheckLists, dispatch]);

  return (
    <section className={`position-fixed z-[9998] shadow mr-4 mt-4   bg-white w-64 h-[92vh] overflow-y-auto rounded-xl pb-5 flex flex-col `}>
      <div className='text-center text-xl mt-0.4'>
        <p className='font-bold my-4'>{FormName}</p>
      </div>
      <hr className='border-gray-100 border-2 rounded-full w-[90%] my-1 self-center' />
      {/* لیست تب‌ها */}
      {Tabs.length === 0 && <p className=' w-full text-center mt-14'> تبی وجود ندارد! </p>}
      <ul className='flex flex-col gap-2 px-4 pt-4 overflow-y-auto text-sm mb-2'>
        {Tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              tab.onClick();
            }}
            className={`flex cursor-pointer items-center px-3 py-3 rounded-md  transition-all  hover:-translate-y-0.5 ease-out hover:shadow-md  text-[13px] my-1 ${
              activeTab === tab.name ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 text-gray-700'
            }`}
          >
            <span className='whitespace-nowrap flex gap-2 items-center flex-row-reverse'>
              {tab.name} <RiClipboardFill size={16} />
            </span>
          </button>
        ))}
      </ul>
      <hr className='border-gray-100 border-2 rounded-full w-[90%] my-1 self-center' />
      {/* Buttons */}
      <div className='mt-6 px-1 pb-4'>
        <div className='flex gap-2 justify-between items-center flex-wrap px-2'>
          <ActionButtons />
        </div>
      </div>
    </section>
  );
};

export default CreateProposal;
