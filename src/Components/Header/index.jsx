import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useGetUserBufullQualifyName } from '../../ApiHooks/CommonHooks/Users';
import CompanyLogo from '../../../public/Images/Sazmanyar_Log2.webp';
import ThemeSwitcher from '../Theme/ThemeSwitcher';
// Lazy load components
const Reminder = React.lazy(() => import('../Reminder')); // جدا کردن Reminder به فایل مجزا

// درست:
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { FaGear } from 'react-icons/fa6';

const Header = () => {
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  const token = useSelector((state) => state.Auth.token);
  const PRPCompanyName = useSelector((state) => state.Auth.PRPCompanyName);

  const { mutateAsync: getUserData } = useGetUserBufullQualifyName();
  const [userData, setUserData] = useState({ UserName: '...' }); // fallback text برای کاهش LCP

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getUserData();
      if (response?.data) setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, [token, getUserData]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const LOGIN_AnotherUser = useCallback(() => {
    localStorage.clear();
    const sourceUrl = `${window.location.origin}/_layouts/15/ProposalSharePoint/dist/index.aspx/`;
    const encodedSource = encodeURIComponent(sourceUrl);
    document.location.href = `/_layouts/closeConnection.aspx?source=${encodedSource}&loginasanotheruser=true`;
  }, []);

  const EXIT_Page = useCallback(() => {
    document.location.href = '/_layouts/signout.aspx';
  }, []);

  const items = [
    { key: '1', label: <div onClick={LOGIN_AnotherUser}>ورود با کاربر دیگر</div> },
    { key: '2', label: <div onClick={EXIT_Page}>خروج</div> },
  ];

  const [isReminderOpen, setIsReminderOpen] = useState(false);

  return (
    <div dir='rtl' className='w-full'>
      <div className='flex w-full top-0 h-12 p-1 bg-blue-700 items-center pl-4'>
        {/* Logo + Company Name */}
        <div className='flex items-center w-[29rem]'>
          {/* <div className='rounded mr-2 flex items-center justify-center'>
            <a title='منوی برنامه'>
              <HiOutlineDotsVertical color='white' size={20} />
            </a>
          </div> */}
          <a className='flex items-center pr-1' href='/'>
            <img
              src={import.meta.env.DEV ? CompanyLogo : `${imageBaseUrl}/Sazmanyar_Log2.png`}
              width={36}
              height={36}
              className='inline-block rounded-full p-1 mr-2 bg-white'
              alt='logo'
              loading='eager'
            />
            <div className='inline-block text-white text-[1rem] mr-2'>سامانه اطلاعات مدیریت {PRPCompanyName}</div>
          </a>
        </div>

        {/* Divider */}
        <div className='h-[90%] w-0.5 rounded-full bg-gray-300 border-none'></div>

        {/* User + Gear + Reminder */}
        <div className='flex justify-between items-center w-full'>
          {/* User Info + Dropdown */}
          <div className='flex items-center mr-6 gap-3'>
            <Suspense fallback={null}>
              <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement='bottomRight'
                className='cursor-pointer hover:bg-blue-600 hover:ring-1 ring-blue-500 rounded-md px-3 py-1 transition-colors flex  items-center gap-2 text-blue-500 hover:text-blue-700'
              >
                <div
                  className='flex items-center gap-2 cursor-pointer'
                  onClick={(e) => e.preventDefault()} // جلوگیری از رفرش یا رفتار پیش‌فرض
                >
                  <UserOutlined className='rounded-full p-2 bg-white !text-black text-md' />
                  <span className='text-white mt-1'>{userData?.UserName}</span>
                  <FaGear color='white' size={16} />
                </div>
              </Dropdown>
            </Suspense>
          </div>
          <div className='flex items-center w-fit'>
            <ThemeSwitcher />
            {/* Reminder Bell */}
            <div className='relative flex items-center justify-center w-20 cursor-pointer mb-1' onClick={() => setIsReminderOpen((prev) => !prev)}>
              {isReminderOpen && (
                <Suspense fallback={null}>
                  <Reminder />
                </Suspense>
              )}
              <iframe
                src={`${import.meta.env.DEV ? 'http://test.sazmanyar.org' : window.location.origin}/_layouts/15/Reminder.Sharepoint/dist/index.aspx/ReminderBell`}
                className='w-12 h-12 overflow-hidden'
                frameBorder='0'
                scrolling='no'
                loading='lazy'
              />
              <div className='absolute inset-0 z-10 w-full'></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default React.memo(Header);
