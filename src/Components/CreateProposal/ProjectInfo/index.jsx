import React, { useState, useEffect, useMemo, use } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { Input, Select, Card, TreeSelect } from 'antd';
import DatePicker from 'react-multi-date-picker';
import moment from 'moment-jalaali';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { RiFileList3Fill } from 'react-icons/ri';
import toast, { Toaster } from 'react-hot-toast';
import { useGetProjectType } from '../../../ApiHooks/OtherSetting/ProjectType';
import { useGetProjectPortfolio } from '../../../ApiHooks/OtherSetting/ProjectPortfolio';
import { useGetProposedImplementation } from '../../../ApiHooks/OtherSetting/ProposedImplementation';
import { useGetTrustee } from '../../../ApiHooks/CommonHooks/Trustee';
import { useGetUsers } from '../../../ApiHooks/CommonHooks/Users';
import { useGetExternalCompanies } from '../../../ApiHooks/OtherSetting/ExternalCompanies';
import { useCreateProjectCharter, useEditProjectCharter } from '../../../ApiHooks/ProjectCharts';
import { useGetProjectCharter } from '../../../ApiHooks/ProjectCharts';
import { useGetLocationType } from '../../../ApiHooks/OtherSetting/LocationType';
import { useGetProvince } from '../../../ApiHooks/OtherSetting/Province';
import { useGetCurrency } from '../../../ApiHooks/OtherSetting/Currency';
import { useGetRequiredFields } from '../../../ApiHooks/OtherSetting/EssentialFields';
import { useGetProjectExitType } from '../../../ApiHooks/OtherSetting/ProjectExitType';
import { useGetProjectSponsor } from '../../../ApiHooks/OtherSetting/ProjectSponsor';
import { handleAddProjectCharterId } from '../../../features/Form';
import { useDispatch, useSelector } from 'react-redux';
import { handleProjectChartId, handleInitialazeData, handleProjectChartValidation, handleChangeSituation } from '../../../features/ProjectChart/ProjectChartSlice';
const { TextArea } = Input;
const { Option } = Select;
import { useAddListTabFormValue, useAddListTableFormInside, useEditTabFormValue, useEditTableFormInsideValue } from '../../../ApiHooks/OtherSetting/TabCheckList';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';

import { useCreateProjectCost, useUpdateProjectCost, useGetallProjectCost, useDeleteProjectCost } from '../../../ApiHooks/ProjectCost';
import { useCreateProjectExitCriteria, useDeleteProjectExitCriteria, useUpdateProjectExitCriteria, useGetallProjectExitCriteria } from '../../../ApiHooks/ProjectExitCriteria';

import { Table, InputNumber, Button, Form } from 'antd'; // Import Ant Design components
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating IDs

