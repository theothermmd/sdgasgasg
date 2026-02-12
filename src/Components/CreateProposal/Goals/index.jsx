import { Button, Descriptions, Input, Select, Space, Table, Tooltip, Popconfirm } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaRegTrashCan } from 'react-icons/fa6';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineEdit } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { RiCloseLine, RiTeamFill } from 'react-icons/ri';
import { SearchOutlined } from '@ant-design/icons';
import { useGetProjectGoal, useCreateProjectGoal, useDeleteProjectGoalById, useEditProjectGoal } from '../../../ApiHooks/ProjectGoal';
import { useGetCurrency } from '../../../ApiHooks/OtherSetting/Currency';
import Title from 'antd/es/skeleton/Title';
import Highlighter from 'react-highlight-words';
import { handleProjectChartValidation } from '../../../features/ProjectChart/ProjectChartSlice';
import { UndoIcon } from 'lucide-react';
const RequiermentProject = () => {
  //#region state
  const [CurrencyData, setCurrencyData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [showQuality, setShowQuality] = useState(false);
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      goalType: '1',
    },
  });
  //#endregion

  //#region features
  const dispatch = useDispatch();

  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  const validation = useSelector((state) => state.ProjectChart.projectChartValidation);
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const IsEdit = workflowActionAccess.IsEdit;
  //#endregion
  //#region hooks
  const { data: ProjectGoalList, refetch: refetchSourceRef } = useGetProjectGoal(projectchartId);
  const { data: CurrencyList } = useGetCurrency();
  const { mutateAsync: Create } = useCreateProjectGoal();
  const { mutateAsync: Update } = useEditProjectGoal();
  const { mutateAsync: Delete } = useDeleteProjectGoalById();
  //#endregion
  //#region functions
  const handleAdd = async (data) => {
    console.log('dataططط : ', data);

    if (projectchartId === null) {
      toast.error(' ابتدا پروژه را ایجاد کنید');
      return;
    }
    console.log(data);
    if (data?.goalType === undefined || data?.goalTitle === undefined) {
      toast.error('لطفا ابتدا مقادیر را پر کنید.');
      return;
    }
    if (data?.goalType === '1') {
      if (data?.value === undefined || data?.unit === undefined) {
        toast.error('لطفا ابتدا مقادیر را پر کنید.');

        return;
      }
    }
    if (data?.goalType === '2') {
      if (data?.indicator === '' || data?.unit === undefined) {
        toast.error('لطفا ابتدا مقادیر را پر کنید.');
        return;
      }
    }

    const newData = {
      ProjectCharterId: projectchartId,
      Title: data?.goalTitle,
      GoalType: data?.goalType === '2' ? true : false,
      TargetValueQuality: data?.indicator ? data?.indicator : null,
      TargetValue: data?.value ? data?.value : null,
      CurrencyId: data?.unit?.value ? data?.unit?.value : null,
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
    const newData = {
      Id: editingKey,
      ProjectCharterId: projectchartId,
      Title: data?.goalTitle,
      GoalType: data?.goalType === '2' ? true : false,
      TargetValueQuality: data?.indicator,
      TargetValue: data?.value,
      CurrencyId: data?.unit?.value,
    };
    const { data: result } = await Update(newData);
    if (result.isSuccess) {
      toast.success('اطلاعات با موفقیت ویرایش شد');
      refetchSourceRef(projectchartId);
      handleCancel();
    }
  };
  const handleFillData = async (data) => {
    if (data?.GoalType === 'کیفی') {
      setShowQuality(true);
    } else {
      setShowQuality(false);
    }
    reset({
      goalTitle: data?.Title,
      goalType: data?.GoalType === 'کیفی' ? '2' : '1',
      indicator: data?.TargetValueQuality,
      value: data?.TargetValue,
      unit: data?.CurrencyId ? { label: CurrencyData.find((x) => x.value === data?.CurrencyId)?.label, value: data?.CurrencyId } : null,
    });
    setInEditMode(true);
    setEditingKey(data?.Id);
  };
  const TransformToTableData = (array) => {
    const newArray = array?.map((item) => ({
      Id: item.Id,
      Title: item.Title,
      GoalType: item.GoalType === true ? 'کیفی' : 'کمی',
      TargetValueQuality: item.TargetValueQuality,
      TargetValue: item.TargetValue,
      CurrencyLabel: item.CurrencyId ? CurrencyData.find((x) => x.value === item.CurrencyId)?.label : '',
      CurrencyId: item.CurrencyId,
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
  const handleUnitChange = (value) => {
    if (value === '2') {
      setShowQuality(true);
    } else {
      setShowQuality(false);
    }
  };
  const handleCancel = () => {
    setInEditMode(false);
    setShowQuality(false);
    setEditingKey(null);
    reset({
      goalTitle: '',
      goalType: '1',
      indicator: '',
      value: 0,
      unit: {
        label: '',
        value: '',
      },
    });
  };
  //#endregion
  //#region useEffect
  useEffect(() => {
    if (CurrencyList?.data) {
      if (CurrencyData.length === 0) {
        setCurrencyData(TransForToSelectData(CurrencyList?.data, 'Title', 'Id'));
      }
    }
  }, [CurrencyList?.data]);
  useEffect(() => {
    if (ProjectGoalList?.data) {
      setDataSource(TransformToTableData(ProjectGoalList?.data));
    }
  }, [ProjectGoalList?.data]);
  useEffect(() => {
    if (validation) {
      if (!validation?.validProjectGoal) {
        if (dataSource.length > 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectGoal: true,
            }),
          );
        } else if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectGoal: false,
            }),
          );
        }
      } else {
        if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectGoal: false,
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
          <Tooltip placement='bottomRight' title={'   این فیلد اجباری است'} open={checked} color='red'>
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
      title: 'عنوان هدف',
      dataIndex: 'Title',
      key: 'Title',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Title' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Title?.localeCompare(b.Title),
      ...getColumnSearchProps('Title'),
    },
    {
      title: 'نوع هدف',
      dataIndex: 'GoalType',
      key: 'GoalType',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'GoalType' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.GoalType?.localeCompare(b.GoalType),
      ...getColumnSearchProps('GoalType'),
    },
    {
      title: 'مشخصه',
      dataIndex: 'TargetValueQuality',
      key: 'TargetValueQuality',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'TargetValueQuality' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.TargetValueQuality?.localeCompare(b.TargetValueQuality),
      ...getColumnSearchProps('TargetValueQuality'),
    },
    {
      title: 'مقدار',
      dataIndex: 'TargetValue',
      key: 'TargetValue',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'TargetValue' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.TargetValue?.localeCompare(b.TargetValue),
      ...getColumnSearchProps('TargetValue'),
    },
    {
      title: 'واحد هدف',
      dataIndex: 'CurrencyLabel',
      key: 'CurrencyLabel',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'CurrencyLabel' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.CurrencyLabel?.localeCompare(b.CurrencyLabel),
      ...getColumnSearchProps('CurrencyLabel'),
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
    <div className='bg-white shadow rounded-xl p-6'>
      <form onSubmit={handleSubmit(inEditMode ? handleEdit : handleAdd)} className='max-w-6xl  p-6 bg-white rounded-xl'>
        <div className='grid grid-cols-1 md:grid-cols-7 gap-4 items-end'>
          {/* عنوان هدف */}
          <div className='md:col-span-2'>
            <label className='block mb-1 text-sm font-medium text-gray-700'>عنوان هدف</label>
            <Controller name='goalTitle' control={control} render={({ field }) => <Input {...field} placeholder='مثلاً افزایش فروش' className='rounded-full w-full' />} />
          </div>

          {/* نوع هدف */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>نوع هدف</label>
            <Controller
              name='goalType'
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder='انتخاب نوع' className='w-full rounded-full' allowClear onSelect={handleUnitChange} defaultValue={'1'}>
                  <Option value='1'>کمی</Option>
                  <Option value='2'>کیفی</Option>
                </Select>
              )}
            />
          </div>
          {showQuality === true ? (
            <>
              {/* مشخصه */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>مشخصه</label>
                <Controller name='indicator' control={control} render={({ field }) => <Input {...field} placeholder='مثلاً درصد رضایت' className='rounded-full w-full' />} />
              </div>
            </>
          ) : (
            <>
              {/* مقدار */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>مقدار</label>
                <Controller name='value' control={control} render={({ field }) => <Input {...field} type='number' placeholder='مثلاً 85' className='rounded-full w-full' />} />
              </div>

              {/* واحد هدف */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>واحد</label>
                <Controller
                  name='unit'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} optionFilterProp='label' labelInValue={true} options={CurrencyData} placeholder='واحد' className='w-full rounded-full' allowClear></Select>
                  )}
                />
              </div>
            </>
          )}

          {/* دکمه افزودن */}
          <div className='flex justify-center'>
            <button type='submit' className='bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition' hidden={!IsEdit && IsEdit !== undefined}>
              افزودن
            </button>
          </div>
        </div>
      </form>
      <hr className='mb-6 border-gray-200' />
      {/*     جدول     */}
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
        scroll={{ y: 440 }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
      />
    </div>
  );
};
export default RequiermentProject;
