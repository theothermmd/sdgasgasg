import { useEffect, useState, useMemo, useCallback } from 'react';
import { Input, Button, message, Divider, Select, TreeSelect } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { useSelector, useDispatch } from 'react-redux';
import { useAddProjectcharter, useGetAllWithprojectcharterId, useUpdateProjectcharter } from '../ApiHooks/OtherSetting/TabCheckList';
import { useGetAllProjectTypeWithAccessGroupEffect } from '../ApiHooks/OtherSetting/ProjectType';
import { useGetAllProjectPortfolioWithAccessGroupEffect } from '../ApiHooks/OtherSetting/ProjectPortfolio';
import { useGetAllTrusteeUnitWithAccessGroupEffect } from '../ApiHooks/OtherSetting/TrusteeUnit';
import { useEditProjectCharter } from '../ApiHooks/ProjectCharts';
import { handleAddProjectCharterId } from '../features/Form';
import { CalendarOutlined } from '@ant-design/icons';

import moment from 'moment-jalaali';
import toast from 'react-hot-toast';

const { Option } = Select;
const { TreeNode } = TreeSelect;

function DaysToReadableInput({ days }) {
  const diffText = useMemo(() => {
    if (days == null || days === 0) return '0';
    if (days === -1) return 'تاریخ شروع نمی‌تواند از پایان بزرگتر باشد';

    let totalDays = Math.abs(Number(days));

    let years = Math.floor(totalDays / 365);
    totalDays %= 365;

    let months = Math.floor(totalDays / 30);
    totalDays %= 30;

    let parts = [];
    if (years > 0) parts.push(`${years} سال`);
    if (months > 0) parts.push(`${months} ماه`);
    if (totalDays > 0) parts.push(`${totalDays} روز`);

    if (parts.length === 0) parts.push('۰ روز');

    return parts.join(' و ');
  }, [days]);

  const hasError = days === -1;

  return (
    <input
      type='text'
      value={diffText}
      disabled
      className={`border px-2 rounded py-1 w-full h-fit ${hasError ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-100'}`}
    />
  );
}

const persianToEnglishNumbers = (str) => {
  if (!str) return '';
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return str.replace(/[۰-۹]/g, (match) => englishNumbers[persianNumbers.indexOf(match)]);
};