import { useGetAllProjectTypeWithAccessGroupEffect } from '../../../ApiHooks/OtherSetting/ProjectType';
import { useGetAllProjectPortfolioWithAccessGroupEffect } from '../../../ApiHooks/OtherSetting/ProjectPortfolio';
import { useGetAllTrusteeUnitWithAccessGroupEffect } from '../../../ApiHooks/OtherSetting/TrusteeUnit';
import { useGetProjectCharterById, useDeleteProjectCharterById } from '../../../ApiHooks/ProjectCharts';
function DaysToReadableInput({ days }) {
  const diffText = useMemo(() => {
    if (days == null) return '';

    let totalDays = Number(days);

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

  return <input type='text' value={diffText} disabled className='border border-gray-200 bg-gray-100 px-2 rounded py-1 w-full h-fit' />;
}

const ProjectInfoForm = ({ serverConfigs }) => {
  // Better loading state check
  if (!serverConfigs || serverConfigs.length === 0) {
    return <></>;
  }
  // Add additional safety checks
  const hasValidStructure = serverConfigs[0]?.TabFormDtos && serverConfigs[0].TabFormDtos.length > 0;

  if (!hasValidStructure) {
    return <div>Invalid form configuration</div>;
  }
  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  const { mutateAsync: getById } = useGetProjectCharterById();
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      const { data: result } = await getById(projectchartId);
      dispatch(handleInitialazeData(result));
    };

    fetchData();
  }, [projectchartId, dispatch]);
  const initData = useSelector((state) => state.ProjectChart.InitData);

  const situation = useSelector((state) => state.ProjectChart.Situation);
  const validation = useSelector((state) => state.ProjectChart.projectChartValidation);
  const UserId = useSelector((state) => state.Auth.userInformation.Id);
  const accessgroupmode = useSelector((state) => state.Form.accrssgroupmode);

  const ProjectCharterId = useSelector((state) => state.Form.ProjectCharterId);
  const { mutate: AddListTabFormValue } = useAddListTabFormValue();
  const { mutate: AddListTableFormInside } = useAddListTableFormInside();
  const { mutate: EditListTabFormValue } = useEditTabFormValue();
  const { mutate: EditListTableFormInside } = useEditTableFormInsideValue();
  // const { data: AllCurrency } = useGetCurrency();
  const { mutate: CreateProjectCost } = useCreateProjectCost();
  const { mutate: UpdateProjectCost } = useUpdateProjectCost();
  const { data: GetallProjectCost } = useGetallProjectCost(projectchartId);
  const { mutate: DeleteProjectCost } = useDeleteProjectCost();
  const { mutate: CreateProjectExitCriteria } = useCreateProjectExitCriteria();
  const { mutate: DeleteProjectExitCriteria } = useDeleteProjectExitCriteria();
  const { mutate: UpdateProjectExitCriteria } = useUpdateProjectExitCriteria();
  const { data: GetallProjectExitCriteria, refetch: refetchGetallProjectExitCriteria } = useGetallProjectExitCriteria(projectchartId);

  //#region state
  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm();
  const [projectTypeData, setProjectTypeData] = useState([]);
  const [projectPortfolioData, setProjectPortfolioData] = useState([]);
  const [proposedImplementationData, setProposedImplementationData] = useState([]);
  const [projectChartData, setProjectChartData] = useState([]);
  const [trusteeData, setTrusteeData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [ExternalCompaniesData, setExternalCompaniesData] = useState([]);
  const [LocationTypeData, setLocationTypeData] = useState([]);
  const [ProvinceData, setProvinceData] = useState([]);
  const [CurrencyData, setCurrencyData] = useState([]);
  const [CurrencyDatafiltered, setCurrencyDatafiltered] = useState([]);
  const [ExitTypeData, setExitTypeData] = useState([]);
  const [ProjectSponsorData, setProjectSponsorData] = useState([]);
  const [DateDifferent, setDateDifferent] = useState(0);
  const [cost, setCost] = useState('');
  const [ProjectExchangeRate, setProjectExchangeRate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CurrencyData[0]?.Id || '');
  const [costsData, setCostsData] = useState([]);
  const [criterionInput, setCriterionInput] = useState('');
  const [selectedExitType, setSelectedExitType] = useState(null);
  const [exitCriteriaData, setExitCriteriaData] = useState([]);
  const [editCriterionInput, setEditCriterionInput] = useState(''); // Temporarily holds the value being edited
  const [editSelectedExitType, setEditSelectedExitType] = useState(null); // Temporarily holds the selected type being edited
  // --- Add State for Editing ---
  const [editingCriterionId, setEditingCriterionId] = useState(null); // Tracks the ID of the item being edited
  const [editingCriterionValue, setEditingCriterionValue] = useState('');
  const [editingCostId, setEditingCostId] = useState(null);
  const [editingCostValue, setEditingCostValue] = useState('');
  const [editingCostCurrency, setEditingCostCurrency] = useState('');

  //#endregion

  //#region features

  //#endregion

  //#region hooks
  const { data: ProjectTypeList } = useGetAllProjectTypeWithAccessGroupEffect(UserId, accessgroupmode ? 1 : 3, accessgroupmode ? 1 : 3);
  const { data: ProjectPortfolioList } = useGetAllProjectPortfolioWithAccessGroupEffect(UserId, accessgroupmode ? 5 : 7, accessgroupmode ? 1 : 3);
  const { data: TrusteeList } = useGetAllTrusteeUnitWithAccessGroupEffect(UserId, accessgroupmode ? 9 : 11, accessgroupmode ? 1 : 3);

  // const { data: ProjectTypeList } = useGetProjectType();
  // const { data: ProjectPortfolioList } = useGetProjectPortfolio();
  const { data: ProposedList } = useGetProposedImplementation();
  // const { data: TrusteeList } = useGetTrustee();
  const { data: UsersList } = useGetUsers();
  const { data: ProjectSponsorList } = useGetProjectSponsor();
  const { data: LocationTypeList } = useGetLocationType();
  const { data: ProvinceList } = useGetProvince();
  const { data: CurrencyList } = useGetCurrency();
  const { data: ExitTypeList } = useGetProjectExitType();
  const { data: ExternalCompaniesList } = useGetExternalCompanies();
  const { data: requiredFields } = useGetRequiredFields();
  const { data: ProjectChartList } = useGetProjectCharter();
  const { mutateAsync: Create } = useCreateProjectCharter();
  const { mutateAsync: Update } = useEditProjectCharter();
  useEffect(() => {
    if (GetallProjectExitCriteria) {
      setExitCriteriaData(GetallProjectExitCriteria?.data);
    }
  }, [GetallProjectExitCriteria]);
  useEffect(() => {
    if (GetallProjectCost?.data && CurrencyList?.data) {
      // Filter out currencies that are already used in costs (and not marked as deleted)
      const activeCosts = GetallProjectCost.data.filter((cost) => !cost.isDeleted);
      const CurrencyDatafilter = CurrencyList.data.filter((currency) => !activeCosts.some((cost) => cost.CurrencyId === currency.Id));

      console.log('CurrencyDatafilter : ', CurrencyDatafilter);

      setCurrencyData(TransForToSelectData(CurrencyDatafilter, 'Title', 'Id'));
      setCostsData(GetallProjectCost.data);
    }
  }, [GetallProjectCost, CurrencyList]);
  //#endregion
  const TabCategorieId = useSelector((state) => state.Form.TabCategorieId);

  //#region functions
  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };
  const handleAddExitCriterion = () => {
    // Validation
    if (!criterionInput.trim()) {
      toast.error('معیار خروج نمی‌تواند خالی باشد.');
      return;
    }

    if (!selectedExitType) {
      toast.error('نوع خروج باید انتخاب شود.');
      return;
    }

    const newCriterion = {
      tempId: uuidv4(), // Temporary ID for local tracking
      ExitTypeId: selectedExitType,
      Criterion: criterionInput.trim(),
      ProjectCharterId: initData?.Id || null,
    };

    // No project charter yet - add to local state for later saving
    setExitCriteriaData((prev) => [...prev, newCriterion]);

    // Reset inputs
    setCriterionInput('');
    setSelectedExitType(null);
  };

  // Separate function for handling updates (this replaces the mixed logic in your original function)
  const handleUpdateExitCriterion = (recordId) => {
    if (!editCriterionInput.trim()) {
      toast.error('معیار خروج نمی‌تواند خالی باشد.');
      return;
    }

    if (!editSelectedExitType) {
      toast.error('نوع خروج باید انتخاب شود.');
      return;
    }

    // Find the item to update
    const itemToUpdate = exitCriteriaData.find((item) => (item.Id || item.tempId) === recordId);

    if (!itemToUpdate) {
      toast.error('آیتم برای به‌روزرسانی یافت نشد.');
      handleCancelEdit();
      return;
    }

    // Check if anything actually changed
    if (itemToUpdate.Criterion === editCriterionInput.trim() && itemToUpdate.ExitTypeId === editSelectedExitType) {
      // No changes, just cancel edit mode
      handleCancelEdit();
      return;
    }

    const updatedRecord = {
      ...itemToUpdate,
      Criterion: editCriterionInput.trim(),
      ExitTypeId: editSelectedExitType,
    };

    if (itemToUpdate.Id) {
      // Server-side item - call update API
      UpdateProjectExitCriteria(updatedRecord, {
        onSuccess: () => {
          refetchGetallProjectExitCriteria();
          toast.success('معیار با موفقیت به‌روزرسانی شد');
          handleCancelEdit();
        },
        onError: (error) => {
          console.error('Error updating criterion:', error);
          toast.error('خطا در به‌روزرسانی معیار');
        },
      });
    } else {
      // Local item - update local state
      const updatedData = exitCriteriaData.map((item) => (item.tempId === recordId ? updatedRecord : item));
      setExitCriteriaData(updatedData);
      toast.success('معیار به‌روزرسانی شد (موقت)');
      handleCancelEdit();
    }
  };
  // --- Function to initiate editing ---
  const handleEditCriterion = (record) => {
    setEditingCriterionId(record.Id || record.tempId); // Use Id if from server, tempId if local
    setEditCriterionInput(record.Criterion);
    // Find the corresponding option object for the Select component
    const exitTypeOption = ExitTypeData.find((option) => option.value === record.ExitTypeId);
    setEditSelectedExitType(record.ExitTypeId); // Set the value directly
    // Optional: Scroll to the input fields or highlight them
  };

  // --- Function to cancel editing ---
  const handleCancelEdit = () => {
    setEditingCriterionId(null);
    setEditCriterionInput('');
    setEditSelectedExitType(null);
    // Reset main inputs if they were populated during edit start
    // setCriterionInput('');
    // setSelectedExitType(null);
  };
  const TransFormToTreeSelectData = (array) => {
    const transformData = (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      const transformItem = (item) => {
        const newItem = {
          lable: item.Title,
          title: item.Title,
          value: item.Id,
          parentKey: item.ParentId,
        };
        if (item.Children && Array.isArray(item.Children)) {
          newItem.children = item.Children.map((child, childIndex) => transformItem(child, childIndex));
        }
        return newItem;
      };
      return data.map(transformItem);
    };

    const transformedData = transformData(array);

    return transformedData;
  };
  const persianToEnglishNumbers = (str) => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return str.replace(/[۰-۹]/g, (match) => englishNumbers[persianNumbers.indexOf(match)]);
  };
  const onSubmit = async (data) => {
    if (projectchartId === null) {
      dispatch(handleChangeSituation({ inEdit: false, inAdd: true }));
    } else {
      dispatch(handleChangeSituation({ inEdit: true, inAdd: false }));
    }
    //
    data = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value]));

    let Newdata = {
      Title: data?.title,
      PreparedAt: data?.charterDate !== null ? moment(persianToEnglishNumbers(data?.charterDate), 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null,
      ProjectStartDate: data?.startDate !== null ? moment(persianToEnglishNumbers(data?.startDate), 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null,
      ProjectEndDate: data?.endDate !== null ? moment(persianToEnglishNumbers(data?.endDate), 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null,
      ProjectTypeId: data?.projectType !== null ? data?.projectType?.value : null,
      ProjectPortfolioId: data?.portfolio !== null ? data?.portfolio?.value : null,
      CharterCode: data?.charterCode,
      TrusteeUnitId: data?.trustee !== null ? data?.trustee?.value : null,
      ProjectManagerId: data?.projectManager !== null ? data?.projectManager?.value : null,
      SuggestedImplementationMethodId: data?.proposedImplementation !== null ? data?.proposedImplementation?.value : null,
      DurationDays: data?.durationDays,
      ProjectCost: data?.projectCost,
      GeneralDescription: data?.description,
      ProjectExpertId: data?.projectExpert !== null ? data?.projectExpert?.value : null,
      CurrencyId: data?.currency !== null ? data?.currency?.value : null,
      ProjectSponsorId: data?.projectSponsor !== null ? data?.projectSponsor?.value : null,
      ExternalCompanyId: data?.externalCompanies !== null ? data?.externalCompanies?.value : null,
      RelatedCharterProjects: data?.projectChartData !== null ? data?.projectChartData?.value : null,
      LocationTypeId: data?.locationtype !== null ? data?.locationtype?.value : null,
      LocationId: data?.province !== null ? data?.province?.value : null,
      Address: data?.address,
      ExitTypeId: data?.exitType !== null ? data?.exitType?.value : null,
      Criterion: data?.Criterion,
      TabCategoriesId: TabCategorieId,
    };
    if (situation.inAdd) {
      try {
        if (projectchartId !== null) {
          Newdata.Id = projectchartId;

          const { data } = await Update(Newdata);
          if (data.isSuccess) {
            toast.success('با موفقیت ویرایش شد');
            return;
          }
        }

        const { data } = await Create(Newdata);
        if (data.isSuccess) {
          toast.success('با موفقیت ثبت شد');
          dispatch(handleProjectChartId(data.Id));
          dispatch(handleInitialazeData(Newdata));
          // navigate("/");
        }
      } catch (e) {
        e;
      }
    }

    if (situation.inEdit) {
      try {
        Newdata.Id = initData.Id;
        const { data } = await Update(Newdata);
        if (data.isSuccess) {
          toast.success('با موفقیت ویرایش شد');
          // navigate("/");
        }
      } catch (e) {
        e;
      }
    }
  };
  const handleSubmitBoth = (dynamicData) => {
    handleSubmit((values) => {
      let data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === undefined ? null : value]));
      const costsDataWithCharterId = costsData.map((item) => {
        let mx = item;
        delete mx.tempId;
        return { ...mx, ProjectCharterId: situation.inAdd ? null : initData?.Id };
        // Will be set after creation
        // Or if you manage costs separately, you might not need this here
      });
      // console.log('Costs Data to Submit:', costsDataWithCharterId); // For debugging

      const finalExitCriteriaData = exitCriteriaData.map((item) => ({
        ExitTypeId: item.ExitTypeId,
        Criterion: item.Criterion,
        ProjectCharterId: situation.inAdd ? null : initData?.Id,
        // The actual ProjectCharterId will be set after creation or taken from initData for edit
      }));
      // console.log('Exit Criteria Data to Submit:', finalExitCriteriaData); // For debugging

      let Newdata = {
        Title: data?.title,
        PreparedAt: data?.charterDate !== null ? moment(persianToEnglishNumbers(data?.charterDate), 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null,
        ProjectStartDate: data?.startDate !== null ? moment(persianToEnglishNumbers(data?.startDate), 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null,
        ProjectEndDate: data?.endDate !== null ? moment(persianToEnglishNumbers(data?.endDate), 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null,
        ProjectTypeId: data?.projectType !== null ? data?.projectType?.value : null,
        ProjectPortfolioId: data?.portfolio !== null ? data?.portfolio?.value : null,
        CharterCode: data?.charterCode,
        TrusteeUnitId: data?.trustee !== null ? data?.trustee?.value : null,
        ProjectManagerId: data?.projectManager !== null ? data?.projectManager?.value : null,
        SuggestedImplementationMethodId: data?.proposedImplementation !== null ? data?.proposedImplementation?.value : null,
        DurationDays: data?.durationDays,
        ProjectCost: data?.projectCost,
        GeneralDescription: data?.description,
        ProjectExpertId: data?.projectExpert !== null ? data?.projectExpert?.value : null,
        CurrencyId: data?.currency !== null ? data?.currency?.value : null,
        ProjectSponsorId: data?.projectSponsor !== null ? data?.projectSponsor?.value : null,
        ExternalCompanyId: data?.externalCompanies !== null ? data?.externalCompanies?.value : null,
        RelatedCharterProjects: data?.projectChartData !== null ? data?.projectChartData?.value : null,
        LocationTypeId: data?.locationtype !== null ? data?.locationtype?.value : null,
        LocationId: data?.province !== null ? data?.province?.value : null,
        Address: data?.address,
        ExitTypeId: data?.exitType !== null ? data?.exitType?.value : null,
        Criterion: data?.Criterion,
        TabCategoriesId: TabCategorieId,
        Costs: costsDataWithCharterId,
        ExitCriteria: finalExitCriteriaData,
      };

      const ProjectStartDate = new Date(Newdata.ProjectStartDate);
      const ProjectEndDate = new Date(Newdata.ProjectEndDate);
      if (ProjectStartDate > ProjectEndDate) {
        toast.error('تاریخ پایان پروژه نمیتواند کوچک تر از تاریخ شروع باشد.');
        return;
      }

      const costsDataforupdate = costsData.filter((value) => value['Id'] && !value['isDeleted']);
      const costsDataforadd = costsData.filter((value) => !value['Id'] && !value['isDeleted']);
      const costsDatafordelete = costsData.filter((value) => value['Id'] && value['isDeleted']);

      const exitCriteriaDataforupdate = exitCriteriaData.filter((value) => value['Id'] && !value['isDeleted']);
      const exitCriteriaDataforadd = exitCriteriaData.filter((value) => !value['Id'] && !value['isDeleted']);
      const exitCriteriaDatafordelete = exitCriteriaData.filter((value) => value['Id'] && value['isDeleted']);

      if (situation.inAdd && projectchartId === null) {
        Create(
          { ...Newdata, TabCategoriesId: TabCategorieId },
          {
            onSuccess: (data) => {
              const formDataWithCharterId = dynamicData.dynamicFormData.map((value) => {
                let m = { ...value };
                m.ProjectCharterId = data.data.Id;
                return m;
              });

              const tableDataWithCharterId = dynamicData.dynamicTableData.map((value) => {
                let m = { ...value };
                m.ProjectCharterId = data.data.Id;
                return m;
              });

              AddListTabFormValue(formDataWithCharterId, {
                onSuccess: () => {
                  AddListTableFormInside(tableDataWithCharterId, {
                    onSuccess: () => {
                      dispatch(handleAddProjectCharterId(data.data.Id));
                      dispatch(handleProjectChartId(data.data.Id));
                      toast.success('فرم با موفقیت ساخته شد.');
                    },
                  });
                },
              });
            },
          },
        );
      } else if (situation.inEdit || projectchartId !== null) {
        delete Newdata.Costs;
        delete Newdata.ExitCriteria;
        Update(
          { ...Newdata, Id: initData.Id, TabCategoriesId: TabCategorieId },
          {
            onSuccess: (data) => {
              const formDataWithCharterId = dynamicData.dynamicFormData.map((value) => {
                let m = { ...value };
                m.ProjectCharterId = initData.Id;
                m.IsChoosen = false;
                return m;
              });

              const tableDataWithCharterId = dynamicData.dynamicTableData.map((value) => {
                let m = { ...value };
                m.ProjectCharterId = initData.Id;
                return m;
              });

              costsDataforadd.forEach((value) => {
                CreateProjectCost(value);
              });
              costsDataforupdate.forEach((value) => {
                UpdateProjectCost(value);
              });
              costsDatafordelete.forEach((value) => {
                DeleteProjectCost(value.Id);
              });

              exitCriteriaDataforadd.forEach((value) => {
                CreateProjectExitCriteria(value);
              });
              exitCriteriaDataforupdate.forEach((value) => {
                UpdateProjectExitCriteria(value);
              });
              exitCriteriaDatafordelete.forEach((value) => {
                DeleteProjectExitCriteria(value.Id);
              });

              EditListTabFormValue(formDataWithCharterId, {
                onSuccess: () => {
                  EditListTableFormInside(tableDataWithCharterId, {
                    onSuccess: () => {
                      dispatch(handleAddProjectCharterId(data.data.Id));
                      dispatch(handleProjectChartId(data.data.Id));

                      toast.success('فرم با موفقیت بروزرسانی شد.');
                    },
                  });
                },
              });
            },
          },
        );
      }
    })();
  };
  const DateChange = (date1, date2) => {
    if (!date1 || !date2) {
      return;
    }
    const different = moment(date2, 'jYYYY/jMM/jDD').diff(moment(date1, 'jYYYY/jMM/jDD'), 'days');
    setDateDifferent(different);
  };
  //#endregion

  //#region useEffects
  useEffect(() => {
    if (ProjectTypeList?.data) {
      if (projectTypeData.length === 0) {
        setProjectTypeData(TransForToSelectData(ProjectTypeList?.data, 'Title', 'Id'));
      }
    }
  }, [ProjectTypeList?.data]);
  useEffect(() => {
    if (ProjectPortfolioList?.data) {
      if (projectPortfolioData.length === 0) {
        setProjectPortfolioData(TransFormToTreeSelectData(ProjectPortfolioList?.data));
      }
    }
  }, [ProjectPortfolioList?.data]);
  useEffect(() => {
    if (ProposedList?.data) {
      if (proposedImplementationData.length === 0) {
        setProposedImplementationData(TransForToSelectData(ProposedList?.data, 'Title', 'Id'));
      }
    }
  }, [ProposedList?.data]);
  useEffect(() => {
    if (TrusteeList?.data) {
      if (trusteeData.length === 0) {
        setTrusteeData(TransForToSelectData(TrusteeList?.data, 'Title', 'Id'));
      }
    }
  }, [TrusteeList?.data]);
  useEffect(() => {
    if (UsersList?.data) {
      if (usersData.length === 0) {
        setUsersData(TransForToSelectData(UsersList?.data, 'UserName', 'Id'));
      }
    }
  }, [UsersList?.data]);
  useEffect(() => {
    if (ProjectChartList?.data) {
      if (projectChartData.length === 0) {
        setProjectChartData(TransForToSelectData(ProjectChartList?.data, 'Title', 'Id'));
      }
    }
  }, [ProjectChartList?.data]);
  useEffect(() => {
    if (ExternalCompaniesList?.data) {
      if (ExternalCompaniesData.length === 0) {
        setExternalCompaniesData(TransForToSelectData(ExternalCompaniesList?.data, 'Title', 'Id'));
      }
    }
  }, [ExternalCompaniesList?.data]);
  useEffect(() => {
    if (LocationTypeList?.data) {
      if (LocationTypeData.length === 0) {
        setLocationTypeData(TransForToSelectData(LocationTypeList?.data, 'Title', 'Id'));
      }
    }
  }, [LocationTypeList?.data]);
  useEffect(() => {
    if (ProvinceList?.data) {
      if (ProvinceData.length === 0) {
        setProvinceData(TransFormToTreeSelectData(ProvinceList?.data));
      }
    }
  }, [ProvinceList?.data]);
  useEffect(() => {
    if (CurrencyList?.data) {
      if (CurrencyData.length === 0) {
        setCurrencyData(TransForToSelectData(CurrencyList?.data, 'Title', 'Id'));
        setCurrencyDatafiltered(TransForToSelectData(CurrencyList?.data, 'Title', 'Id'));
      }
    }
  }, [CurrencyList?.data]);
  useEffect(() => {
    if (ExitTypeList?.data) {
      if (ExitTypeData.length === 0) {
        setExitTypeData(TransForToSelectData(ExitTypeList?.data, 'Title', 'Id'));
      }
    }
  }, [ExitTypeList?.data]);
  useEffect(() => {
    if (ProjectSponsorList?.data) {
      if (ProjectSponsorData.length === 0) {
        setProjectSponsorData(TransForToSelectData(ProjectSponsorList?.data, 'Title', 'Id'));
      }
    }
  }, [ProjectSponsorList?.data]);
  useEffect(() => {
    if (initData !== null) {
      reset({
        title: initData?.Title,
        charterDate: initData?.PreparedAt ? moment(initData?.PreparedAt).format('jYYYY/jMM/jDD') : null,
        startDate: initData?.ProjectStartDate ? moment(initData?.ProjectStartDate).format('jYYYY/jMM/jDD') : null,
        endDate: initData?.ProjectEndDate ? moment(initData?.ProjectEndDate).format('jYYYY/jMM/jDD') : null,
        projectType: initData?.ProjectTypeId ? { label: projectTypeData?.find((x) => x.value === initData?.ProjectTypeId)?.label, value: initData?.ProjectTypeId } : null,
        charterCode: initData?.CharterCode,
        trustee: initData?.TrusteeUnitId ? { label: trusteeData?.find((x) => x.value === initData.TrusteeUnitId)?.label, value: initData?.TrusteeUnitId } : null,
        projectManager: initData?.ProjectManagerId ? { label: usersData?.find((x) => x.value === initData?.ProjectManagerId)?.label, value: initData?.ProjectManagerId } : null,
        proposedImplementation: initData?.SuggestedImplementationMethodId
          ? { label: proposedImplementationData?.find((x) => x.value === initData?.SuggestedImplementationMethodId)?.label, value: initData?.SuggestedImplementationMethodId }
          : null,
        durationDays: initData?.DurationDays,
        projectCost: initData?.ProjectCost,
        description: initData?.GeneralDescription,
        projectExpert: initData?.ProjectExpertId ? { label: usersData?.find((x) => x.value === initData?.ProjectExpertId)?.label, value: initData?.ProjectExpertId } : null,
        portfolio: initData?.ProjectPortfolioId
          ? { label: projectPortfolioData?.find((x) => x.value === initData?.ProjectPortfolioId)?.label, value: initData?.ProjectPortfolioId }
          : null,
        projectChartData: initData?.RelatedCharterProjects
          ? { label: projectChartData?.find((x) => x.value === initData?.RelatedCharterProjects)?.label, value: initData?.RelatedCharterProjects }
          : null,
        externalCompanies: initData?.ExternalCompanyId
          ? { label: ExternalCompaniesData?.find((x) => x.value === initData?.ExternalCompanyId)?.label, value: initData?.ExternalCompanyId }
          : null,
        locationtype: initData?.LocationTypeId ? { label: LocationTypeData?.find((x) => x.value === initData?.LocationTypeId)?.label, value: initData?.LocationTypeId } : null,
        province: initData?.LocationId ? { label: ProvinceData?.find((x) => x.value === initData?.LocationId)?.label, value: initData?.LocationId } : null,
        address: initData?.Address,
        currency: initData?.CurrencyId ? { label: CurrencyData?.find((x) => x.value === initData?.CurrencyId)?.label, value: initData?.CurrencyId } : null,
        projectSponsor: initData?.ProjectSponsorId
          ? { label: ProjectSponsorData?.find((x) => x.value === initData?.ProjectSponsorId)?.label, value: initData?.ProjectSponsorId }
          : null,
        exitType: initData?.ExitTypeId ? { label: ExitTypeData?.find((x) => x.value === initData?.ExitTypeId)?.label, value: initData?.ExitTypeId } : null,
        Criterion: initData?.Criterion ? initData?.Criterion : null,
      });
    }
  }, [initData, situation, projectTypeData, projectPortfolioData, proposedImplementationData, trusteeData, usersData, projectChartData]);
  useEffect(() => {
    const values = getValues();
    if (values?.startDate !== '' && values?.endDate !== '') {
      setDateDifferent(moment(values?.endDate).diff(moment(values?.startDate), 'days'));
    }
  }, [getValues]);
  useEffect(() => {
    if (requiredFields?.data && validation === null) {
      //(requiredFields?.data);
      const setvalidation = {
        validDeliverable: requiredFields?.data?.IsRequiredDeliverable === true ? false : true,
        validMilestone: requiredFields?.data?.IsRequiredMilestone === true ? false : true,
        validProjectGoal: requiredFields?.data?.IsRequiredProjectGoal === true ? false : true,
        validProjectRequirement: requiredFields?.data?.IsRequiredProjectRequirement === true ? false : true,
        validProjectRisk: requiredFields?.data?.IsRequiredProjectRisk === true ? false : true,
        validProjectSchedule: requiredFields?.data?.IsRequiredProjectSchedule === true ? false : true,
        validProjectStakeholder: requiredFields?.data?.IsRequiredProjectStakeholder === true ? false : true,
        validOrgMember: requiredFields?.data?.IsRequiredOrgMember === true ? false : true,
      };
      dispatch(handleProjectChartValidation(setvalidation));
    }
  }, [requiredFields, validation]);
  //#endregion

  const costTableColumns = [
    {
      title: 'هزینه اجرای پروژه',
      dataIndex: 'ProjectImplementationCost',
      key: 'ProjectImplementationCost',
      render: (text, record) => {
        const recordId = record.Id || record.tempId;

        if (editingCostId === recordId) {
          return (
            <InputNumber
              value={editingCostValue}
              onChange={setEditingCostValue}
              formatter={formatNumber}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              onPressEnter={() => handleUpdateCost(recordId)}
              autoFocus
              style={{ width: '100%' }}
            />
          );
        }

        return parseFloat(text).toLocaleString();
      },
    },
    {
      title: 'نوع ارز',
      dataIndex: 'CurrencyId',
      key: 'CurrencyId',
      render: (currencyId, record) => {
        const currency = CurrencyDatafiltered.find((item) => item.value === currencyId);
        return currency ? currency.label : 'Unknown';
      },
    },
    {
      title: 'نرخ تسعیر',
      dataIndex: 'ProjectExchangeRate',
      key: 'ProjectExchangeRate',
    },
    {
      title: 'عملیات',
      key: 'action',
      render: (text, record) => {
        const recordId = record.Id || record.tempId;

        if (editingCostId === recordId) {
          return (
            <span className='flex gap-4'>
              <Button
                type='primary'
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateCost(recordId);
                }}
                style={{ marginRight: 8 }}
              >
                ذخیره
              </Button>
              <Button
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelCostEdit();
                }}
              >
                لغو
              </Button>
            </span>
          );
        } else {
          return (
            <span>
              <Button
                type='link'
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCost(record);
                }}
                style={{ marginRight: 8 }}
              >
                ویرایش
              </Button>
              <Button
                type='link'
                danger
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCost(recordId);
                }}
              >
                حذف
              </Button>
            </span>
          );
        }
      },
    },
  ];

  const handleRemoveCriterion = (recordId) => {
    const itemToRemove = exitCriteriaData.find((item) => (item.Id || item.tempId) === recordId);

    if (!itemToRemove) {
      toast.error('آیتم برای حذف یافت نشد.');
      return;
    }

    if (itemToRemove.Id) {
      // Server-side item - mark as deleted
      const updatedData = exitCriteriaData.map((item) => (item.Id === recordId ? { ...item, isDeleted: true } : item));
      setExitCriteriaData(updatedData);
      toast.success('معیار برای حذف علامت‌گذاری شد');
    } else {
      // Local item (tempId) - remove from local state completely
      setExitCriteriaData((prev) => prev.filter((item) => item.tempId !== recordId));
      toast.success('معیار حذف شد');
    }
  };

  // Updated handleUpdateCriterion function that properly gets the updated data
  const handleUpdateCriterion = (recordId) => {
    const newValue = editingCriterionValue.trim();

    if (!newValue) {
      toast.error('معیار خروج نمی‌تواند خالی باشد.');
      return;
    }

    // Find the item in the current data using the correct ID logic
    const itemToUpdate = exitCriteriaData.find((item) => (item.Id || item.tempId) === recordId);

    if (!itemToUpdate) {
      toast.error('آیتم برای به‌روزرسانی یافت نشد.');
      setEditingCriterionId(null);
      setEditingCriterionValue('');
      return;
    }

    // Check if the value has actually changed
    if (itemToUpdate.Criterion === newValue) {
      // No change, just cancel edit mode
      setEditingCriterionId(null);
      setEditingCriterionValue('');
      return;
    }

    // Get the updated data - this is what was missing!
    const updatedRecord = {
      ...itemToUpdate, // Keep all existing properties
      Criterion: newValue, // Update only the criterion
      // Note: ExitTypeId should remain the same unless you also allow editing it
    };

    // It's a local item (tempId). Update local state.
    const updatedData = exitCriteriaData.map((item) => (item.tempId === recordId ? updatedRecord : item));

    setExitCriteriaData(updatedData);
    toast.success('معیار به‌روزرسانی شد (موقت)');

    setEditingCriterionId(null);
    setEditingCriterionValue('');

    // Log the updated local data
    console.log('Updated local record:', updatedRecord);
    console.log('Updated local data array:', updatedData);
  };
  const handleAddCost = () => {
    if (cost && selectedCurrency) {
      const costValue = parseFloat(cost.toString().replace(/,/g, ''));
      if (!isNaN(costValue)) {
        const newCost = {
          tempId: uuidv4(), // Add temporary ID for local items
          ProjectImplementationCost: costValue,
          CurrencyId: selectedCurrency,
          ProjectCharterId: initData?.Id || null,
          ProjectExchangeRate: ProjectExchangeRate

        };

        setCostsData((prev) => [...prev, newCost]);

        // Remove the used currency from available options
        console.log('GetallProjectCost : ', GetallProjectCost?.data);
        console.log('CurrencyData : ', CurrencyData);
        console.log('selectedCurrency : ', selectedCurrency);
        const filteredCurrency = CurrencyData.filter((item) => item.value !== selectedCurrency);
        setCurrencyData(filteredCurrency);

        // Reset inputs
        setCost('');
        setSelectedCurrency('');
      }
    }
  };

  // New function to handle cost editing
  const handleEditCost = (record) => {
    const recordId = record.Id || record.tempId;
    setEditingCostId(recordId);
    setEditingCostValue(record.ProjectImplementationCost);
    setEditingCostCurrency(record.CurrencyId);
  };

  // New function to handle cost update
  const handleUpdateCost = (recordId) => {
    console.log('handleUpdateCost called with recordId:', recordId);

    const newCostValue = parseFloat(editingCostValue.toString().replace(/,/g, ''));

    if (!newCostValue || isNaN(newCostValue)) {
      toast.error('مقدار هزینه معتبر نیست.');
      return;
    }

    if (!editingCostCurrency) {
      toast.error('نوع ارز باید انتخاب شود.');
      return;
    }

    // Find the item to update
    const itemToUpdate = costsData.find((item) => (item.Id || item.tempId) === recordId);

    if (!itemToUpdate) {
      toast.error('آیتم برای به‌روزرسانی یافت نشد.');
      handleCancelCostEdit();
      return;
    }

    // Check if anything changed
    if (itemToUpdate.ProjectImplementationCost === newCostValue && itemToUpdate.CurrencyId === editingCostCurrency) {
      handleCancelCostEdit();
      return;
    }

    const updatedRecord = {
      ...itemToUpdate,
      ProjectImplementationCost: newCostValue,
      CurrencyId: editingCostCurrency,
    };

    const updatedData = costsData.map((item) => (item.Id === recordId ? updatedRecord : item));
    setCostsData(updatedData);

    handleCancelCostEdit();
  };

  // New function to cancel cost editing
  const handleCancelCostEdit = () => {
    setEditingCostId(null);
    setEditingCostValue('');
    setEditingCostCurrency('');
  };

  // Updated handleRemoveCost function
  const handleRemoveCost = (recordId) => {
    const itemToRemove = costsData.find((item) => (item.Id || item.tempId) === recordId);

    if (!itemToRemove) {
      toast.error('آیتم برای حذف یافت نشد.');
      return;
    }

    if (itemToRemove.Id) {
      // Server-side item - mark as deleted
      const updatedData = costsData.map((item) => (item.Id === recordId ? { ...item, isDeleted: true } : item));
      setCostsData(updatedData);
      toast.success('هزینه برای حذف علامت‌گذاری شد');
    } else {
      // Local item (tempId) - remove from local state completely
      setCostsData((prev) => prev.filter((item) => item.tempId !== recordId));

      // Add the currency back to available options
      const currencyToAdd = CurrencyDatafiltered.find((curr) => curr.value === itemToRemove.CurrencyId);
      if (currencyToAdd) {
        setCurrencyData((prev) => [...prev, currencyToAdd]);
      }

      toast.success('هزینه حذف شد');
    }
  };

  const exitCriteriaColumns = [
    {
      title: 'معیار های خروج',
      dataIndex: 'Criterion',
      key: 'Criterion',
      render: (text, record) => {
        const recordId = record.Id || record.tempId;

        // Check if this specific row is the one being edited
        if (editingCriterionId === recordId) {
          return (
            <Input
              value={editingCriterionValue}
              onChange={(e) => setEditingCriterionValue(e.target.value)}
              onPressEnter={() => handleUpdateCriterion(recordId)}
              // REMOVE onBlur or make it conditional to avoid conflicts
              // onBlur={() => handleCancelEdit()}
              autoFocus
            />
          );
        }
        return text;
      },
    },
    {
      title: 'نوع خروج',
      dataIndex: 'ExitTypeId',
      key: 'ExitTypeId',
      render: (exitTypeId) => {
        const exitType = ExitTypeData.find((item) => item.value === exitTypeId);
        return exitType ? exitType.label : 'Unknown';
      },
    },
    {
      title: 'عملیات',
      key: 'action',
      render: (text, record) => {
        const recordId = record.Id || record.tempId;

        if (editingCriterionId === recordId) {
          return (
            <span className='flex gap-4'>
              <Button
                type='primary'
                size='small'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  console.log('Save clicked for recordId:', recordId); // Debug log
                  handleUpdateCriterion(recordId);
                }}
                style={{ marginRight: 8 }}
              >
                ذخیره
              </Button>
              <Button
                size='small'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  console.log('Cancel clicked'); // Debug log
                  handleCancelEdit();
                }}
              >
                لغو
              </Button>
            </span>
          );
        } else {
          return (
            <span>
              <Button
                type='link'
                size='small'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  console.log('Edit clicked for recordId:', recordId); // Debug log
                  console.log('Record data:', record); // Debug log
                  setEditingCriterionId(recordId);
                  setEditingCriterionValue(record.Criterion);
                }}
                style={{ marginRight: 8 }}
              >
                ویرایش
              </Button>
              <Button
                type='link'
                danger
                size='small'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  handleRemoveCriterion(recordId);
                }}
              >
                حذف
              </Button>
            </span>
          );
        }
      },
    },
  ];
  const formatNumber = (value) => {
    if (!value) return '';
    // Ensure value is a number before formatting
    const num = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };
  const handleCostChange = (value) => {
    // InputNumber passes the numeric value directly, no need to parse commas here
    // unless you want to store it formatted in state (not recommended)
    setCost(value);
  };
  console.log("servercfg : ", serverConfigs);

  return (
    <Card
      className='!mt-4'
      title={
        <div className='flex items-center'>
          <RiFileList3Fill className='w-5 h-5 text-base ml-3' color='#086af3' />
          <span>اطلاعات کلی پروژه</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='w-full border-b border-gray-300 h-10 text-[#2b7fff] font-bold'>
          <label htmlFor=''>شناسنامه پروژه</label>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4'>
          {/* عنوان پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(0)?.Visible ? (
            <div>
              <label htmlFor='title' className='text-sm font-medium'>
                {serverConfigs?.at(0)?.TabFormDtos?.at(0)?.Title}
              </label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(0)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}

              <Controller
                name='title'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(0)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      id='title'
                      className='rounded-full w-3/4'
                      placeholder='عنوان پروژه را وارد کنید..'
                    // {...register('title', { required: true })}
                    />
                    {errors.title && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>عنوان اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* تاریخ تهیه منشور */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(1)?.Visible ? (
            <div>
              <label htmlFor='charterDate' className='text-sm font-medium'>
                {serverConfigs?.at(0)?.TabFormDtos?.at(1)?.Title}
              </label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(1)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}>*</span> : ''}

              <Controller
                name='charterDate'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(1)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <DatePicker
                      {...field}
                      format='YYYY/MM/DD'
                      calendar={persian}
                      locale={persian_fa}
                      onChange={(date) => field.onChange(date?.format('YYYY/MM/DD'))}
                      // className="w-full rounded-full px-3 py-1.5 border border-gray-300"
                      containerClassName='w-full'
                      inputClass='w-full rounded px-3 py-1.5 border border-gray-300 date-picker-style'
                    // {...register('charterDate', { required: true })}
                    />
                    {errors.charterDate && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>تاریخ تهیه منشور اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* کد منشور پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(2)?.Visible ? (
            <div>
              <div className='flex gap-1'>
                <label className='block mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(2)?.Title}</label>
                {serverConfigs?.at(0)?.TabFormDtos?.at(2)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              </div>

              <Controller
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(1)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                name='charterCode'
                control={control}
                render={({ field }) => <Input {...field} placeholder='کد منشور پروژه' className='rounded-full w-3/4' />}
              />
            </div>
          ) : (
            ''
          )}

          {/* نوع پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(3)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(3)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(3)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='projectType'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(3)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue={true}
                      options={projectTypeData}
                      treeCheckable
                      placeholder='انتخاب نوع پروژه'
                      className='w-full rounded-full'
                    // {...register('projectType', { required: requiredFields?.data?.IsRequiredProjectType })}
                    //?.type === 'required'
                    />
                    {errors.projectType && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>نوع اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* تاریخ شروع پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(4)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(4)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(4)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='startDate'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(4)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <DatePicker
                      {...field}
                      format='YYYY/MM/DD'
                      calendar={persian}
                      locale={persian_fa}
                      // onChange={(date) => field.onChange(date?.format("YYYY/MM/DD"))}
                      onChange={(e) => {
                        field.onChange(e?.format('YYYY/MM/DD'));
                        const startDate = e === null ? null : persianToEnglishNumbers(e.format('YYYY/MM/DD'));
                        const EndDate = getValues();
                        DateChange(startDate, persianToEnglishNumbers(EndDate.endDate));
                      }}
                      // className="w-3/4 rounded-full px-3 py-1.5 border border-gray-300"
                      containerClassName='w-full'
                      inputClass='w-full rounded px-3 py-1.5 border border-gray-300 date-picker-style'
                    //{...register('startDate', { required: true })}
                    />
                    {errors.startDate && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>تاریخ شروع اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* تاریخ پایان پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(5)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(5)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(5)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='endDate'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(5)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <DatePicker
                      {...field}
                      format='YYYY/MM/DD'
                      calendar={persian}
                      locale={persian_fa}
                      // onChange={(date) => field.onChange(date?.format("YYYY/MM/DD"))}
                      onChange={(e) => {
                        field.onChange(e?.format('YYYY/MM/DD'));
                        const EndDate = e === null ? null : persianToEnglishNumbers(e.format('YYYY/MM/DD'));
                        const startDate = getValues();
                        DateChange(persianToEnglishNumbers(startDate.startDate), EndDate);
                      }}
                      // {...register('endDate', { required: true })}
                      containerClassName='w-full'
                      inputClass='w-full rounded px-3 py-1.5 border border-gray-300 date-picker-style'
                    // className="w-3/4 rounded-full px-3 py-1.5 border border-gray-300"
                    />
                    {errors.endDate && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>تاریخ پایان اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* سبد طرح/پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(6)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(6)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(6)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='portfolio'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(6)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <TreeSelect
                      {...field}
                      allowClear
                      labelInValue={true}
                      optionFilterProp='label'
                      showSearch
                      //  showCheckedStrategy='SHOW_PAREN'
                      treeData={projectPortfolioData}
                      //  treeCheckable
                      placeholder='انتخاب سبد پروژه'
                      className='w-full rounded-full'
                    //{...register('portfolio', { required: requiredFields?.data?.IsRequiredProjectPortfolio })}
                    />
                    {errors.portfolio && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>انتخاب سبد طرح/پروژه اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* متولی */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(7)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(7)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(7)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='trustee'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(7)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <TreeSelect
                      {...field}
                      allowClear
                      labelInValue={true}
                      optionFilterProp='label'
                      showSearch
                      //  showCheckedStrategy='SHOW_PAREN'
                      treeData={trusteeData}
                      //  treeCheckable
                      placeholder='انتخاب متولی'
                      className='w-full rounded-full'

                    //{...register('trustee', { required: requiredFields?.data?.IsRequiredTrusteeUnit })}
                    />
                    {errors.trustee && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>انتخاب متولی اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* روش اجرای پیشنهادی */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(8)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(8)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(8)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='proposedImplementation'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(8)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue={true}
                      options={proposedImplementationData}
                      treeCheckable
                      placeholder='انتخاب روش اجرای پیشنهادی'
                      className='w-full rounded-full'
                    //{...register('proposedImplementation', { required: requiredFields?.data?.IsRequiredSuggestedImplementationMethod })}
                    />
                    {errors.proposedImplementation && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>روش اجرای پیشنهادی اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* منشور های مرتبط */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(9)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(9)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(9)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='projectChartData'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(9)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    optionFilterProp='label'
                    showSearch
                    labelInValue={true}
                    options={projectChartData}
                    treeCheckable
                    placeholder='انتخاب منشور های مرتبط'
                    className='w-full rounded-full'
                  />
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* طول مدت پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(10)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(0)?.TabFormDtos?.at(10)?.Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(10)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='durationDays'
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(10)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                control={control}
                render={({ field }) => <Input {...field} placeholder='طول مدت پروژه' type='number' className='rounded-full w-3/4' value={DateDifferent} disabled />}
              />
            </div>
          ) : (
            ''
          )}
          <div>
            <label className=' mb-1 font-medium'>طول مدت پروژه</label>

            <DaysToReadableInput days={DateDifferent} />
          </div>

          {/* شرح کلی پروژه */}
          {serverConfigs?.at(0)?.TabFormDtos?.at(11)?.Visible ? (
            <div className='col-start-1 col-end-4'>
              <label className=' mb-1 font-medium'>{serverConfigs && serverConfigs.at(0)?.TabFormDtos.at(11).Title}</label>
              {serverConfigs?.at(0)?.TabFormDtos?.at(11)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='description'
                control={control}
                rules={serverConfigs?.at(0)?.TabFormDtos?.at(11)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <TextArea
                      {...field}
                      rows={4}
                      placeholder='توضیحاتی درباره پروژه...'
                      className='w-full'
                    // {...register('description', { required: requiredFields?.data?.IsRequiredGeneralDescription })}
                    />
                    {errors.description && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>شرح کلی اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}
        </div>
        <div className='w-full border-b border-gray-300 h-10 text-[#2b7fff] font-bold mt-3'>
          <label htmlFor=''>مسئولین پروژه</label>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4'>
          {/* مدیر پروژه */}
          {serverConfigs?.at(1)?.TabFormDtos?.at(0)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(1)?.TabFormDtos?.at(0)?.Title}</label>
              {serverConfigs?.at(1)?.TabFormDtos?.at(0)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='projectManager'
                control={control}
                rules={serverConfigs?.at(1)?.TabFormDtos?.at(0)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue={true}
                      options={usersData}
                      treeCheckable
                      placeholder='انتخاب مدیر پروژه'
                      className='w-full rounded-full'
                    // {...register('projectManager', { required: requiredFields?.data?.IsRequiredProjectManager })}
                    />
                    {errors.projectManager && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>انتخاب مدیر پروژه اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* کارشناس مسئول پروژه */}
          {serverConfigs?.at(1)?.TabFormDtos?.at(1)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(1)?.TabFormDtos?.at(1)?.Title}</label>
              {serverConfigs?.at(1)?.TabFormDtos?.at(1)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='projectExpert'
                control={control}
                rules={serverConfigs?.at(1)?.TabFormDtos?.at(1)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue={true}
                      options={usersData}
                      treeCheckable
                      placeholder='انتخاب کارشناس مسئول پروژه'
                      className='w-full rounded-full'
                    //{...register('projectExpert', { required: requiredFields?.data?.IsRequiredProjectExpert })}
                    />
                    {errors.projectExpert && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>کارشناس مسئول پروژه اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* حامی پروژه */}
          {serverConfigs?.at(1)?.TabFormDtos?.at(2)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(1)?.TabFormDtos?.at(2)?.Title}</label>
              {serverConfigs?.at(1)?.TabFormDtos?.at(2)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='projectSponsor'
                control={control}
                rules={serverConfigs?.at(1)?.TabFormDtos?.at(2)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    optionFilterProp='label'
                    showSearch
                    labelInValue={true}
                    options={ProjectSponsorData}
                    treeCheckable
                    placeholder='انتخاب کارشناس مسئول پروژه'
                    className='w-full rounded-full'
                  />
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* شرکت های خارج از سازمان */}
          {serverConfigs?.at(1)?.TabFormDtos?.at(3)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(1)?.TabFormDtos?.at(3)?.Title}</label>
              {serverConfigs?.at(1)?.TabFormDtos?.at(3)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='externalCompanies'
                control={control}
                rules={serverConfigs?.at(1)?.TabFormDtos?.at(3)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    optionFilterProp='label'
                    showSearch
                    labelInValue={true}
                    options={ExternalCompaniesData}
                    treeCheckable
                    placeholder='انتخاب کارشناس مسئول پروژه'
                    className='w-full rounded-full'
                  />
                )}
              />
            </div>
          ) : (
            ''
          )}
        </div>
        <div className='w-full border-b border-gray-300 h-10 text-[#2b7fff] font-bold mt-3'>
          <label htmlFor=''>مکان اجرای پروژه</label>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4'>
          {/* نوع مکان */}
          {serverConfigs?.at(2)?.TabFormDtos?.at(0)?.Visible ? (
            <div>
              <label className=' mb-1 font-medium'>{serverConfigs?.at(2)?.TabFormDtos?.at(0)?.Title}</label>
              {serverConfigs?.at(2)?.TabFormDtos?.at(0)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='locationtype'
                control={control}
                rules={serverConfigs?.at(2)?.TabFormDtos?.at(0)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue={true}
                      options={LocationTypeData}
                      treeCheckable
                      placeholder='انتخاب نوع مکان'
                      className='w-full rounded-full'
                    //{...register('locationtype', { required: requiredFields?.data?.IsRequiredProjectPlace })}
                    />
                    {errors.locationtype && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>نوع مکان اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* استان و شهرستان */}
          {serverConfigs?.at(2)?.TabFormDtos?.at(1)?.Visible ? (
            <div>
              <label className='mb-1 font-medium'>{serverConfigs?.at(2)?.TabFormDtos?.at(1)?.Title}</label>
              {serverConfigs?.at(2)?.TabFormDtos?.at(1)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='province'
                control={control}
                rules={serverConfigs?.at(2)?.TabFormDtos?.at(1)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => (
                  <>
                    <TreeSelect
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue={true}
                      treeData={ProvinceData}
                      //   treeCheckable
                      placeholder='انتخاب کارشناس مسئول پروژه'
                      className='w-full rounded-full'
                    //{...register('province', { required: requiredFields?.data?.IsRequiredProjectPlace })}
                    />
                    {errors.province && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>استان و شهرستان اجباری است.</p>}
                  </>
                )}
              />
            </div>
          ) : (
            ''
          )}

          {/* آدرس */}
          {serverConfigs?.at(2)?.TabFormDtos?.at(2)?.Visible ? (
            <div>
              <label className='block mb-1 font-medium'>{serverConfigs?.at(2)?.TabFormDtos?.at(2)?.Title}</label>
              {serverConfigs?.at(2)?.TabFormDtos?.at(2)?.IsRequired ? <span style={{ fontWeight: 'bold', color: 'red' }}> *</span> : ''}
              <Controller
                name='address'
                control={control}
                rules={serverConfigs?.at(2)?.TabFormDtos?.at(2)?.IsRequired ? { required: 'عنوان اجباری است.' } : undefined}
                render={({ field }) => <Input {...field} id='address' className='rounded-full w-3/4' placeholder='آدرس را وارد کنید..' />}
              />
            </div>
          ) : (
            ''
          )}
        </div>

        <div>
          {' '}
          {/* ... (existing form sections) ... */}
          {/* --- Add the new section for Project Implementation Costs --- */}
          <div className='w-full border-b border-gray-300 h-10 text-[#2b7fff] font-bold mt-3'>
            <label htmlFor=''>هزینه در نظر گرفته شده برای پروژه</label> {/* New section header */}
          </div>
          <div className='grid grid-cols-1 gap-6 p-4'>
            <div>
              <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <Form.Item label='هزینه اجرای پروژه' style={{ marginBottom: 0 }}>
                  <InputNumber
                    value={cost}
                    onChange={handleCostChange}
                    placeholder='هزینه را وارد کنید'
                    formatter={formatNumber}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: 200 }}
                  // Add validation rules if needed
                  />
                </Form.Item>

                <Form.Item label='نوع ارز' style={{ marginBottom: 0 }}>
                  <Select
                    value={selectedCurrency}
                    onChange={setSelectedCurrency}
                    options={CurrencyData} // Use the transformed array
                    style={{ width: 200 }}
                    placeholder='انتخاب نوع ارز'
                    allowClear // Optional: allows clearing the selection
                    showSearch // Optional: enables searching within the options
                    optionFilterProp='label' // Needed for search to work with custom labels
                  />
                </Form.Item>
                <Form.Item label='نرخ تسعیر' style={{ marginBottom: 0 }}>
                  <InputNumber
                    value={ProjectExchangeRate}
                    onChange={(e) => setProjectExchangeRate(e)}
                    placeholder='نرخ تسعیر را وارد کنید'
                    formatter={formatNumber}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: 200 }}
                  />
                </Form.Item>

                <Button type='primary' onClick={handleAddCost} disabled={!cost || !selectedCurrency}>
                  افزودن
                </Button>
              </div>

              <Table
                dataSource={costsData.filter((item) => !item.isDeleted)}
                columns={costTableColumns}
                rowKey={(record) => record.Id || record.tempId}
                pagination={false}
                size='small'
                locale={{ emptyText: 'هزینه‌ای ثبت نشده است' }}
              />
            </div>
          </div>
          <div className='w-full border-b border-gray-300 h-10 text-[#2b7fff] font-bold mt-3'>
            <label htmlFor=''>معیار های خروج از پروژه</label> {/* New section header */}
          </div>
          <div className='grid grid-cols-1 gap-6 p-4 mb-14'>
            <div>
              {/* <label className='block mb-1 font-medium'>ثبت معیارهای خروج</label> */}
              <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <Form.Item label='معیار خروج' style={{ marginBottom: 0 }}>
                  <Input value={criterionInput} onChange={(e) => setCriterionInput(e.target.value)} placeholder='معیار خروج را وارد کنید' style={{ width: 200 }} />
                </Form.Item>

                <Form.Item label='نوع خروج' style={{ marginBottom: 0 }}>
                  {/* Use the static data for this new table section */}
                  <Select
                    value={selectedExitType}
                    onChange={setSelectedExitType}
                    options={ExitTypeData}
                    style={{ width: 200 }}
                    placeholder='انتخاب نوع خروج'
                    allowClear
                    showSearch
                    optionFilterProp='label'
                  />
                </Form.Item>

                <Button type='primary' onClick={handleAddExitCriterion} disabled={!criterionInput || !selectedExitType}>
                  افزودن
                </Button>
              </div>

              <Table
                dataSource={exitCriteriaData.filter((item) => !item.isDeleted)}
                columns={exitCriteriaColumns}
                rowKey={(record) => record.Id || record.tempId} // Prefer server ID
                pagination={false}
                size='small'
                locale={{ emptyText: 'معیاری ثبت نشده است' }}
              />
            </div>
          </div>
          {/* --- End new section --- */}
          {/* ... (rest of existing form sections) ... */}
          <DynamicFormComponent formStructure={serverConfigs.filter((value) => value.Order > 3)} onsubmiting={handleSubmitBoth} />
        </div>
        {/* <div className='flex md:col-span-3 text-left mt-4 justify-center'>
          <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition'>
            {projectchartId !== null ? 'ویرایش اطلاعات' : 'ثبت اطلاعات'}
          </button>
        </div> */}
        {/* <DynamicFormComponent formStructure={serverConfigs.filter((value) => value.Order > 5)} onsubmiting={handleSubmitBoth} /> */}
      </form>

      <Toaster />
    </Card>
  );
};

export default ProjectInfoForm;
