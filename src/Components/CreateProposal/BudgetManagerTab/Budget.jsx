import { Button, Descriptions, Input, Select, Space, Table, Tooltip, Popconfirm } from 'antd';
import { useRef, useState, useEffect, use } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaRegTrashCan } from 'react-icons/fa6';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineEdit } from 'react-icons/md';
import { useSelector } from 'react-redux';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import toast, { Toaster } from 'react-hot-toast';
import { RiCloseLine, RiTeamFill } from 'react-icons/ri';
import { SearchOutlined } from '@ant-design/icons';
import { useGetRevenueForecast, useCreateRevenueForecast, useDeleteRevenueForecastById, useEditRevenueForecast } from '../../../ApiHooks/RevenueForecast';
import { useGetProjectRevenueForecast } from '../../../ApiHooks/OtherSetting/ProjectRevenueForecast';
import Title from 'antd/es/skeleton/Title';
import Highlighter from 'react-highlight-words';
import DatePicker from 'react-multi-date-picker';
const Budget = () => {
  //#region state
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [dataSource, setDataSource] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [ProjectRevenueForecastData, setProjectRevenueForecastData] = useState([]);
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      //CommittedDate: moment().format("jYYYY/jMM/jDD"),
    },
  });
  //#endregion

  //#region features
  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  //#endregion
  //#region hooks
  const { data: RevenueForecastList, refetch: refetchSourceRef } = useGetRevenueForecast(projectchartId);
  const { data: ProjectRevenueForecastList } = useGetProjectRevenueForecast();
  const { mutateAsync: Create } = useCreateRevenueForecast();
  const { mutateAsync: Update } = useEditRevenueForecast();
  const { mutateAsync: Delete } = useDeleteRevenueForecastById();
  //#endregion
  //#region functions
  const handleAdd = async (data) => {
    if (projectchartId === null) {
      toast.error(' ابتدا مایلستون را ایجاد کنید');
      return;
    }
    const newData = {
      ProjectCharterId: projectchartId,
      IncomeForecastTypeId: data?.ForcastType?.value,
      Amount: data?.amount,
      Description: data?.description,
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
      IncomeForecastTypeId: data?.ForcastType?.value,
      Amount: data?.amount,
      Description: data?.description,
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
      ForcastType: { label: data?.IncomeForecastType, value: data?.IncomeForecastTypeId },
      description: data?.Description,
      amount: data?.Amount,
    });
    setInEditMode(true);
    setEditingKey(data?.Id);
  };
  const TransformToTableData = (array) => {
    const newArray = array?.map((item) => ({
      Id: item.Id,
      IncomeForecastType: ProjectRevenueForecastData?.find((x) => x.value === item.IncomeForecastTypeId)?.label,
      IncomeForecastTypeId: item.IncomeForecastTypeId,
      Amount: item.Amount,
      Description: item.Description,
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
      ForcastType: {
        label: '',
        value: '',
      },
      amount: '',
      description: '',
    });
  };
  //#endregion
  //#region useEffect
  useEffect(() => {
    if (ProjectRevenueForecastList?.data) {
      setProjectRevenueForecastData(TransForToSelectData(ProjectRevenueForecastList?.data, 'Title', 'Id'));
    }
  }, [ProjectRevenueForecastList?.data]);
  useEffect(() => {
    if (RevenueForecastList?.data && ProjectRevenueForecastData) {
      setDataSource(TransformToTableData(RevenueForecastList?.data));
    }
  }, [RevenueForecastList?.data, ProjectRevenueForecastData]);
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
      title: 'نوع پیش بینی',
      dataIndex: 'IncomeForecastType',
      key: 'IncomeForecastType',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'IncomeForecastType' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.IncomeForecastType?.localeCompare(b.IncomeForecastType),
      ...getColumnSearchProps('IncomeForecastType'),
    },
    {
      title: 'مبلغ پیش بینی شده',
      dataIndex: 'Amount',
      key: 'Amount',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Amount' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Amount?.localeCompare(b.Amount),
      ...getColumnSearchProps('Amount'),
    },
    {
      title: 'شرحه پیش بینی',
      dataIndex: 'Description',
      key: 'Description',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Description' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Description?.localeCompare(b.Description),
      ...getColumnSearchProps('Description'),
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
        <div className='grid grid-cols-3 md:grid-cols-4 gap-4 items-end'>
          {/* نوع پیش بینی و برآورد و درآمد */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>نوع پیش بینی و برآورد و درآمد</label>
            <Controller
              name='ForcastType'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='انتخاب نوع'
                  className='w-full rounded-full'
                  allowClear
                  options={ProjectRevenueForecastData}
                  optionFilterProp='label'
                  showSearch
                  labelInValue={true}
                ></Select>
              )}
            />
          </div>

          {/* مبلغ */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>مبلغ</label>
            <Controller name='amount' control={control} render={({ field }) => <Input {...field} type='number' placeholder='مبلغ' className='rounded-full w-full' />} />
          </div>

          {/* شرح */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>شرح</label>
            <Controller name='description' control={control} render={({ field }) => <Input {...field} type='text' placeholder='توضیحات' className='rounded-full w-full' />} />
          </div>
          {/* دکمه افزودن */}
          <div className='flex justify-center'>
            <button type='submit' className='bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition'>
              {inEditMode ? 'ویرایش' : 'افزودن'}
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
export default Budget;
