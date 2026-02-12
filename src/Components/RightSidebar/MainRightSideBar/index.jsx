import { NavLink } from 'react-router-dom';
import { RiSettingsFill, RiUserShared2Fill, RiFileList3Fill, RiFileEditFill } from 'react-icons/ri';
import { useGetAccessForSaveAndPermissions } from '../../../ApiHooks/CommonHooks/Users';
import Search from '../SideBarSearch';
import { Badge, Collapse } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { handelchangeSituationid } from '../../../features/ProjectChart/ProjectChartSlice';
import { useSearchProjectCharter } from '../../../ApiHooks/SearchProjectCharter';
import { useSearchParams } from 'react-router-dom';

const RightSidebar = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const situation = searchParams.get('situation');

  useEffect(() => {
    dispatch(handelchangeSituationid(situation ? Number(situation) : 1));
  }, [situation, dispatch]);

  const PRPURL = useSelector((state) => state.Auth.PRPURL);
  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);

  const Situationid = useSelector((state) => state.ProjectChart.Situationid);

  const { data: waitForAction } = useSearchProjectCharter('', '', 2);
  const { data: waitForAccept } = useSearchProjectCharter('', '', 3);
  const { data: userAccess, isLoading: userAccessLoading } = useGetAccessForSaveAndPermissions(true);

  // Memoize iconMap to prevent unnecessary re-renders
  const iconMap = useMemo(() => {
    const baseIconMap = {
      تنظیمات: <RiSettingsFill className='text-base ml-2' />,
      تاییدکنندگان: <RiUserShared2Fill className='text-base ml-2' />,
    };

    if (GlobalTitle) {
      baseIconMap[GlobalTitle] = <RiFileList3Fill className='text-base ml-2' />;
      // Fix: Use string concatenation instead of template literal
      baseIconMap['تغییرات ' + GlobalTitle] = <RiFileEditFill className='text-base ml-2' />;
    }

    return baseIconMap;
  }, [GlobalTitle]);

  // Memoize base tabs configuration
  const baseTabsConfig = useMemo(() => {
    const changingApproversName = GlobalTitle ? 'تغییرات ' + GlobalTitle : 'تغییرات منشور پروژه';

    return [
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
        name: changingApproversName,
        path: `/ChangingApprovers`,
        userAccess: false,
        label: 'AccessToProjectCharter',
      },
    ];
  }, [GlobalTitle, PRPURL]);

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

  const handleSituationChange = (situationId) => {
    dispatch(handelchangeSituationid(situationId));
  };

  return (
    <section className='position-fixed z-10 relative  mr-4 mt-4 px-1 items-center flex flex-col justify-start bg-white w-64 min-h-[92vh] ring-gray-200 overflow-y-auto rounded-2xl pb-5 ring-1 dark:bg-slate-800 dark:ring-gray-500 '>
      <div className='text-center flex justify-center items-center gap-2 flex-row-reverse text-xl'>
        <p className='font-bold my-4 dark:text-white' id='Title-text'>
          {GlobalTitle || 'منشور پروژه'}
        </p>
      </div>

      {/* Tab List */}
      <ul className='flex flex-col gap-2 px-2 pt-4 overflow-y-auto text-sm mb-2 rounded-md w-full'>
        {userAccessLoading ? (
          // Loading placeholder while API is fetching
          <>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className='flex items-center px-3 py-3 rounded-md animate-pulse bg-gray-200 text-[13px] my-1'>
                <div className='w-4 h-4 bg-gray-300 rounded ml-2'></div>
                <div className='h-4 bg-gray-300 rounded flex-1'></div>
              </div>
            ))}
          </>
        ) : filteredTabs.length > 0 ? (
          filteredTabs.map((tab) => {
            const isExternalLink = /^https?:\/\//.test(tab.path);

            if (isExternalLink) {
              return (
                <a
                  key={`${tab.name}-${tab.path}`}
                  href={tab.path}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center dark:hover:bg-slate-600  px-3 py-3 rounded transition-all duration-300 ease-out hover:shadow-md text-[13px] my-1 hover:bg-blue-100 hover:-translate-y-0.5 text-gray-700 dark:text-slate-100'
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
                  `flex items-center px-3 py-3 rounded-md transition-all hover:-translate-y-0.5 ease-out hover:shadow-md text-[13px] my-1 dark:text-slate-100 ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 dark:hover:bg-slate-600 text-gray-700'
                  }`
                }
              >
                {iconMap[tab.name]}
                <span className='whitespace-nowrap'>{tab.name}</span>
              </NavLink>
            );
          })
        ) : (
          // Empty state placeholder when no tabs are available
          <div className='flex flex-col items-center justify-center py-8 px-4 text-center text-gray-500'>
            <RiFileList3Fill className='text-3xl mb-2 text-gray-300' />
            <p className='text-sm'>هیچ تب در دسترس نیست</p>
            <p className='text-xs mt-1'>شما دسترسی لازم برای مشاهده این بخش را ندارید</p>
          </div>
        )}
      </ul>

      <hr className='border-gray-100 border-2 rounded-full w-[90%] my-2 custom-hide-on-small-height-500 dark:border-slate-600' />

      {/* Action Buttons */}
      <div className='p-2 custom-hide-on-small-height-500'>
        <div className='flex gap-2 justify-between items-center flex-wrap rounded-md h-full w-full'>
          <Badge count={waitForAction?.data?.length || 0} offset={[-110, 0]} className='hover:-translate-y-1 duration-300 !flex-1 !mt-2 transition-all'>
            <button
              onClick={() => handleSituationChange(2)}
              className={`!w-full cursor-pointer px-5 bg-blue-50 text-blue-700 hover:bg-blue-500 ${Situationid === 2 ? 'bg-blue-500 text-white' : ''
                } hover:text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-md text-center whitespace-nowrap`}
            >
              منتظر انجام
            </button>
          </Badge>
          <Badge count={waitForAccept?.data?.length || 0} offset={[-110, 0]} className='hover:-translate-y-1 duration-300 !flex-1 !mt-2 transition-all'>
            <button
              onClick={() => handleSituationChange(3)}
              className={`!w-full cursor-pointer px-5 bg-blue-50 text-blue-700 hover:bg-blue-500 ${Situationid === 3 ? 'bg-blue-500 text-white' : ''
                } hover:text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-md text-center whitespace-nowrap`}
            >
              منتظر تایید
            </button>
          </Badge>
          <button
            onClick={() => handleSituationChange(4)}
            className={`flex-1 cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-500 ${Situationid === 4 ? 'bg-blue-500 text-white' : ''
              } hover:text-white transition-all px-3 py-1.5 rounded-md text-xs font-medium shadow-md text-center whitespace-nowrap duration-300 hover:-translate-y-0.5`}
          >
            همه موارد
          </button>
          <button
            onClick={() => handleSituationChange(1)}
            className={`flex-1 cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-500 ${Situationid === 1 ? 'bg-blue-500 text-white' : ''
              } hover:text-white transition-all px-3 py-1.5 rounded-md text-xs font-medium shadow-md text-center whitespace-nowrap duration-300 hover:-translate-y-0.5`}
          >
            {GlobalTitle || 'منشور پروژه'} های من
          </button>
        </div>
      </div>

      <hr className='border-gray-100 border-2 rounded-full w-[90%] my-2 custom-hide-on-small-height-500 dark:border-slate-600' />

      <div className='w-full custom-hide-on-small-height-500'>
        <Search />
      </div>
    </section>
  );
};

export default RightSidebar;
