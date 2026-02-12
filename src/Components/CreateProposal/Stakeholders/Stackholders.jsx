import { Button, Input, Select, Space, Table, Tooltip, Popconfirm } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaBullseye, FaHeart, FaLayerGroup, FaRegTrashCan, FaUser } from 'react-icons/fa6';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineEdit } from 'react-icons/md';
import { RiCloseLine, RiTeamFill } from 'react-icons/ri';
import { SearchOutlined } from '@ant-design/icons';
import { useGetUsers } from '../../../ApiHooks/CommonHooks/Users';
import { useGetInfluenceScale } from '../../../ApiHooks/OtherSetting/InfluenceScale';
import { useGetInterestScale } from '../../../ApiHooks/OtherSetting/InterestScale';
import { useGetStakeholderType } from '../../../ApiHooks/OtherSetting/StakeholderType';
import { handleProjectChartValidation } from '../../../features/ProjectChart/ProjectChartSlice';
import DynamicFormComponent from '../../../pages/DynamicFormComponent';
import { useGetProjectStakeholder, useCreateProjectStakeholder, useDeleteProjectStakeholderById, useEditProjectStakeholder } from '../../../ApiHooks/ProjectStakeholder';
import { useSelector, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import Highlighter from 'react-highlight-words';
const { Option } = Select;

const StakeholdersTab = ({ serverConfigs }) => {
  //#region state
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });
  const { handleSubmit, control, reset } = useForm();
  const [usersData, setUsersData] = useState([]);
  const [InterestScaleData, setInterestScaleData] = useState([]);
  const [InfluenceScaleData, setInfluenceScaleData] = useState([]);
  const [StakeholderTypeData, setStakeholderTypeData] = useState([]);
  //#endregion

  //#region features
  const dispatch = useDispatch();
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  const IsEdit = workflowActionAccess.IsEdit;
  const validation = useSelector((state) => state.ProjectChart.projectChartValidation);
  //#endregion

  //#region hooks
  const { data: UsersList } = useGetUsers();
  const { data: InterestScaleList } = useGetInterestScale();
  const { data: InfluenceScaleList } = useGetInfluenceScale();
  const { data: StakeholderTypeList } = useGetStakeholderType();
  const { data: ProjectStakeholderList, refetch: refetchSourceRef } = useGetProjectStakeholder(projectchartId);
  const { mutateAsync: Create } = useCreateProjectStakeholder();
  const { mutateAsync: Update } = useEditProjectStakeholder();
  const { mutateAsync: Delete } = useDeleteProjectStakeholderById();
  //#endregion

  //#region functions
  const handleAdd = async (data) => {
    if (projectchartId === null) {
      toast.error(' ابتدا پروژه را ایجاد کنید');
      return;
    }
    const newData = {
      ProjectCharterId: projectchartId,
      UserId: data?.stakeholder?.value,
      StakeholderTypeId: data?.stakeholderType?.value,
      InfluenceScaleId: data?.influence?.value,
      InterestScaleId: data?.interest?.value,
    };
    const { data: result } = await Create(newData);
    if (result.isSuccess) {
      toast.success('اطلاعات با موفقیت ثبت شد');
      handleCancel();
      refetchSourceRef(projectchartId);
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
      UserId: data?.stakeholder?.value,
      StakeholderTypeId: data?.stakeholderType?.value,
      InfluenceScaleId: data?.influence?.value,
      InterestScaleId: data?.interest?.value,
    };
    const { data: result } = await Update(newData);
    if (result.isSuccess) {
      toast.success('اطلاعات با موفقیت ویرایش شد');
      handleCancel();
      refetchSourceRef(projectchartId);
    }
    setInEditMode(false);
  };
  const handleFillData = async (data) => {
    reset({
      stakeholder: {
        label: data?.stakeholder,
        value: data?.stakeholderId,
      },
      stakeholderType: {
        label: data?.stakeholderType,
        value: data?.stakeholderTypeId,
      },
      influence: {
        label: data?.influenceScale,
        value: data?.influenceScaleId,
      },
      interest: {
        label: data?.interestScale,
        value: data?.interestScaleId,
      },
    });
    setEditingKey(data?.Id);
    setInEditMode(true);
  };
  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };
  const TransformToTableData = (array) => {
    const newArray = array?.map((item) => ({
      Id: item.Id,
      stakeholder: usersData?.find((user) => user.value === item.UserId)?.label,
      stakeholderId: item?.UserId,
      stakeholderType: StakeholderTypeData?.find((type) => type.value === item?.StakeholderTypeId)?.label,
      stakeholderTypeId: item?.StakeholderTypeId,
      interestScale: InterestScaleData?.find((scale) => scale.value === item?.InterestScaleId)?.label,
      interestScaleId: item?.InterestScaleId,
      influenceScale: InfluenceScaleData?.find((scale) => scale.value === item?.InfluenceScaleId)?.label,
      influenceScaleId: item?.InfluenceScaleId,
    }));
    return newArray;
  };
  const handleCancel = () => {
    setInEditMode(false);
    setEditingKey(null);
    reset({
      stakeholder: {
        label: '',
        value: '',
      },
      stakeholderType: {
        label: '',
        value: '',
      },
      influence: {
        label: '',
        value: '',
      },
      interest: {
        label: '',
        value: '',
      },
    });
  };
  //#endregion

  //#region useEffect

  useEffect(() => {
    if (UsersList?.data) {
      if (usersData.length === 0) {
        setUsersData(TransForToSelectData(UsersList?.data, 'UserName', 'Id'));
      }
    }
  }, [UsersList?.data]);
  useEffect(() => {
    if (InterestScaleList?.data) {
      if (InterestScaleData.length === 0) {
        setInterestScaleData(TransForToSelectData(InterestScaleList?.data, 'Title', 'Id'));
      }
    }
  }, [InterestScaleList?.data]);
  useEffect(() => {
    if (InfluenceScaleList?.data) {
      if (InfluenceScaleData.length === 0) {
        setInfluenceScaleData(TransForToSelectData(InfluenceScaleList?.data, 'Title', 'Id'));
      }
    }
  }, [InfluenceScaleList?.data]);
  useEffect(() => {
    if (StakeholderTypeList?.data) {
      if (StakeholderTypeData.length === 0) {
        setStakeholderTypeData(TransForToSelectData(StakeholderTypeList?.data, 'Title', 'Id'));
      }
    }
  }, [StakeholderTypeList?.data]);
  useEffect(() => {
    if (ProjectStakeholderList?.data && InterestScaleData && StakeholderTypeData && InfluenceScaleData && usersData) {
      setDataSource(TransformToTableData(ProjectStakeholderList?.data));
    }
  }, [ProjectStakeholderList?.data, InterestScaleData, StakeholderTypeData, InfluenceScaleData, usersData]);
  useEffect(() => {
    if (validation) {
      if (!validation?.validProjectStakeholder) {
        if (dataSource.length > 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectStakeholder: true,
            }),
          );
        } else if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectStakeholder: false,
            }),
          );
        }
      } else {
        if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validProjectStakeholder: false,
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
  const handleReset = (clearFilters, selectedKeys, confirm, dataIndex) => {
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
      title: 'نام ذینفع',
      dataIndex: 'stakeholder',
      key: 'stakeholder',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'stakeholder' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.stakeholder?.localeCompare(b.stakeholder),
      ...getColumnSearchProps('stakeholder'),
    },
    {
      title: 'نوع ذینفع',
      dataIndex: 'stakeholderType',
      key: 'stakeholderType',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'stakeholderType' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.stakeholderType?.localeCompare(b.stakeholderType),
      ...getColumnSearchProps('stakeholderType'),
    },
    {
      title: 'میزان تاثیرگذاری',
      dataIndex: 'influenceScale',
      key: 'influenceScale',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'influenceScale' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.influenceScale?.localeCompare(b.influenceScale),
      ...getColumnSearchProps('influenceScale'),
    },
    {
      title: 'میزان علاقه‌مندی',
      dataIndex: 'interestScale',
      key: 'interestScale',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'interestScale' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.interestScale?.localeCompare(b.interestScale),
      ...getColumnSearchProps('interestScale'),
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
    <div className='bg-white  p-6'>
      {serverConfigs && serverConfigs.at(0)?.Visible ? (
        <>
          {' '}
          <div className='flex items-center mb-2'>
            <RiTeamFill className='w-5 h-5 text-base ml-3' color='#086af3' />
            <h2 className='text-blue-700 text-lg font-bold'>ذینفعان و مسئولین پروژه</h2>
          </div>
          <hr className='mb-6 border-gray-200' />
          <form onSubmit={handleSubmit(inEditMode ? handleEdit : handleAdd)} className='max-w-6xl p-4 bg-white rounded-xl'>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-6 items-end'>
              {/* نام ذینفع */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FaUser className='text-blue-500 text-xs' />
                    نام ذینفع
                  </div>
                </label>
                <Controller
                  name='stakeholder'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue
                      options={usersData}
                      placeholder='انتخاب نام ذینفع'
                      className='w-full rounded-full'
                    />
                  )}
                />
              </div>

              {/* نوع ذینفع */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FaLayerGroup className='text-blue-500 text-xs' />
                    نوع ذینفع
                  </div>
                </label>
                <Controller
                  name='stakeholderType'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue
                      options={StakeholderTypeData}
                      placeholder='انتخاب نوع ذینفع'
                      className='w-full rounded-full'
                    />
                  )}
                />
              </div>

              {/* میزان تاثیرگذاری */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FaBullseye className='text-blue-500 text-xs' />
                    میزان تاثیرگذاری
                  </div>
                </label>
                <Controller
                  name='influence'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue
                      options={InfluenceScaleData}
                      placeholder='انتخاب میزان تاثیرگذاری'
                      className='w-full rounded-full'
                    />
                  )}
                />
              </div>

              {/* میزان علاقه‌مندی */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FaHeart className='text-blue-500 text-xs' />
                    میزان علاقه‌مندی
                  </div>
                </label>
                <Controller
                  name='interest'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      optionFilterProp='label'
                      showSearch
                      labelInValue
                      options={InterestScaleData}
                      placeholder='انتخاب میزان علاقه‌مندی'
                      className='w-full rounded-full'
                    />
                  )}
                />
              </div>

              {/* دکمه ثبت در کنار فیلدها */}
              <div className='flex'>
                <button type='submit' className='bg-blue-600 text-white px-3 py-[0.40rem] rounded-md text-sm hover:bg-blue-700 transition' hidden={!IsEdit && IsEdit !== undefined}>
                  {inEditMode ? 'ویرایش' : 'افزودن'}
                </button>
              </div>
            </div>
          </form>
          <hr className='mb-2  border-gray-200' />
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
        </>
      ) : (
        ''
      )}
      <DynamicFormComponent formStructure={serverConfigs.filter((value) => value.Order > 0)} onsubmiting={onsubmit} />

      <Toaster />
    </div>
  );
};

export default StakeholdersTab;
