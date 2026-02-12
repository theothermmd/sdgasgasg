import { Button, Descriptions, Input, Select, Space, Table, Tooltip, Popconfirm, TreeSelect } from 'antd';
import { MdOutlineTitle, MdCategory, MdOutlineAssessment, MdOutlineAttachMoney, MdOutlineAccountBalanceWallet, MdOutlineMoneyOffCsred } from 'react-icons/md';
import { GiReceiveMoney } from 'react-icons/gi';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { TbCurrencyDollarAustralian } from 'react-icons/tb';
import { useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaRegTrashCan } from 'react-icons/fa6';
import { FaCheckCircle } from 'react-icons/fa';
import { MdChecklist, MdOutlineEdit } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { SearchOutlined } from '@ant-design/icons';
import { useGetProjectRisk, useCreateProjectRisk, useDeleteProjectRiskById, useEditProjectRisk } from '../../../ApiHooks/ProjectRisk';
import { useGetRiskImpactSeverity } from '../../../ApiHooks/OtherSetting/RiskImpactSeverity';
import { useGetCurrency } from '../../../ApiHooks/OtherSetting/Currency';
import { useGetRiskCategory } from '../../../ApiHooks/OtherSetting/RiskCategory';
import Highlighter from 'react-highlight-words';
import DatePicker from 'react-multi-date-picker';
import moment from 'moment-jalaali';
import { handleProjectChartValidation } from '../../../features/ProjectChart/ProjectChartSlice';
const Risks = () => {
  //#region state
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [RisksData, setRisksData] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [RiskCategoryData, setRiskCategoryData] = useState([]);
  const [RiskImpactSeverityData, setRiskImpactSeverityData] = useState([]);
  const [CurrencyData, setCurrencyData] = useState([]);
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });
  const { handleSubmit, control, reset } = useForm();
  const dispatch = useDispatch();

  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  const validation = useSelector((state) => state.ProjectChart.projectChartValidation);
  //#endregion
  //#region hooks
  const { data: ProjectRequirementList, refetch: refetchSourceRef } = useGetProjectRisk(projectchartId);
  const { data: RiskImpactSeverityList } = useGetRiskImpactSeverity();
  const { data: RiskCategoryList } = useGetRiskCategory();
  const { data: currencyList } = useGetCurrency();
  const { mutateAsync: Create } = useCreateProjectRisk();
  const { mutateAsync: Update } = useEditProjectRisk();
  const { mutateAsync: Delete } = useDeleteProjectRiskById();
  const options = [
    { label: 'گزینه اول', value: '1' },
    { label: 'گزینه دوم', value: '2' },
    { label: 'گزینه سوم', value: '3' },
  ];
  const RiskClassifications = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
  }));
  //#endregion
  //#region functions
  const handleAdd = async (data) => {
    if (projectchartId === null) {
      toast.error(' ابتدا پروژه را ایجاد کنید');
      return;
    }
    const date = moment(persianToEnglishNumbers(data?.PredictTimeOccurrence), 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
    const newData = {
      ProjectCharterId: projectchartId,
      Title: data?.Title,
      RiskImpactSeverityId: data?.RiskImpactSeverity?.value,
      RiskCategoryId: data?.RiskCategory?.value,
      Probability: data?.Probability,
      CostImpact: data?.CostImpact,
      CurrencyId: data?.Currency?.value,
      PredictTimeOccurrence: date,
      ExchangeRate: data?.CurrencyExchangeRate,
    };
    const { data: result } = await Create(newData);
    if (result.isSuccess) {
      toast.success('اطلاعات با موفقیت ثبت شد');
      refetchSourceRef(projectchartId);
      handleCancel();
    }
  };
  const handleDelete = async (Id) => {
    const { data: result } = await Delete(Id);
    if (result.isSuccess) {
      toast.success('اطلاعات با موفقیت حذف شد');
      refetchSourceRef(projectchartId);
    }
  };
  const handleEdit = async (data) => {
    const date = moment(persianToEnglishNumbers(data?.PredictTimeOccurrence), 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
    const newData = {
      Id: editingKey,
      ProjectCharterId: projectchartId,
      Title: data?.Title,
      RiskImpactSeverityId: data?.RiskImpactSeverity?.value,
      RiskCategoryId: data?.RiskCategory?.value,
      Probability: data?.Probability,
      CostImpact: data?.CostImpact,
      CurrencyId: data?.Currency?.value,
      PredictTimeOccurrence: date,
      ExchangeRate: data?.CurrencyExchangeRate,
    };
    const { data: result } = await Update(newData);
    if (result.isSuccess) {
      toast.success('اطلاعات با موفقیت ویرایش شد');
      refetchSourceRef(projectchartId);
      handleCancel();
    }
  };
  const handleFillData = async (data) => {
    reset({
      Title: data?.Title,
      RiskImpactSeverity: { labell: data?.RiskImpactSeverity, value: data?.RiskImpactSeverityId },
      RiskCategory: { labell: data?.RiskCategory, value: data?.RiskCategoryId },
      Probability: data?.Probability,
      CostImpact: data?.CostImpact,
      Currency: { labell: data?.Currency, value: data?.CurrencyId },
      PredictTimeOccurrence: data?.PredictTimeOccurrence,
      CurrencyExchangeRate: data?.ExchangeRate,
    });
    setInEditMode(true);
    setEditingKey(data?.Id);
  };
  const TransformToTableData = (array) => {
    const newArray = array?.map((item) => ({
      Id: item.Id,
      Title: item?.Title,
      RiskImpactSeverityId: item?.RiskImpactSeverityId,
      RiskImpactSeverity: RiskImpactSeverityData?.find((x) => x.value === item?.RiskImpactSeverityId)?.label,
      RiskCategoryId: item?.RiskCategoryId,
      RiskCategory: RiskCategoryData?.find((x) => x.value === item?.RiskCategoryId)?.lable,
      Probability: item?.Probability,
      CostImpact: item?.CostImpact,
      CurrencyId: item?.CurrencyId,
      Currency: CurrencyData?.find((x) => x.value === item?.CurrencyId)?.label,
      PredictTimeOccurrence: moment(item?.PredictTimeOccurrence).format('jYYYY/jMM/jDD'),
      ExchangeRate: item?.ExchangeRate,
    }));
    return newArray;
  };
  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };
  const handleCancel = () => {
    setInEditMode(false);
    setEditingKey(null);
    reset({
      Title: '',
      RiskImpactSeverity: {
        label: '',
        value: '',
      },
      RiskCategory: {
        label: '',
        value: '',
      },
      Probability: '',
      CostImpact: '',
      Currency: {
        label: '',
        value: '',
      },
      PredictTimeOccurrence: '',
      CurrencyExchangeRate: '',
    });
  };
  const TransFormToTreeSelectData = (array) => {
    const transformData = (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      const transformItem = (item, index) => {
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
  //#endregion
  //#region useEffect
  useEffect(() => {
    if (ProjectRequirementList?.data && RiskCategoryData && RiskImpactSeverityData && CurrencyData) {
      setDataSource(TransformToTableData(ProjectRequirementList?.data));
    }
  }, [ProjectRequirementList?.data, RiskCategoryData, RiskImpactSeverityData, CurrencyData]);
  useEffect(() => {
    if (RiskImpactSeverityList?.data) {
      setRiskImpactSeverityData(TransForToSelectData(RiskImpactSeverityList?.data, 'Title', 'Id'));
    }
  }, [RiskImpactSeverityList?.data]);
  useEffect(() => {
    if (currencyList?.data) {
      setCurrencyData(TransForToSelectData(currencyList?.data, 'Title', 'Id'));
    }
  }, [currencyList?.data]);
  useEffect(() => {
    if (RiskCategoryList?.data) {
      setRiskCategoryData(TransFormToTreeSelectData(RiskCategoryList?.data));
    }
  }, [RiskCategoryList?.data]);
  useEffect(() => {
    if (validation) {
      if (!validation?.validProjectRisk) {
        if (dataSource.length > 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectRisk: true,
            }),
          );
        } else if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectRisk: false,
            }),
          );
        }
      } else {
        if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectRisk: false,
            }),
          );
        }
      }
    }
  }, [dataSource]);
  //#endregion
  //#region table
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, selectedKeys, confirm) => {
    clearFilters();
    setSearchText('');
    handleSearch(selectedKeys, confirm, '');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`جستجو`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{
              width: 90,
            }}
          >
            جستجو
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters, selectedKeys, confirm, dataIndex)} size='small' style={{ width: 90 }}>
            بازنشانی
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            فیلتر
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              close();
            }}
          >
            بستن
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      const filterFn = (record) => {
        if (record[dataIndex] && record[dataIndex]?.toString()?.toLowerCase()?.includes(value?.toLowerCase())) {
          return true;
        }
        if (record.children) {
          for (let child of record.children) {
            if (filterFn(child)) {
              return true;
            }
          }
        }
        return false;
      };
      return filterFn(record);
    },
    render: (text, record) => {
      return record.isNew || record.isChild ? (
        <>
          <Tooltip placement='bottomRight' title={'این فیلد اجباری است'} open={checked} color='red'>
            <Controller
              name={dataIndex}
              control={control}
              render={({ field }) => <Input {...field} defaultValue={typeof record[dataIndex] === 'string' ? record[dataIndex] : ''} />}
            />
          </Tooltip>
        </>
      ) : searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    },
  });
  const column = [
    {
      title: 'ردیف',
      dataIndex: 'row',
      key: 'row',
      render: (text, record, index) => index + 1,
      width: 80,
      align: 'center',
    },
    {
      title: 'عنوان ریسک',
      dataIndex: 'Title',
      key: 'Title',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Title' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Title?.localeCompare(b.Title),
      ...getColumnSearchProps('Title'),
    },
    {
      title: 'طبقه بندی ریسک',
      dataIndex: 'RiskCategory',
      key: 'RiskCategory',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'RiskCategory' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.RiskCategory?.localeCompare(b.RiskCategory),
      ...getColumnSearchProps('RiskCategory'),
    },
    {
      title: 'پیش بینی احتمال وقوع',
      dataIndex: 'Probability',
      key: 'Probability',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Probability' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.ProbabilityOccurrence?.localeCompare(b.Probability),
      ...getColumnSearchProps('Probability'),
    },
    {
      title: 'پیش بینی شدت اثر',
      dataIndex: 'RiskImpactSeverity',
      key: 'RiskImpactSeverity',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'RiskImpactSeverity' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.RiskImpactSeverity?.localeCompare(b.RiskImpactSeverity),
      ...getColumnSearchProps('RiskImpactSeverity'),
    },
    {
      title: 'پیش بینی  هزینه ریسک',
      dataIndex: 'CostImpact',
      key: 'CostImpact',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'CostImpact' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.CostImpact?.localeCompare(b.CostImpact),
      ...getColumnSearchProps('CostImpact'),
    },
    {
      title: 'واحد پول',
      dataIndex: 'Currency',
      key: 'Currency',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Currency' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Currency?.localeCompare(b.Currency),
      ...getColumnSearchProps('Currency'),
    },
    {
      title: 'نرخ تسعیر',
      dataIndex: 'ExchangeRate',
      key: 'ExchangeRate',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'ExchangeRate' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.ExchangeRate?.localeCompare(b.ExchangeRate),
      ...getColumnSearchProps('ExchangeRate'),
    },
    {
      title: ' پیش بینی احتمال وقوع',
      dataIndex: 'PredictTimeOccurrence',
      key: 'PredictTimeOccurrence',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'PredictTimeOccurrence' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.PredictTimeOccurrence?.localeCompare(b.PredictTimeOccurrence),
      ...getColumnSearchProps('PredictTimeOccurrence'),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (text, record) => {
        return (
          <div size='middle ' className='gap-3 flex justify-center content-center'>
            <>
              <div className='mt-[2px]'>
                <MdOutlineEdit className='h-5 w-6  cursor-pointer' onClick={() => handleFillData(record)} />
              </div>
              <div className='mt-1'>
                <Popconfirm title='آیا از حذف این مورد مطمئن هستید؟' onConfirm={() => handleDelete(record.Id)}>
                  <FaRegTrashCan className='h-4 w-4  cursor-pointer' />
                </Popconfirm>
              </div>
            </>
          </div>
        );
      },
    },
  ];
  //#endregion

  return (
    <div className='bg-white shadow rounded-2xl p-8'>
      <form onSubmit={handleSubmit(inEditMode ? handleEdit : handleAdd)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-6 gap-6'>
          {/* عنوان ریسک */}
          <div className='md:col-span-3'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <MdOutlineTitle className='text-blue-500 text-lg' /> عنوان ریسک
            </label>
            <Controller name='Title' control={control} render={({ field }) => <Input {...field} placeholder='عنوان را وارد کنید..' className='rounded-full w-full' />} />
          </div>

          {/* طبقه‌بندی ریسک */}
          <div>
            <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
              <MdCategory className='text-blue-600' />
              طبقه‌بندی ریسک
            </label>
            <Controller
              name='RiskCategory'
              control={control}
              render={({ field }) => (
                // <Select
                //   {...field}
                //   allowClear
                //   placeholder="انتخاب عدد از 1 تا 10"
                //   className="w-full mt-1"
                //   options={RiskCategoryData}
                // />
                <TreeSelect
                  {...field}
                  allowClear
                  labelInValue={true}
                  optionFilterProp='label'
                  showSearch
                  //  showCheckedStrategy='SHOW_PAREN'
                  treeData={RiskCategoryData}
                  //  treeCheckable
                  placeholder='انتخاب سبد پروژه'
                  className='w-full rounded-full'
                />
              )}
            />
          </div>

          {/* پیش بینی احتمال وقوع */}
          <div className='md:col-span-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <MdOutlineAssessment className='text-yellow-500 text-lg' /> پیش بینی احتمال وقوع
            </label>
            <Controller
              name='Probability'
              control={control}
              render={({ field }) => <Input {...field} type='number' placeholder='عدد از 1 تا 99' className='rounded-full w-full' />}
            />
          </div>

          {/* پیش بینی شدت اثر */}
          <div className='md:col-span-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <MdOutlineAssessment className='text-red-500 text-lg' /> پیش بینی شدت اثر
            </label>
            <Controller
              name='RiskImpactSeverity'
              control={control}
              render={({ field }) => (
                <Select {...field} allowClear showSearch labelInValue options={RiskImpactSeverityData} placeholder='انتخاب شدت اثر' className='w-full rounded-full' />
              )}
            />
          </div>

          {/* پیش بینی هزینه ریسک */}
          <div className='md:col-span-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <MdOutlineAttachMoney className='text-green-500 text-lg' /> پیش بینی هزینه ریسک
            </label>
            <Controller name='CostImpact' control={control} render={({ field }) => <Input {...field} type='number' className='rounded-full w-full' />} />
          </div>

          {/* واحد پول */}
          <div className='md:col-span-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <TbCurrencyDollarAustralian className='text-indigo-500 text-lg' /> واحد پول
            </label>
            <Controller
              name='Currency'
              control={control}
              render={({ field }) => <Select {...field} allowClear showSearch labelInValue options={CurrencyData} placeholder='انتخاب واحد پول' className='w-full rounded-full' />}
            />
          </div>

          {/* نرخ تسعیر */}
          <div className='md:col-span-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
              <GiReceiveMoney className='text-emerald-500 text-lg' /> نرخ تسعیر
            </label>
            <Controller
              name='CurrencyExchangeRate'
              control={control}
              render={({ field }) => <Input {...field} type='number' placeholder='نرخ را وارد کنید' className='rounded-full w-full' />}
            />
          </div>
          {/* پیش بینی احتمال وقوع */}
          <div className='md:col-span-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>پیش بینی احتمال وقوع</label>
            <Controller
              name='PredictTimeOccurrence'
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format='YYYY/MM/DD'
                  calendar={persian}
                  locale={persian_fa}
                  onChange={(date) => field.onChange(date?.format('YYYY/MM/DD'))}
                  containerClassName='w-full'
                  inputClass='w-full rounded px-3 py-1.5 border border-gray-300 date-picker-style'
                />
              )}
            />
          </div>
        </div>

        {/* دکمه افزودن */}
        <div className='flex justify-end pt-6'>
          <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700 transition'>
            {inEditMode ? 'ویرایش' : 'افزودن'}
          </button>
        </div>
      </form>

      <hr className='my-8 border-gray-200' />

      <Table
        dataSource={dataSource}
        columns={column}
        size='small'
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ y: 400 }}
        rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
      />
      <Toaster />
    </div>
  );
};
export default Risks;
