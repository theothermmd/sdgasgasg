import { useEffect, useState } from 'react';
import './index.css';
import { useGetUsers } from '../../ApiHooks/CommonHooks/Users';
import moment from 'moment-jalaali';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Popover, Input, message, Popconfirm } from 'antd';
import { handleChangeSituation, handleInitialazeData, handleProjectChartId } from '../../features/ProjectChart/ProjectChartSlice';
import { useGetProjectCharterById, useDeleteProjectCharterById, useGetprojectCharterId } from '../../ApiHooks/ProjectCharts';
import { setShowLeftSidebar } from '../../features/LeftSidebar/LeftSidebarSlice';
import { handleAddStageDetail, handleAddFlowAccess } from '../../features/WorkFlow/WorkFlowSlice';
import { GetWorkFlowAccess } from '../../ApiHooks/AccessGroup';
import { useStageDetails } from '../../ApiHooks/WorkFlow';
import { handleUserAccessOnProjectChart } from '../../features/ProjectChart/ProjectChartSlice';
import { handleAddProjectCharterId, handleAddTabCategorieId, handleAccrssgroupmode } from '../../features/Form';
import ProjectCharterHistory from './ProjectCharterHistory';
import { useGetTabCategoriesById } from '../../ApiHooks/OtherSetting/TabCheckList';
import Descriptions from './Descriptions';
import Attaches from './Attaches';
import toast, { Toaster } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const Field = ({ label, value }) => (
  <div>
    <label className='block text-sm font-sm  text-gray-700 mb-1'>{label}</label>
    <input type='text' value={value} disabled className='w-full px-2 py-1 border-gray-400 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed' />
  </div>
);

const ActionButton = ({ onClick, label, disabled, loading }) => (
  <Button
    type='text'
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    className='flex-1 hover:cursor-pointer !bg-blue-50 !text-blue-700 hover:bg-blue-500! hover:text-white!  px-4 py-1.5 rounded-md text-xs font-medium shadow-md text-center whitespace-nowrap'
  >
    {label}
  </Button>
);

