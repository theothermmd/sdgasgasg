import React, { useState, useEffect, useRef } from 'react';
import { Table, Space, Button, Input, Divider, Tooltip } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';
import { RiCloseLine } from 'react-icons/ri';
import { FiCheck } from 'react-icons/fi';
import { IoAddCircleOutline } from 'react-icons/io5';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import toast, { Toaster } from 'react-hot-toast';

import Swal from 'sweetalert2';
import { useCreateStakeholderType, useDeleteStakeholderTypeById, useEditStakeholderType, useGetStakeholderType } from '../../../../ApiHooks/OtherSetting/StakeholderType';
const StakeholderType = () => {
  const [editingKey, setEditingKey] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });

  const refetchSourceRef = async () => {
    const result = await refetchStakeholderTypeList();
    if (result?.data) {
      const sortedData = result.data.data.map((item, index) => ({
        ...item,
        key: item.Id,
        Id: item.Id,
        Title: item.Title,
        row: index + 1,
      }));
      setDataSource(sortedData);
    }
  };

  const { mutateAsync: CreateStakeholderType } = useCreateStakeholderType();
  const { mutateAsync: UpdateStakeholderType } = useEditStakeholderType();
  const { mutateAsync: DeleteStakeholderType } = useDeleteStakeholderTypeById();
  const { data: StakeholderTypeList, refetch: refetchStakeholderTypeList, isPending } = useGetStakeholderType();
  const { control, setValue, getValues } = useForm();
  useEffect(() => {
    if (StakeholderTypeList) {
      const sortedData = StakeholderTypeList?.data.map((item, index) => ({
        ...item,
        key: item.Id,
        Id: item.Id,
        Title: item.Title,
        row: index + 1,
      }));
      setDataSource(sortedData);
    }
  }, [StakeholderTypeList]);

  const handleSaveStakeholderType = async (record) => {
    const Title = getValues('Title');

    if (!Title) {
      setChecked(true); // نمایش تولتیپ خطا
      return;
    }

    try {
      if (record.isNew) {
        const newStakeholderType = {
          Title,
        };
        const { data } = await CreateStakeholderType(newStakeholderType);
        if (data.isSuccess) {
          toast.success('مورد مد نظر با موفقیت اضافه شد');
        } else {
          toast.error(data.message);
        }
      } else {
        const updatedStakeholderType = {
          Id: record.Id,
          Title,
        };
        const { data } = await UpdateStakeholderType(updatedStakeholderType);
        if (data.isSuccess) {
          toast.success('مورد مد نظر با موفقیت به روز رسانی شد');
        } else {
          toast.error(data.message);
        }
      }

      setEditingKey(null);
      setValue('Title', '');
      setChecked(false);
      refetchSourceRef(); // بازخوانی داده‌ها
    } catch (error) {
      toast.error('خطا در ذخیره استان');
    }
  };

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
  const onFilter = (value, record, dataIndex) => {
    return record[dataIndex]?.toString().toLowerCase()?.includes(value?.toLowerCase());
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const activeTooltip = () => {
    const hasKeyZero = dataSource.some((item) => item.key === 0);
    if (editingKey || hasKeyZero) {
      setChecked(true);
      return false;
    }
    return true;
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
      return editingKey === record.key || record.isNew ? (
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
      width: 80,
      align: 'center',
    },
    {
      title: 'عنوان',
      dataIndex: 'Title',
      key: 'Title',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Title' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Title?.localeCompare(b.Title),
      ...getColumnSearchProps('Title'),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (text, record) => {
        if (editingKey === record.Id || record.isNew) {
          return (
            <div size='middle ' className='gap-3 flex justify-center content-center'>
              <div>
                <FiCheck className='size-5' onClick={() => handleSaveStakeholderType(record)} />
              </div>

              <div>
                <RiCloseLine className='size-5' onClick={() => handleReject(record)} />
              </div>
            </div>
          );
        }
        return (
          <div size='middle ' className='gap-3 flex justify-center content-center'>
            <>
              <div className='mt-[2px]'>
                <MdOutlineEdit className='h-5 w-6  cursor-pointer' onClick={() => handleEdit(record)} />
              </div>

              <div className='mt-1'>
                <FaRegTrashCan className='h-4 w-4  cursor-pointer' onClick={() => handleDelete(record.Id)} />
              </div>
            </>
          </div>
        );
      },
    },
  ];

  const handleEdit = (record) => {
    const hasKeyZero = dataSource.some((item) => item.key === 0);
    if (hasKeyZero) {
      setChecked(true);
    } else {
      setEditingKey(record.Id);
      setValue('Title', record.Title);
    }
  };
  const handleDelete = async (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        popup: 'w-[20rem] h-[19rem]', // کوچک کردن کل مدال
        title: 'text-lg', // کوچک‌تر کردن عنوان
        htmlContainer: 'text-sm',
        confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 text-sm rounded-md mx-2',
        cancelButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 text-sm rounded-md mx-2',
        icon: 'scale-90', // کوچک کردن آیکون بدون تغییر شکل
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: 'آیا مطمئن هستید؟',
        text: 'این عملیات غیرقابل بازگشت است!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله، حذف شود!',
        cancelButtonText: 'خیر، انصراف!',
        reverseButtons: true,
        width: '300px',
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await DeleteStakeholderType(id);
            refetchSourceRef();

            swalWithTailwindButtons.fire({
              title: 'حذف شد!',
              text: 'با موفقیت حذف شد',
              icon: 'success',
            });
          } catch (error) {
            swalWithTailwindButtons.fire({
              title: 'مشکلی پیش آمد!',
              text: 'خطا در حذف',
              icon: 'error',
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire({
            title: 'لغو شد!',
            icon: 'error',
          });
        }
      });
  };

  const handleReject = () => {
    setValue('Title', '');
    setValue('ParentId', '');
    setChecked(false);
    setEditingKey(null);
    const reject = dataSource.filter((item) => !item.isNew);
    setDataSource(reject);
  };

  const handleAccept = async (data) => {
    const formvalue = getValues() || [];
    const formDataAdd = {
      Title: getValues('Title'),
    };
    const formDataEdit = {
      Title: getValues('Title'),
      Id: data.Id,
    };
    if (formvalue.Title) {
      try {
        if (editingKey !== null) {
          setEditingKey(null);
          //   toast.success("منشا ارجاع با موفقیت ویرایش شد");
          refetchSourceRef();
        } else {
          refetchSourceRef();
          setEditingKey(null);
          //   toast.success("منشا ارجاع با موفقیت ثبت شد");
        }
        setValue('Title', '');
        setChecked(false);
      } catch (error) {}
    } else {
      setChecked(true);
    }
  };
  const handleAdd = () => {
    const Permitted = activeTooltip();
    if (Permitted) {
      const newData = {
        key: 0,
        isNew: true,
        id: Date.now(),
        ParentId: 0,
      };
      const index = (currentPage - 1) * pageSize;
      const updatedDataSource = [...dataSource.slice(0, index), newData, ...dataSource.slice(index)];
      setDataSource(updatedDataSource);
    }
  };
  return (
    <>
      <div className='border-b flex gap-4'>
        <div onClick={handleAdd} className=' flex gap-2 text-primary pb-3 cursor-pointer'>
          <IoAddCircleOutline className='size-5' />
          <div style={{ fontSize: '13px' }} className='font-bold'>
            افزودن
          </div>
        </div>
      </div>
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
      <Toaster />
    </>
  );
};

export default StakeholderType;
