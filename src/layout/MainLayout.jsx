import React, { useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { ConfigProvider } from 'antd';
import faIR from 'antd/es/locale/fa_IR';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';

// Components
import Header from '../Components/Header';
import RightSidebar from '../Components/RightSidebar/MainRightSideBar';

import CreateProposal from '../Components/RightSidebar/CreateProposal';
import SettingRightSidebar from '../Components/RightSidebar/Setting';
import LeftSidebar from '../Components/LeftSidebar';

// Redux
import { handleAddToken, handleUserInformation, handleApi, handlePRPURL, handleOPRPLibraryName, handlePRPCompanyName } from '../features/Auth';
import { setShowLeftSidebar } from '../features/LeftSidebar/LeftSidebarSlice';
import { handleGlobalTitle } from '../features/GlobalSetting';

// Hooks
import { GetTokenUser } from '../ApiHooks/GetToken';
import { useGetUserBufullQualifyName } from '../ApiHooks/CommonHooks/Users';
import { useGetProposalGlobalTitle } from '../ApiHooks/OtherSetting/ProposalGlobalTitle';
import { useGetAccessForSaveAndPermissions } from '../ApiHooks/CommonHooks/Users';
import { handlepermissionsections } from '../features/Auth';
import { handleResetFlowAccess } from '../features/WorkFlow/WorkFlowSlice';

const MainLayout = ({ children }) => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const tokenAuth = useSelector((state) => state.Auth?.token);
  const showLeftSidebar = useSelector((state) => state.leftSidebar.showLeftSidebar);
  const getProposalGlobalTitleHook = useGetProposalGlobalTitle(tokenAuth);
  const mainUrl = import.meta.env.VITE_MAIN_URL;

  const { data: GetAccessForSaveAndPermissions } = useGetAccessForSaveAndPermissions(tokenAuth);

  useEffect(() => {
    if (GetAccessForSaveAndPermissions?.data) {
      dispatch(handlepermissionsections(GetAccessForSaveAndPermissions.data));
    }
  }, [GetAccessForSaveAndPermissions, dispatch]);

  // --- Token ---
  const GetToken = useCallback(() => {
    $.ajax({
      type: 'POST',
      async: false,
      dataType: 'json',
      url: '/_vti_bin/ProposalSharePoint/ProposalWebService.asmx/GetToken',
      contentType: 'application/json; charset=utf-8',
      success: (data) => {
        dispatch(handleAddToken(data?.d.Token));
        if (mainUrl === '/_layouts/15/ProposalSharePoint/dist/index.aspx') {
          dispatch(handleApi(data?.d.API));
        } else {
          dispatch(handleApi(data?.d.NEWAPI));
        }
        dispatch(handlePRPURL(data?.d.PRPURL));
        dispatch(handleOPRPLibraryName(data?.d.PRPLibraryName));
        dispatch(handlePRPCompanyName(data?.d.PRPCompanyName));
      },
    });
  }, [dispatch]);

  const { mutateAsync: getUserData } = useGetUserBufullQualifyName();

  const fetchUserInfo = useCallback(async () => {
    const { data: userData } = await getUserData();
    if (userData) dispatch(handleUserInformation(userData));
  }, [dispatch, getUserData]);

  // --- Environment ---
  if (import.meta.env.DEV) {
    const { data } = GetTokenUser('epm\\epmtest1', 'PRP', tokenAuth);

    useEffect(() => {
      if (data) {
        dispatch(handleAddToken(data?.data));
        fetchUserInfo().then(() => {
          dispatch(handlePRPCompanyName('سازمان یار'));
        });
      }
    }, [data, dispatch, fetchUserInfo]);
  } else {
    useEffect(() => {
      GetToken();
    }, [GetToken]);

    useEffect(() => {
      if (tokenAuth) fetchUserInfo();
    }, [tokenAuth, fetchUserInfo]);
  }

  useEffect(() => {
    let isMounted = true;

    const fetchGlobalTitle = async () => {
      if (!tokenAuth) return;

      try {
        const result = await getProposalGlobalTitleHook.refetch();

        const titles = result?.data?.data;
        if (isMounted && Array.isArray(titles) && titles.length > 0) {
          dispatch(handleGlobalTitle(titles[0].GlobalTitle));
        }
      } catch (error) {
        console.error('Error fetching global title:', error);
      }
    };

    fetchGlobalTitle();

    return () => {
      isMounted = false;
    };
  }, [tokenAuth, dispatch, getProposalGlobalTitleHook, GetToken]);

  // --- Close Sidebar ---
  const handleClickOutside = useCallback(
    (event) => {
      const target = event.target.closest('[id]');
      if (target && target.tagName !== 'INPUT' && !['TableProposal', 'LeftSidebarProposal'].includes(target.id)) {
        dispatch(setShowLeftSidebar(false));

      }
    },
    [dispatch],
  );

  // --- Right Sidebar Routes ---
  const rightSidebarRoutes = {
    '/': <RightSidebar />,
    '/Main': <RightSidebar />,
    '/create-Form': <CreateProposal />,
    '/create-proposal-Custom': <CreateProposal />,
    '/otherSetting': <SettingRightSidebar />,
    '/AccessGroup': <SettingRightSidebar />,
    '/ChangingApprovers': <SettingRightSidebar />,
    '/FormGenerator': <SettingRightSidebar />,
    '/RcrSABYwQYwmdtcOTsJmxYbIhMOEnwOt': <SettingRightSidebar />,
  };

  const renderRightSidebar = () => {
    if (pathname.startsWith('/FormDetails')) return <SettingRightSidebar />;
    return rightSidebarRoutes[pathname] || null;
  };

  // --- JSX ---
  return (
    <ConfigProvider locale={faIR}>
      {tokenAuth && (
        <div className='h-screen overflow-hidden bg-[#f7f6fb] dark:bg-slate-900' onClick={handleClickOutside}>
          <Header />
          <div className='flex relative pb-5 mb-4'>
            <div>{renderRightSidebar()}</div>
            <div className='shadow-xl contentBase !rounded-2xl ring-1 ring-gray-200 min-h-full dark:bg-slate-800! dark:ring-gray-500'>{children}</div>
            {showLeftSidebar && (
              <div className='w-[320px] shrink-0 pl-4'>
                <LeftSidebar />
              </div>
            )}
          </div>
        </div>
      )}
    </ConfigProvider>
  );
};

export default MainLayout;