const LeftSidebar = ({ isLoading }) => {
  //#region states
  const navigate = useNavigate();
  const [DataForShow, setDataForShow] = useState({
    title: '',
    managerName: '',
    startDate: '',
    endDate: '',
    cost: '',
  });
  const [stagesDetaile, setStagesDetaile] = useState([]);
  const [stages, setStages] = useState(<></>);
  const [userAccess, setUserAccess] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isModalOpenAttachment, setIsModalOpenAttachment] = useState(false);
  const [IsModalOpenHistory, setIsModalOpenHistory] = useState(false);
  const [PrintLoading, setPrintLoading] = useState(false);

  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);

  //#endregion
  //#region features
  const griddData = useSelector((state) => state.leftSidebar.summeryData);
  const loginUser = useSelector((state) => state.Auth.userInformation);
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const PRPURL = useSelector((state) => state.Auth.PRPURL);
  //#endregion
  //#region hooks
  const dispatch = useDispatch();
  const { data: UsersList } = useGetUsers();
  const { data: GetTabCategoriesById } = useGetTabCategoriesById(griddData?.TabCategoriesId);
  const { data: GetprojectCharterId } = useGetprojectCharterId(griddData?.Id);
  const { mutateAsync: getById } = useGetProjectCharterById();
  const { mutateAsync: Delete } = useDeleteProjectCharterById();
  const { mutate: getuserAccess } = GetWorkFlowAccess();
  const { mutateAsync: stageDetails } = useStageDetails();

  function containsAnyPart(searchString, targetString) {
    if (!searchString || !targetString) return false;

    const parts = targetString.split(',').map((part) => part.trim());
    return parts.some((part) => searchString.includes(part));
  }
  const queryclient = useQueryClient();

  //#endregion
  //#region functions
  const updateData = async () => {
    dispatch(handleAddTabCategorieId(griddData?.TabCategoriesId));
    dispatch(handleAddProjectCharterId(griddData?.Id));
    dispatch(handleProjectChartId(griddData?.Id));
    dispatch(handleUserAccessOnProjectChart(userAccess));
    dispatch(setShowLeftSidebar(false));
    dispatch(handleChangeSituation({ inEdit: true, inAdd: false }));
    const { data: result } = await getById(griddData?.Id);
    dispatch(handleInitialazeData(result));

    dispatch(
      handleAccrssgroupmode(
        containsAnyPart(loginUser?.UserName, stagesDetaile?.at(stagesDetaile?.at(0)?.WaitingStageOrder - 1)?.UserNames) && griddData?.InsertBy === loginUser?.Id,
      ),
    );
    navigate(`/create-Form`);
  };
  const updateview = async () => {
    dispatch(handleAddTabCategorieId(griddData?.TabCategoriesId));
    dispatch(handleAddProjectCharterId(griddData?.Id));
    dispatch(handleProjectChartId(griddData?.Id));
    dispatch(handleUserAccessOnProjectChart(userAccess));
    dispatch(setShowLeftSidebar(false));
    dispatch(handleChangeSituation({ inEdit: false, inAdd: false }));
    const { data: result } = await getById(griddData?.Id);
    dispatch(handleInitialazeData(result));

    dispatch(
      handleAccrssgroupmode(
        containsAnyPart(loginUser?.UserName, stagesDetaile?.at(stagesDetaile?.at(0)?.WaitingStageOrder - 1)?.UserNames) && griddData?.InsertBy === loginUser?.Id,
      ),
    );
    navigate(`/create-Form`);
  };
  const handleDelete = async () => {
    try {
      await Delete(griddData.Id);
      dispatch(setShowLeftSidebar(false));
      queryclient.invalidateQueries({ queryKey: ['SearchProjectCharter'] });
      toast.success('فرم با موفقیت حذف گردید.');
    } catch (error) {
      toast.error('حذف فرم با مشکل مواجه شد.');
    }
  };
  const showModal = () => {
    setIsModalOpen(true);
  };
  const showModalAttachment = () => {
    setIsModalOpenAttachment(true);
  };
  const showModalHistory = () => {
    setIsModalOpenHistory(true);
  };
  const handleCancelHistory = () => {
    setIsModalOpenHistory(false);

    setFileList([]);
  };
  const handleCancelAttachment = () => {
    setIsModalOpenAttachment(false);

    setFileList([]);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setDescription('');
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning('لطفاً توضیحات را وارد کنید.');
      return;
    }
  };
  const handleAttach = () => {
    if (fileList.length === 0) {
      message.warning('لطفاً یک فایل انتخاب کنید.');
      return;
    }

    // ارسال فایل‌ها
    console.log('فایل‌های انتخاب‌شده:', fileList);

    // TODO

    message.success('فایل با موفقیت پیوست شد.');
    handleCancelAttachment();
  };
  const handleStages = () => {
    if (userAccess?.AccessToEdit) {
      const checkEditflow = workflowActionAccess;
      if (checkEditflow?.IsEdit) {
        setUserAccess({ AccessToDelete: userAccess?.AccessToDelete, AccessToEdit: checkEditflow?.IsEdit });
      }
    }

    var sateges = [];
    let waitFor = stagesDetaile[0]?.WaitingStageOrder;
    console.log('stagesDetaile : ', stagesDetaile);

    for (let i = 0; i < stagesDetaile?.length; i++) {
      if (i === 0) {
        if (stagesDetaile[i]?.StageOrder === waitFor) {
          sateges.push(
            <>
              <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
                <div className='step first-step-waite'>{stagesDetaile[i]?.Title}</div>
              </Popover>
            </>,
          );
          continue;
        }
        if (stagesDetaile[i]?.StageOrder > waitFor) {
          sateges.push(
            <>
              <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
                <div className='step first-step'>{stagesDetaile[i]?.Title}</div>
              </Popover>
            </>,
          );
          continue;
        }
        sateges.push(
          <>
            <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
              <div className='step first-step-active'>{stagesDetaile[i]?.Title}</div>
            </Popover>
          </>,
        );
        continue;
      }
      if (i === stagesDetaile?.length - 1) {
        if (stagesDetaile[i]?.StageOrder === waitFor) {
          if (stagesDetaile[i]?.IsFinalApproved === true) {
            sateges.push(
              <>
                <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
                  <div className='step last-step-active'>{stagesDetaile[i]?.Title}</div>
                </Popover>
              </>,
            );
            continue;
          }
          sateges.push(
            <>
              <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
                <div className='step last-step-waite'>{stagesDetaile[i]?.Title}</div>
              </Popover>
            </>,
          );
          continue;
        }
        if (stagesDetaile[i]?.StageOrder > waitFor) {
          sateges.push(
            <>
              <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
                <div className='step last-step'>{stagesDetaile[i]?.Title}</div>
              </Popover>
            </>,
          );
          continue;
        }
      }
      if (stagesDetaile[i]?.StageOrder === waitFor) {
        sateges.push(
          <>
            <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
              <div className='step middle-step-waite'>{stagesDetaile[i]?.Title}</div>
            </Popover>
          </>,
        );
        continue;
      }
      if (stagesDetaile[i]?.StageOrder > waitFor) {
        sateges.push(
          <>
            <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
              <div className='step middle-step'>{stagesDetaile[i]?.Title}</div>
            </Popover>
          </>,
        );
        continue;
      }
      sateges.push(
        <>
          <Popover placement='right' title={'کاربر این سطح :'} content={`${stagesDetaile[i]?.UserNames === null ? 'تعیین نشده' : stagesDetaile[i]?.UserNames}`}>
            <div className='step middle-step-active'>{stagesDetaile[i]?.Title}</div>
          </Popover>
        </>,
      );
    }
    setStages(sateges);
  };
  const PrintForm = () => {
    console.log('griddData : ', griddData);

    if (!GetTabCategoriesById?.data?.OfficeOnlineDocumentId) {
      toast.error('سندی برای این نوع فرم ثبت نشده است.');
      return;
    }
    setPrintLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${PRPURL}/_vti_bin/ProposalSharePoint/ProposalWebService.asmx/CreateDocumentTemplate`, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = () => {
      if (xhr.status === 200) {
        const jsonObject = JSON.parse(xhr.response);
        if (jsonObject !== '00000000-0000-0000-0000-000000000000') {
          window.open(`${PRPURL}/_layouts/15/WopiFrame2.aspx?sourcedoc=%7B${jsonObject.d}%7D`);
          setPrintLoading(false);
        } else {
          toast.error('این فرم نسخه ای برای چاپ ندارد.');
          setPrintLoading(false);
        }
      }
    };
    xhr.onerror = (e) => {
      setPrintLoading(false);
      console.log(e);
    };
    const data = {
      fileFullName: griddData?.Title,
      templateFileNameId: GetTabCategoriesById?.data?.OfficeOnlineDocumentId,
      Checklists: JSON.stringify(GetprojectCharterId?.data),
      documentTitle: '',
      StageTitles: [''],
      Proposal: {
        ProposalTitle: griddData.Title,
        ProjectType: griddData.ProjectTypeId,
        ProjectPortfolio: griddData.ProjectPortfolioId,
        ProjectStartDate: griddData.ProjectStartDate,
        ProjectEndDate: griddData.ProjectEndDate,
        CharterCode: griddData.CharterCode,
        TrusteeUnit: griddData.TrusteeUnitId,
        ProjectManager: griddData.ProjectManagerId,
        SuggestedImplementationMethod: griddData.SuggestedImplementationMethodId,
        DurationDays: griddData.DurationDays,
        ProjectCost: 'isist',
        Currency: 'isist',
        GeneralDescription: griddData.GeneralDescription,
        ProjectExpert: griddData.ProjectExpertId,
        ProjectSponsor: griddData.ProjectSponsorId,
        ExternalCompany: griddData.ExternalCompanyId,
        RelatedCharterProjects: griddData.RelatedCharterProjects,
        LocationType: griddData.LocationTypeId,
        Location: griddData.LocationId,
        Address: griddData.Address,
        InsertBy: griddData.InsertBy,
        TabCategoriesId: griddData.TabCategoriesId,
        ExitType: 'isist',
        Criterion: 'islist',
        ProjectPortfolioTitle: griddData.ProjectPortfolioTitle,
        TrusteeUnitTitle: griddData.TrusteeUnitTitle,
        SuggestedImplementationMethodTitle: griddData.SuggestedImplementationMethodTitle,
        LocationTypeTitle: griddData.LocationTypeTitle,
        LocationTitle: griddData.LocationTitle,
      },
    };
    xhr.send(JSON.stringify(data));
  };

  //#endregion
  //#region effects
  useEffect(() => {
    if (griddData) {
      setDataForShow({
        title: griddData?.Title,
        managerName: griddData?.ProjectManagerId ? UsersList?.data?.find((x) => x.Id === griddData?.ProjectManagerId)?.UserName : '',
        startDate: griddData?.ProjectStartDate ? moment(griddData?.ProjectStartDate).format('jYYYY/jMM/jDD') : '',
        endDate: griddData?.ProjectEndDate ? moment(griddData?.ProjectEndDate).format('jYYYY/jMM/jDD') : '',
        cost: griddData?.ProjectCost,
      });
    }
  }, [griddData, UsersList?.data]);

  useEffect(() => {
    if (griddData && loginUser) {
      const obj = {
        id: loginUser?.Id,
        entityId: griddData?.Id,
      };

      getuserAccess(obj, {
        onSuccess: (data) => {
          dispatch(handleAddFlowAccess(data.data));

          setUserAccess(data.data);
        },
      });
    }
  }, [griddData, loginUser, dispatch]);

  useEffect(() => {
    if (griddData) {
      const getStageDetaile = async () => {
        const { data: result } = await stageDetails(griddData?.Id);
        if (result) {
          console.log(result);
          setStagesDetaile(result);
          dispatch(handleAddStageDetail(result));
        }
      };
      getStageDetaile();
    }
  }, [griddData]);
  useEffect(() => {
    if (stagesDetaile) {
      handleStages();
    }
  }, [stagesDetaile, userAccess]);
  //#endregion

  return (
    <div id='LeftSidebarProposal' className={`position-fixed z-[9998]  mt-4  flex bg-white w-full h-[92vh] overflow-y-auto rounded-2xl ring-1 ring-gray-200`}>
      {/* ستون اطلاعات منشور (سمت راست) */}
      <div className='w-full max-w-sm p-5 overflow-y-auto'>
        {isLoading ? (
          <div className='text-center text-gray-500 mt-10'>خالیه</div>
        ) : (
          <>
            {/* فیلدها */}
            <div className='space-y-4'>
              <Field label={`عنوان ${GlobalTitle}`} value={DataForShow?.title} />
              <Field label='نام مدیر' value={DataForShow?.managerName} />
              <Field label='تاریخ شروع' value={DataForShow?.startDate} />
              <Field label='تاریخ پایان' value={DataForShow?.endDate} />
              <Field label='هزینه اجرای پروژه' value={DataForShow?.cost} />
            </div>

            {/* دکمه‌ها */}
            <div className='mt-6 pt-4 border-t border-gray-200  gap-2 grid grid-cols-2'>
              {userAccess.AccessToEdit ? <ActionButton label={'ویرایش'} onClick={updateData} /> : <ActionButton label={'مشاهده'} onClick={updateview} />}
              {userAccess.AccessToDelete ? <ActionButton label={'حذف'} onClick={handleDelete} /> : <ActionButton label={'حذف'} disabled={true} />}

              <ActionButton onClick={showModalAttachment} label={'پیوست'} />

              <ActionButton onClick={showModal} label={'توضیحات'} />

              <ActionButton onClick={showModalHistory} label={'تاریخچه'} />

              <ActionButton onClick={PrintForm} label={'چاپ'} loading={PrintLoading} />
            </div>
          </>
        )}
      </div>
      <div className='w-1 h-[98%] my-auto bg-gray-100  rounded-full' />

      <div className='flex-1 p-5 text-gray-400 flex items-start justify-center text-sm '>
        <div className='flow-steps'>
          {stages.length === 0
            ? [1, 2, 3, 4, 5].map((item) => <div key={item} className='flex items-center p-[2.05rem] rounded-full animate-pulse bg-gray-200 text-[10px] my-1'></div>)
            : stages}
        </div>
      </div>
      <Modal
        title='ثبت توضیحات'
        open={isModalOpen}
        onCancel={handleCancel}
        width={1000}
        footer={[
          <Button key='cancel' onClick={handleCancel}>
            بستن
          </Button>,
        ]}
      >
        <Input.TextArea rows={4} placeholder='توضیحات خود را وارد کنید...' value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: '10px' }} />
        <Descriptions charterId={griddData?.Id} text={description} setText={setDescription} />
      </Modal>
      <Modal
        title='پیوست فایل'
        open={isModalOpenAttachment}
        onCancel={handleCancelAttachment}
        width={1000}
        footer={[
          <Button key='cancel' onClick={handleCancelAttachment}>
            انصراف
          </Button>,
        ]}
      >
        <Attaches charterId={griddData?.Id} />
      </Modal>
      <Modal
        title='تاریخچه'
        open={IsModalOpenHistory}
        onCancel={handleCancelHistory}
        width={1000}
        footer={[
          <Button key='cancel' onClick={handleCancelHistory}>
            انصراف
          </Button>,
        ]}
      >
        <ProjectCharterHistory ProjectCharterId={griddData?.Id} />
      </Modal>
      <Toaster position='top-center' reverseOrder={false} />
    </div>
  );
};

export default LeftSidebar;