const ProjectInformation = () => {
  const UserId = useSelector((state) => state.Auth.userInformation.Id);
  const accessgroupmode = useSelector((state) => state.Form.accrssgroupmode);
  const dispatch = useDispatch();
  const { mutate: AddProjectcharter } = useAddProjectcharter();
  const { mutate: UpdateProjectcharter } = useUpdateProjectcharter();
  const { mutate: EditProjectCharter } = useEditProjectCharter();

  const { data: GetProjectTypeWithAccessGroupEffect } = useGetAllProjectTypeWithAccessGroupEffect(UserId, accessgroupmode ? 1 : 3, accessgroupmode ? 1 : 3);
  const { data: GetProjectPortfolioWithAccessGroupEffect } = useGetAllProjectPortfolioWithAccessGroupEffect(UserId, accessgroupmode ? 5 : 7, accessgroupmode ? 1 : 3);
  const { data: GetDepartmentUnitWithAccessGroupEffect } = useGetAllTrusteeUnitWithAccessGroupEffect(UserId, accessgroupmode ? 9 : 11, accessgroupmode ? 1 : 3);
  const [DateDifferent, setDateDifferent] = useState(0);

  // تابع محاسبه تفاوت تاریخ با useCallback برای بهینه‌سازی
  const calculateDateDifference = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) {
      setDateDifferent(0);
      return;
    }

    try {
      const start = persianToEnglishNumbers(startDate);
      const end = persianToEnglishNumbers(endDate);

      const startMoment = moment(start, 'jYYYY/jMM/jDD');
      const endMoment = moment(end, 'jYYYY/jMM/jDD');

      if (!startMoment.isValid() || !endMoment.isValid()) {
        setDateDifferent(0);
        return;
      }
      if (startMoment.isAfter(endMoment)) {
        setDateDifferent(-1);
        toast.error('تاریخ شروع نمی‌تواند از تاریخ پایان بزرگتر باشد');
        return;
      }

      const different = endMoment.diff(startMoment, 'days');
      setDateDifferent(different);
    } catch (error) {
      console.error('Error calculating date difference:', error);
      setDateDifferent(0);
    }
  }, []);

  const ProjectCharterId = useSelector((state) => state.Form?.ProjectCharterId);
  const TabCategorieId = useSelector((state) => state.Form?.TabCategorieId);
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);
  const FormName = useSelector((state) => state.Form?.FormName);

  const IsEdit = workflowActionAccess.IsEdit;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      projectName: { id: '', value: '' },
      projectCode: { id: '', value: '' },
      projectStartDate: { id: '', value: '' },
      projectEndDate: { id: '', value: '' },
      projectType: { id: '', value: '' },
      projectPortfolio: { id: '', value: '' },
      DepartmentUnit: { id: '', value: '' },
    },
  });

  const { data: ProjectCharterData } = useGetAllWithprojectcharterId(ProjectCharterId, '0E247A7F-3E54-490A-91F9-8F83816A504C');

  // Watch all form fields to check if any are empty
  const formData = watch();

  // Function to check if all required fields are filled
  const isFormValid = () => {
    const { projectName, projectCode, projectStartDate, projectEndDate, projectType, projectPortfolio } = formData;
    return projectName?.value && projectType?.value && projectPortfolio?.value;
  };

  const startDate = watch('projectStartDate');
  const endDate = watch('projectEndDate');

  // استفاده از useEffect برای محاسبه خودکار تفاوت تاریخ
  useEffect(() => {
    calculateDateDifference(startDate?.value, endDate?.value);
  }, [startDate?.value, endDate?.value, calculateDateDifference]);

  useEffect(() => {
    if (ProjectCharterData && ProjectCharterId) {
      const data = ProjectCharterData.data;
      setValue('projectName', { id: data[0].Id, value: data[0].Value });
      setValue('projectCode', { id: data[1].Id, value: data[1].Value });
      setValue('projectStartDate', { id: data[2].Id, value: data[2].Value });
      setValue('projectEndDate', { id: data[3].Id, value: data[3].Value });

      // Set project type value (assuming it's the 5th item in the array)
      if (data[4]) {
        setValue('projectType', { id: data[4].Id, value: data[4].Value });
      }
      // Set project portfolio value (assuming it's the 6th item in the array)
      if (data[5]) {
        setValue('projectPortfolio', { id: data[5].Id, value: data[5].Value });
      }
      if (data[6]) {
        setValue('DepartmentUnit', { id: data[6].Id, value: data[6].Value });
      }

      // محاسبه تفاوت تاریخ پس از لود داده‌ها
      setTimeout(() => {
        calculateDateDifference(data[2]?.Value, data[3]?.Value);
      }, 100);
    }
  }, [ProjectCharterData, setValue, ProjectCharterId, calculateDateDifference]);

  // Function to render TreeSelect nodes recursively
  const renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.Children && item.Children.length > 0) {
        return (
          <TreeNode title={item.Title} value={item.Id} key={item.Id}>
            {renderTreeNodes(item.Children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.Title} value={item.Id} key={item.Id} />;
    });
  };

  const SendData = (data) => {
    console.log('Form Values:', data);

    if (!ProjectCharterId) {
      AddProjectcharter(
        {
          projectcharterdata: [
            {
              Value: data.projectName.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: '25C72ADA-5E4A-455F-9529-D795548FA6C4',
            },
            {
              Value: data.projectCode.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: '1DCFC3FD-0C81-4CF0-BA30-3741E7A77C44',
            },
            {
              Value: data.projectStartDate.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: 'FCF18920-59EE-430F-A160-D20EA9B7DABA',
            },
            {
              Value: data.projectEndDate.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: '1BA61B73-A2E0-4EDB-AD09-3C0E2AF9CD06',
            },
            {
              Value: data.projectType.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: 'D1B2DF65-A328-4D96-92A1-E7EEF42F225A',
            },
            {
              Value: data.projectPortfolio.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: '4304BB43-842E-4CCB-A795-A48EA8B7EFBB',
            },
            {
              Value: data.DepartmentUnit.value,
              TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
              TabFormId: 'd8e37a35-9b93-4e0c-a723-4a6c83a5c15f',
            },
          ],
          TabCategorieID: TabCategorieId,
        },
        {
          onSuccess: (datas) => {
            dispatch(handleAddProjectCharterId(datas.projectCharterId));
            console.log(datas.projectCharterId);
            message.success('فرم با موفقیت ایجاد شد.');
          },
        },
      );
      return;
    } else {
      const payload = [
        {
          Id: data.projectName.id,
          Value: data.projectName.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: '25C72ADA-5E4A-455F-9529-D795548FA6C4',
          ProjectCharterId: ProjectCharterId,
        },
        {
          Id: data.projectCode.id,
          Value: data.projectCode.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: '1DCFC3FD-0C81-4CF0-BA30-3741E7A77C44',
          ProjectCharterId: ProjectCharterId,
        },
        {
          Id: data.projectStartDate.id,
          Value: data.projectStartDate.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: 'FCF18920-59EE-430F-A160-D20EA9B7DABA',
          ProjectCharterId: ProjectCharterId,
        },
        {
          Id: data.projectEndDate.id,
          Value: data.projectEndDate.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: '1BA61B73-A2E0-4EDB-AD09-3C0E2AF9CD06',
          ProjectCharterId: ProjectCharterId,
        },
        {
          Id: data.projectType.id,
          Value: data.projectType.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: 'D1B2DF65-A328-4D96-92A1-E7EEF42F225A',
          ProjectCharterId: ProjectCharterId,
        },
        {
          Id: data.projectPortfolio.id,
          Value: data.projectPortfolio.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: '4304BB43-842E-4CCB-A795-A48EA8B7EFBB',
          ProjectCharterId: ProjectCharterId,
        },
        {
          Id: data.DepartmentUnit.id,
          Value: data.DepartmentUnit.value,
          TabCheckListId: '0E247A7F-3E54-490A-91F9-8F83816A504C',
          TabFormId: 'd8e37a35-9b93-4e0c-a723-4a6c83a5c15f',
          ProjectCharterId: ProjectCharterId,
        },
      ];
      UpdateProjectcharter(payload, {
        onSuccess: () => {
          console.log('Updated successfully:');
          message.success('اطلاعات با موفقیت به‌روزرسانی شد.');
        },
      });
    }
  };

  const inputStyle = { width: '100%', height: 30, marginTop: 8 };

  return (
    <div className='w-full p-4'>
      <h2 className='text-xl font-bold my-4'>اطلاعات کلی فرم</h2>
      <Divider className=' bg-gray-100 !mb-10' />
      <form onSubmit={handleSubmit(SendData)} className='w-full flex flex-col gap-4'>
        <div className='flex gap-4'>
          {/* Project Name */}
          <div className='flex-1 flex flex-col'>
            <label>نام {FormName} :</label>
            <Controller
              name='projectName'
              control={control}
              rules={{ required: `نام ${FormName} اجباری است` }}
              render={({ field }) => <Input value={field.value.value} onChange={(e) => field.onChange({ ...field.value, value: e.target.value })} style={inputStyle} />}
            />
            {errors.projectName && <p style={{ color: 'red' }}>{errors.projectName.message}</p>}
          </div>

          {/* Project Code */}
          <div className='flex-1 flex flex-col'>
            <label>کد {FormName} :</label>
            <Controller
              name='projectCode'
              control={control}
              render={({ field }) => <Input value={field.value.value} onChange={(e) => field.onChange({ ...field.value, value: e.target.value })} style={inputStyle} />}
            />
            {errors.projectCode && <p style={{ color: 'red' }}>{errors.projectCode.message}</p>}
          </div>

          {/* Project Start Date */}
          <div className='flex-1 flex flex-col'>
            <label>تاریخ شروع :</label>
            <Controller
              name='projectStartDate'
              control={control}
              render={({ field }) => {
                const hasDateError = DateDifferent === -1;
                return (
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    format='YYYY/MM/DD'
                    value={field.value.value || ''}
                    onChange={(val) => {
                      const newValue = val ? val.format('YYYY/MM/DD') : '';
                      field.onChange({ ...field.value, value: newValue });
                    }}
                    style={inputStyle}
                    render={(value, openCalendar) => (
                      <div className='relative'>
                        <input
                          readOnly
                          value={value}
                          onClick={openCalendar}
                          className={`w-full border rounded px-3 py-2 ${hasDateError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          style={inputStyle}
                        />
                        <CalendarOutlined className={`absolute left-3 top-5.5 -translate-y-1/2 cursor-pointer ${hasDateError ? '!text-red-500' : '!text-gray-500'}`} />
                      </div>
                    )}
                  />
                );
              }}
            />
            {errors.projectStartDate && <p style={{ color: 'red' }}>{errors.projectStartDate.message}</p>}
          </div>

          {/* Project End Date */}
          <div className='flex-1 flex flex-col'>
            <label>تاریخ پایان :</label>
            <Controller
              name='projectEndDate'
              control={control}
              render={({ field }) => {
                const hasDateError = DateDifferent === -1;
                return (
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    format='YYYY/MM/DD'
                    value={field.value.value || ''}
                    onChange={(val) => {
                      const newValue = val ? val.format('YYYY/MM/DD') : '';
                      field.onChange({ ...field.value, value: newValue });
                    }}
                    style={inputStyle}
                    render={(value, openCalendar) => (
                      <div className='relative'>
                        <input
                          readOnly
                          value={value}
                          onClick={openCalendar}
                          className={`w-full border rounded px-3 py-2 ${hasDateError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          style={inputStyle}
                        />
                        <CalendarOutlined className={`absolute left-3 top-5.5 -translate-y-1/2 cursor-pointer ${hasDateError ? '!text-red-500' : '!text-gray-500'}`} />
                      </div>
                    )}
                  />
                );
              }}
            />
            {errors.projectEndDate && <p style={{ color: 'red' }}>{errors.projectEndDate.message}</p>}
          </div>
        </div>

        <div className='flex gap-4'>
          {/* Project Type Dropdown */}
          <div className='flex-1 flex flex-col'>
            <label>نوع پروژه</label>
            <Controller
              name='projectType'
              control={control}
              rules={{ required: 'نوع پروژه اجباری است' }}
              render={({ field }) => (
                <Select
                  value={field.value.value || undefined}
                  onChange={(value) => field.onChange({ ...field.value, value })}
                  style={inputStyle}
                  placeholder={`نوع پروژه را انتخاب کنید`}
                  allowClear
                >
                  {GetProjectTypeWithAccessGroupEffect?.data?.map((item) => (
                    <Option key={item.Id} value={item.Id}>
                      {item.Title}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.projectType && <p style={{ color: 'red' }}>{errors.projectType.message}</p>}
          </div>

          {/* Project Portfolio TreeSelect */}
          <div className='flex-1 flex flex-col'>
            <label>سبد طراحی/پروژه</label>
            <Controller
              name='projectPortfolio'
              control={control}
              rules={{ required: 'سبد طراحی/پروژه اجباری است' }}
              render={({ field }) => (
                <TreeSelect
                  value={field.value.value || undefined}
                  onChange={(value) => field.onChange({ ...field.value, value })}
                  style={inputStyle}
                  placeholder='سبد طراحی/پروژه را انتخاب کنید...'
                  allowClear
                  treeDefaultExpandAll
                  showSearch
                >
                  {GetProjectPortfolioWithAccessGroupEffect?.data && renderTreeNodes(GetProjectPortfolioWithAccessGroupEffect.data)}
                </TreeSelect>
              )}
            />
            {errors.projectPortfolio && <p style={{ color: 'red' }}>{errors.projectPortfolio.message}</p>}
          </div>

          {/* Department Unit TreeSelect */}
          <div className='flex-1 flex flex-col'>
            <label>واحد سازمانی</label>
            <Controller
              name='DepartmentUnit'
              control={control}
              rules={{ required: 'واحد سازمانی اجباری است' }}
              render={({ field }) => (
                <TreeSelect
                  value={field.value.value || undefined}
                  onChange={(value) => field.onChange({ ...field.value, value })}
                  style={inputStyle}
                  placeholder='واحد سازمانی را انتخاب کنید'
                  allowClear
                  treeDefaultExpandAll
                  showSearch
                >
                  {GetDepartmentUnitWithAccessGroupEffect?.data && renderTreeNodes(GetDepartmentUnitWithAccessGroupEffect.data)}
                </TreeSelect>
              )}
            />
            {errors.DepartmentUnit && <p style={{ color: 'red' }}>{errors.DepartmentUnit.message}</p>}
          </div>

          <div className='flex-1 flex flex-col items-center justify-end'>
            <p className='self-start pb-1.5'>طول مدت :</p>
            <DaysToReadableInput days={DateDifferent} />
          </div>
        </div>

        {/* Submit Button at bottom */}
        <div className='mt-10 mx-auto'>
          <Button type='primary' htmlType='submit' size='large' disabled={!isFormValid()} hidden={!IsEdit && IsEdit !== undefined}>
            {ProjectCharterId ? 'ویرایش اطلاعات' : 'ثبت اطلاعات'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectInformation;
