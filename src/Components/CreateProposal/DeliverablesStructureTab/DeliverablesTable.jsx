import { Button, Descriptions, Input, Select, Space, Table, Tooltip, Popconfirm } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaRegTrashCan } from 'react-icons/fa6';
import { FaCheckCircle } from 'react-icons/fa';
import { MdChecklist, MdOutlineEdit } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { SearchOutlined } from '@ant-design/icons';
import { useGetDeliverable, useCreateDeliverable, useDeleteDeliverableById, useEditDeliverable } from '../../../ApiHooks/Deliverable';
import Highlighter from 'react-highlight-words';
import { handleProjectChartValidation } from '../../../features/ProjectChart/ProjectChartSlice';
const DeliverablesTable = () => {
  //#region state
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [dataSource, setDataSource] = useState([]);
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
  const dispatch = useDispatch();
  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  const validation = useSelector((state) => state.ProjectChart.projectChartValidation);
  //#endregion
  //#region hooks
  const { data: DeliverableList, refetch: refetchSourceRef } = useGetDeliverable(projectchartId);
  const { mutateAsync: Create } = useCreateDeliverable();
  const { mutateAsync: Update } = useEditDeliverable();
  const { mutateAsync: Delete } = useDeleteDeliverableById();
  //#endregion
  //#region functions
  const handleAdd = async (data) => {
    if (projectchartId === null) {
      toast.error(' ابتدا عنوان را ایجاد کنید');
      return;
    }
    const newData = {
      ProjectCharterId: projectchartId,
      ItemTitle: data?.Title,
      AcceptanceCriteria: data?.AcceptanceCriteria,
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
      ItemTitle: data?.Title,
      AcceptanceCriteria: data?.AcceptanceCriteria,
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
      AcceptanceCriteria: data?.AcceptanceCriteria,
    });
    setInEditMode(true);
    setEditingKey(data?.Id);
  };
  const TransformToTableData = (array) => {
    const newArray = array?.map((item) => ({
      Id: item.Id,
      Title: item.ItemTitle,
      AcceptanceCriteria: item.AcceptanceCriteria,
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
    if (DeliverableList?.data) {
      setDataSource(TransformToTableData(DeliverableList?.data));
    }
  }, [DeliverableList?.data]);
  useEffect(() => {
    if (validation) {
      if (!validation?.validDeliverable) {
        if (dataSource.length > 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validDeliverable: true,
            }),
          );
        } else if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validDeliverable: false,
            }),
          );
        }
      } else {
        if (dataSource.length === 0) {
          dispatch(
            handleProjectChartValidation({
              ...validation,
              validDeliverable: false,
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
      title: 'عنوان قلم',
      dataIndex: 'Title',
      key: 'Title',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Title' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Title?.localeCompare(b.Title),
      ...getColumnSearchProps('Title'),
    },
    {
      title: 'معیار پذیرش',
      dataIndex: 'AcceptanceCriteria',
      key: 'AcceptanceCriteria',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'AcceptanceCriteria' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.milestoneTitle?.localeCompare(b.AcceptanceCriteria),
      ...getColumnSearchProps('AcceptanceCriteria'),
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
          {/*عنوان قلم */}
          <div className='md:col-span-2'>
            <label className='block mb-1 text-sm font-medium text-gray-700'>عنوان قلم</label>
            <Controller name='Title' control={control} render={({ field }) => <Input {...field} placeholder='عنوان را وارد کنید..' className='rounded-full w-full' />} />
          </div>
          {/*معیار پذیرش
           */}
          <div className='md:col-span-2'>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              <div className='flex items-center gap-2'>
                <MdChecklist className='text-green-500' />
                معیار پذیرش
              </div>
            </label>
            <Controller
              name='AcceptanceCriteria'
              control={control}
              render={({ field }) => <Input {...field} placeholder='عنوان را وارد کنید..' className='rounded-full w-full' />}
            />
          </div>
          {/* دکمه افزودن */}
          <div className='md:col-span-1 flex justify-center'>
            <button type='submit' className='bg-blue-600 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition'>
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
export default DeliverablesTable;
