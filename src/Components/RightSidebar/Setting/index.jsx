import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { RiPushpin2Fill, RiSettingsFill, RiUserShared2Fill, RiFileList3Fill, RiFileEditFill } from 'react-icons/ri';
import { useGetAccessForSaveAndPermissions } from '../../../ApiHooks/CommonHooks/Users';
import { useDispatch, useSelector } from 'react-redux';

const SettingRightSidebar = () => {
  const appVersion = import.meta.env.PACKAGE_VERSION;
  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);
  const PRPURL = useSelector((state) => state.Auth.PRPURL);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: userAccess } = useGetAccessForSaveAndPermissions(true);

  // Memoize iconMap to prevent unnecessary re-renders
  const iconMap = useMemo(() => {
    const baseIconMap = {
      تنظیمات: <RiSettingsFill className='text-base ml-2' />,
      تاییدکنندگان: <RiUserShared2Fill className='text-base ml-2' />,
    };

    if (GlobalTitle) {
      baseIconMap[GlobalTitle] = <RiFileList3Fill className='text-base ml-2' />;
      baseIconMap[`تغییرات ${GlobalTitle}`] = <RiFileEditFill className='text-base ml-2' />;
    }

    return baseIconMap;
  }, [GlobalTitle]);

  // Memoize base tabs configuration
  const baseTabsConfig = useMemo(
    () => [
      {
        name: GlobalTitle || 'منشور پروژه',
        path: `/`,
        userAccess: false,
        label: 'AccessToSaveProjectCharter',
      },
      {
        name: 'تنظیمات',
        path: `/otherSetting`,
        userAccess: false,
        label: 'AccessToBaseSettings',
      },
      {
        name: 'تاییدکنندگان',
        path:
          import.meta.env.MODE !== 'development'
            ? `${PRPURL || ''}/_layouts/15/Sazmanyar.WorkFlowFront/PRP/MainPagePRP.aspx`
            : 'http://epmserver43/_layouts/15/Sazmanyar.WorkFlowFront/PRP/MainPagePRP.aspx',
        userAccess: false,
        label: 'AccessToWorkFlow',
      },
      {
        name: `تغییرات ${GlobalTitle || 'منشور پروژه'}`,
        path: `/ChangingApprovers`,
        userAccess: false,
        label: 'AccessToProjectCharter',
      },
    ],
    [GlobalTitle, PRPURL],
  );

  // State for filtered tabs
  const [filteredTabs, setFilteredTabs] = useState([]);

  // Update filtered tabs when userAccess or baseTabsConfig changes
  useEffect(() => {
    if (userAccess?.data && baseTabsConfig.length > 0) {
      const newFilteredTabs = baseTabsConfig
        .map((tab) => {
          if (tab.label === GlobalTitle || tab.label === 'منشور پروژه') {
            return {
              ...tab,
              userAccess: true,
            };
          } else {
            return {
              ...tab,
              userAccess: Boolean(userAccess.data[tab.label]),
            };
          }
        })
        .filter((tab) => tab.userAccess);

      // Only update state if the filtered tabs actually changed
      setFilteredTabs((prevTabs) => {
        const hasChanged = JSON.stringify(prevTabs) !== JSON.stringify(newFilteredTabs);
        return hasChanged ? newFilteredTabs : prevTabs;
      });
    }
  }, [userAccess, baseTabsConfig]);

  // Memoize settings-related paths for active state checking
  const settingsRelatedPaths = useMemo(() => ['/otherSetting', '/RcrSABYwQYwmdtcOTsJmxYbIhMOEnwOt', '/FormGenerator', '/AccessGroup'], []);

  // Check if current path is settings-related
  const isSettingsActive = useMemo(() => {
    return settingsRelatedPaths.includes(pathname);
  }, [pathname, settingsRelatedPaths]);

  // Navigation handlers
  const handleClickAccessGroup = useCallback(() => {
    navigate('/AccessGroup');
  }, [navigate]);

  const handleClickOtherSetting = useCallback(() => {
    navigate('/otherSetting');
  }, [navigate]);

  const handleClickFormGenerator = useCallback(() => {
    navigate('/FormGenerator');
  }, [navigate]);

  // Helper function to determine if a tab should be active
  const isTabActive = useCallback(
    (isActive, tabName) => {
      return isActive || (isSettingsActive && tabName === 'تنظیمات');
    },
    [isSettingsActive],
  );

  return (
    <section className='position-fixed z-10 relative shadow-md mr-4 mt-4 px-1 items-center flex flex-col justify-start bg-white w-64 h-[92vh] overflow-y-auto rounded-md pb-5 ring-2 ring-gray-100'>
      <div className='text-center text-xl'>
        <p className='font-bold my-4'>{GlobalTitle || 'منشور پروژه'}</p>
      </div>

      {/* Tab List */}
      <ul className='flex flex-col gap-2 px-2 pt-4 overflow-y-auto text-sm mb-2 rounded-md w-full'>
        {filteredTabs.map((tab) => {
          const isExternalLink = tab.path.startsWith('http');

          if (isExternalLink) {
            return (
              <a
                key={`${tab.name}-${tab.path}`}
                href={tab.path}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center px-3 py-3 rounded transition-all duration-300 hover:-translate-y-0.5 ease-out hover:shadow-md text-[13px] my-1 hover:bg-blue-100 text-gray-700'
              >
                {iconMap[tab.name]}
                <span className='whitespace-nowrap'>{tab.name}</span>
              </a>
            );
          }

          return (
            <NavLink
              key={`${tab.name}-${tab.path}`}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-md transition-all hover:-translate-y-0.5 ease-out hover:shadow-md text-[13px] my-1 ${
                  isTabActive(isActive, tab.name) ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 text-gray-700'
                }`
              }
            >
              {iconMap[tab.name]}
              <span className='whitespace-nowrap'>{tab.name}</span>
            </NavLink>
          );
        })}
      </ul>

      <hr className='border-gray-100 border-2 rounded-full w-[90%] my-4' />

      {/* Settings Buttons */}
      <div className='mt-1 p-2'>
        <div className='flex gap-2 justify-between items-center flex-wrap rounded-md'>
          <div className='w-full flex gap-4'>
            <button
              onClick={handleClickOtherSetting}
              className={`w-1/2 bg-blue-50 text-blue-700 ${
                pathname === '/otherSetting' ? 'bg-blue-500 text-white' : ''
              } hover:bg-blue-500 hover:text-white transition-all px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap duration-300 hover:-translate-y-0.5 hover:cursor-pointer`}
            >
              تنظیمات اصلی
            </button>
            <button
              onClick={handleClickAccessGroup}
              className={`w-1/2 bg-blue-50 ${
                pathname === '/AccessGroup' ? 'bg-blue-500 text-white' : ''
              } text-blue-700 hover:bg-blue-500 hover:text-white transition-all px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap duration-300 hover:-translate-y-0.5 hover:cursor-pointer`}
            >
              گروه های دسترسی
            </button>
          </div>
          <div className='w-full flex gap-4 mt-2'>
            <button
              onClick={handleClickFormGenerator}
              className={`flex-1 ${
                pathname === '/FormGenerator' ? 'bg-blue-500 text-white' : ''
              } bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white transition-all px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap duration-300 hover:-translate-y-0.5 hover:cursor-pointer`}
            >
              مدیریت فرم
            </button>
          </div>
        </div>
      </div>

      {/* Version Footer */}
      <div className='!min-w-full bottom-2 absolute flex items-center justify-center text-[0.8rem]'>
        <p className='px-6 py-1'>نسخه {appVersion || 'نامشخص'}</p>
      </div>
    </section>
  );
};

export default SettingRightSidebar;
