import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { handleProjectChartId, handleInitialazeData, handleUserAccessOnProjectChart, handleChangeSituation } from '../../../features/ProjectChart/ProjectChartSlice';
import { useApprove, useReject, useAssign, useReturn, useSend } from '../../../ApiHooks/WorkFlow';
import { handleAddProjectCharterId, handleAddTabCategorieId, handleAddTabCheckListId } from '../../../features/Form';
import { handleResetFlowAccess } from '../../../features/WorkFlow/WorkFlowSlice';
import AssignButton from '../AssignButton';
const ActionButtons = () => {
  //#region useState
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [buttons, setbuttons] = useState(<></>);
  const [api, contextHolder] = notification.useNotification();
  //#endregion
  //#region redux
  const projectchartId = useSelector((state) => state.Form.ProjectCharterId);
  const validation = useSelector((state) => state.ProjectChart.projectChartValidation);
  const situation = useSelector((state) => state.ProjectChart.Situation);
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const StageDetail = useSelector((state) => state.WorkFlow.stageDetail);
  //const UserAccess = useSelector((state) => state.ProjectChart.userAccessOnProjectChart);
  //#endregion
  //#region service
  const { mutateAsync: approve } = useApprove();
  const { mutateAsync: reject } = useReject();
  const { mutateAsync: assign } = useAssign();
  const { mutateAsync: returns } = useReturn();
  const { mutateAsync: send } = useSend();

  //#endregion
  const handleCancel = () => {
    dispatch(handleProjectChartId(null));
    dispatch(handleInitialazeData(null));
    dispatch(handleUserAccessOnProjectChart({}));
    dispatch(handleChangeSituation({ inEdit: false, inAdd: false }));
    dispatch(handleAddProjectCharterId(null));
    dispatch(handleAddTabCategorieId(null));
    dispatch(handleAddTabCheckListId(null));
    dispatch(handleResetFlowAccess());
    navigate('/');
  };
  const CheckValidations = () => {
    if (projectchartId === null) {
      api.error({
        message: `ابتدا منشور را ثبت کنید`,
      });
      return false;
    }
    if (!validation?.validMilestone) {
      api.error({
        message: 'ثبت مایلستون ها اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validDeliverable) {
      api.error({
        message: 'ثبت اقلام قابل تحویل اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validProjectGoal) {
      api.error({
        message: 'ثبت اهداف منشور اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validProjectRequirement) {
      api.error({
        message: 'ثبت الزامات کلی اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validProjectRisk) {
      api.error({
        message: 'ثبت ریسک  های کلی اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validProjectSchedule) {
      api.error({
        message: 'ثبت زمان بندی کلان اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validProjectStakeholder) {
      api.error({
        message: 'ثبت ذی نفعان اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    if (!validation?.validOrgMember) {
      api.error({
        message: 'ثبت چارت اجرایی پروژه اجباری هست',
        description: 'بدون این داده امکان ارسال و یا تایید ممکن نیست',
      });
      return false;
    }
    return true;
  };
  const handleSend = async () => {
    try {
      let { data: result, status } = await send([projectchartId]);
      if (status === 200) {
        if (result.isSuccess) {
          api.success({ message: result.message });
          setTimeout(() => {
            handleCancel();
            navigate('/');
          }, 500);
          // handleCancel();
          // navigate('/');
          return;
        }
        api.error({
          message: result.message,
        });
        return;
      }
    } catch (error) {
      console.log(error);
      api.error(`خطا در ارتباط با سرور`);
    }
  };
  const handleApprove = async () => {
    try {
      if (!CheckValidations) {
        return;
      }
      const { data, status } = await approve(projectchartId);
      if (status === 200) {
        if (data.isSuccess === true) {
          api.success({
            message: data.message,
          });
          setTimeout(() => {
            handleCancel();
            navigate('/');
          }, 500);
          // handleCancel();
          // navigate('/');
          return;
        }
        api.error({
          message: data.message,
        });
        return;
      }
    } catch (error) {
      api.error({
        message: error.message,
        description: 'خطا در ارتباط با سرور',
      });
    }
  };
  const handleReject = async () => {
    try {
      const { data, status } = await reject(projectchartId);
      if (status === 200) {
        if (data.isSuccess === true) {
          api.success({
            message: data.message,
          });
          setTimeout(() => {
            handleCancel();
            navigate('/');
          }, 500);
          // handleCancel();
          // navigate('/');
          return;
        }
        api.error({
          message: data.message,
        });
        return;
      }
    } catch (error) {
      api.error({
        message: error.message,
        description: 'خطا در ارتباط با سرور',
      });
    }
  };
  const handleAssign = async (users) => {
    try {
      let obj = {
        id: projectchartId,
        users: users,
      };
      const { data, status } = await assign(obj);
      if (status === 200) {
        if (data.isSuccess === true) {
          api.success({
            message: data.message,
          });
          setTimeout(() => {
            handleCancel();
            navigate('/');
          }, 500);
          // handleCancel();
          // navigate('/');
          return;
        }
        api.error({
          message: data.message,
        });
        return;
      }
    } catch (error) {
      api.error({
        message: error.message,
        description: 'خطا در ارتباط با سرور',
      });
    }
  };
  const handleReturn = async () => {
    try {
      const { data, status } = await returns(projectchartId);
      if (status === 200) {
        if (data.isSuccess === true) {
          api.success({
            message: data.message,
          });
          setTimeout(() => {
            handleCancel();
            navigate('/');
          }, 500);
          // handleCancel();
          // navigate('/');
          return;
        }
        api.error({
          message: data.message,
        });
        return;
      }
    } catch (error) {
      api.error({
        message: error.message,
        description: 'خطا در ارتباط با سرور',
      });
    }
  };
  const handleButton = (scenario) => {
    console.log('scenario : ', scenario);

    switch (scenario) {
      case 'accept-reject-assign-cancel':
        setbuttons(
          <>
            <Link style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                onClick={handleApprove}
                className='flex-1 bg-blue-50  transition-all cursor-pointer hover:-translate-y-0.5 ease-out hover:shadow-md   text-blue-700 hover:bg-blue-500 hover:text-white  px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                تایید
              </button>
            </Link>
            <Link onClick={handleReject} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md text-blue-700 hover:bg-blue-500 hover:text-white  px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                رد
              </button>
            </Link>
            <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                انصراف
              </button>
            </Link>
            <Link style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <AssignButton send={handleAssign} />
            </Link>
          </>,
        );
        break;
      case 'accept-reject-cancel':
        setbuttons(
          <>
            <Link style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                onClick={handleApprove}
                className='flex-1 bg-blue-50  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md text-blue-700 hover:bg-blue-500 hover:text-white  px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                تایید
              </button>
            </Link>

            <Link onClick={handleReject} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                رد
              </button>
            </Link>
            <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                انصراف
              </button>
            </Link>
          </>,
        );
        break;
      case 'assign-return-cancel':
        setbuttons(
          <>
            <Link style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <AssignButton send={handleAssign} />
            </Link>

            <Link style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                onClick={handleReturn}
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                بازگشت
              </button>
            </Link>
            <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap'
                style={{ width: '100%' }}
              >
                انصراف
              </button>
            </Link>
          </>,
        );
        break;
      case 'return-cancel':
        setbuttons(
          <>
            <Link onClick={handleReturn} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap '
                style={{ width: '100%' }}
              >
                بازگشت
              </button>
            </Link>

            <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap '
                style={{ width: '100%' }}
              >
                انصراف
              </button>
            </Link>
          </>,
        );
        break;
      case 'cancel':
        setbuttons(
          <>
            <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <button
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-4 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap  '
                style={{ width: '100%' }}
              >
                انصراف
              </button>
            </Link>
          </>,
        );
        break;
      case 'send-cancel':
        setbuttons(
          <>
            <Link
              // to={`/`}
              onClick={handleSend}
              style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}
            >
              <button
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap '
                style={{ width: '100%' }}
              >
                ارسال
              </button>
            </Link>
            <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit', width: '45%' }}>
              <button
                className='flex-1 bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md text-center whitespace-nowrap '
                style={{ width: '100%' }}
              >
                انصراف
              </button>
            </Link>
          </>,
        );
        break;
      default:
        setbuttons(
          <>
            <div className='d-flex gap-2 w-100 mb-1 mx-3  transition-all cursor-pointer  hover:-translate-y-0.5 ease-out hover:shadow-md'>
              <div className='col'>
                <Link to={`//`} onClick={handleCancel} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <button className='btn btn-outline-primary fw-bold'>انصراف</button>
                </Link>
              </div>
            </div>
          </>,
        );
        break;
    }
  };
  useEffect(() => {
    var accessOfUser = workflowActionAccess;
    var stage = StageDetail[0]?.WaitingStageOrder;

    if (stage === 0 || stage === 1) {
      handleButton('send-cancel');
      return;
    }
    if (stage !== 0 || stage !== 1) {
      if (accessOfUser?.Assigned === false && accessOfUser?.CanAssign === false) {
        handleButton('accept-reject-cancel');
        return;
      }
      if (accessOfUser?.Assigned === false && accessOfUser?.CanAssign === true) {
        handleButton('accept-reject-assign-cancel');
        return;
      }
      if (accessOfUser?.Assigned === true && accessOfUser?.CanAssign === true) {
        handleButton('assign-return-cancel');
        return;
      }
      if (accessOfUser?.Assigned === true && accessOfUser?.CanAssign === false) {
        handleButton('return-cancel');
        return;
      }
      handleButton('cancel');
      return;
    }
    return;
  }, [situation, workflowActionAccess, StageDetail, projectchartId, validation]);
  return (
    <>
      {contextHolder}
      {buttons}
    </>
  );
};
export default ActionButtons;
