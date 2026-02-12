import React, { useState, useEffect } from 'react';
import { FiSearch, FiFileText, FiUser } from 'react-icons/fi';
import { Button, Dropdown, Select, Space } from 'antd';
import { useGetUsers } from '../../../ApiHooks/CommonHooks/Users';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchProjectCharter } from '../../../ApiHooks/SearchProjectCharter';
import { handelchangeTitle, handelchangeInsertBy } from '../../../features/ProjectChart/ProjectChartSlice';

const Search = () => {
  const dispatch = useDispatch();

  const { data: UsersData } = useGetUsers();
  const [UsersDatas, setUsersData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(undefined);
  const [Title, setTitle] = useState('');
  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);

  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };

  useEffect(() => {
    if (UsersData) {
      setUsersData(TransForToSelectData(UsersData.data, 'UserName', 'Id'));
    }
  }, [UsersData]);
  const search = () => {
    dispatch(handelchangeTitle(Title));
    dispatch(handelchangeInsertBy(selectedUsers));
  };

  return (
    <div className='bg-white  p-2  max-w-sm mx-auto  rounded-md w-full z-50 dark:bg-slate-700 dark:text-white '>
      <div className='flex items-center gap-2 mb-6 text-gray-600 text-sm font-medium'>
        <FiSearch className='text-blue-500 dark:text-white' />
        <span className='dark:text-white'>جستجو</span>
      </div>

      <div className='mb-3'>
        <label className='flex items-center gap-2 mb-1 text-sm text-gray-700 dark:text-white'>
          <FiFileText className='text-gray-500' />
          نام {GlobalTitle}
        </label>
        <input
          type='text'
          className='w-full border border-gray-200 rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500'
          placeholder={`عنوان ${GlobalTitle} را وارد کنید...`}
          defaultValue={Title}
          onBlur={(e) => {
            setTitle(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              search();
            }
          }}
        />
      </div>

      <div>
        <label className='flex items-center gap-2 mb-1 text-sm text-gray-700'>
          <FiUser className='text-gray-500' />
          تنظیم‌کننده
        </label>
        <Select
          value={selectedUsers ?? null}
          onChange={setSelectedUsers}
          style={{ width: '250px' }}
          allowClear
          showSearch
          optionFilterProp='label'
          placeholder='کاربر را انتخاب کنید'
          options={UsersDatas}
          getPopupContainer={(trigger) => trigger.parentNode}
          popupRender={(menu) => (
            <div>
              <div className=' w-full flex-col flex justify-center items-center'>
                {' '}
                <div className='px-3 py-2 text-gray-700 font-medium'>لیست کاربران</div>
                <div className='w-[90%] bg-gray-100 rounded-full h-0.5 shadow mb-5'></div>
              </div>

              {menu}
            </div>
          )}
          className='!w-full  outline-none outline-gray-50 rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500 '
        />
      </div>
      <div onClick={search} className='w-full flex items-center justify-center mt-5'>
        <button className='rounded-md mb-2 bg-blue-500 hover:bg-blue-600 px-8 py-2 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 ease-out text-white cursor-pointer text-sm'>
          جستجو
        </button>
      </div>
    </div>
  );
};

export default Search;
