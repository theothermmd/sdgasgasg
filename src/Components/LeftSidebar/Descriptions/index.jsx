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
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useCreateDescription, useDeleteDescriptionById, useEditDescription, useGetDescription } from '../../../ApiHooks/CommonHooks/Descriptions';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment-jalaali';
const Descriptions = ({ charterId, text, setText }) => {
  //#region states
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
  const { control, setValue, getValues } = useForm();
  //#endregion
  //#region features
  const loginUser = useSelector((state) => state.Auth.userInformation);
  console.log('loginUser every : ', loginUser);

  //#endregion
  //#region hooks
  const { mutateAsync: Create } = useCreateDescription();
  const { mutateAsync: Update } = useEditDescription();
  const { mutateAsync: Delete } = useDeleteDescriptionById();
  const { data: descriptionList, refetch: refetchList } = useGetDescription(charterId);
  //#endregion
  //#region functions
  const refetchSourceRef = async () => {
    const result = await refetchList();
    if (result?.data) {
      const sortedData = result.data.data.map((item, index) => ({
        ...item,
        key: item.Id,
        Id: item.Id,
        AuthorName: item.AuthorName,
        WriteTime: item.WriteTime,
        CreateTime: item.CreateTime,
        Text: item.Text,
        ProjectCharterId: item.ProjectCharterId,
        row: index + 1,
      }));
      setDataSource(sortedData);
    }
  };
  const handleEdit = (record) => {
    const hasKeyZero = dataSource.some((item) => item.key === 0);
    if (hasKeyZero) {
      setChecked(true);
    } else {
      setEditingKey(record.Id);
      setText(record.Text);
      // setValue("Text", record.Text);
      //  setValue("AuthorName", record.AuthorName);
      //  setValue("CreateTimePersian", record.CreateTimePersian);
    }
  };
  const handleSaveDescription = async (record) => {
    //const Title = getValues('Text');
    console.log('loginUser 1  :', loginUser);

    if (!text) {
      setChecked(true); // نمایش تولتیپ خطا
      return;
    }
    console.log('loginUser 2  :', loginUser);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    console.log('loginUser 3  :', loginUser);
    try {
      if (editingKey === null) {
        console.log('loginUser 4 : ' + loginUser);

        const newData = {
          Id: null,
          AuthorName: loginUser.UserName,
          AuthorFullQualifyName: loginUser.FullQualifyName,
          WriteTime: timeString,
          CreateTime: dateString,
          Text: text,
          ProjectCharterId: charterId,
          IsDeleted: false,
        };
        console.log('loginUser 5  :', loginUser);
        await Create(newData);
        // if (data.isSuccess) {
        //     toast.success("واحد پولی با موفقیت اضافه شد");
        // }
        // else {
        //     toast.error(data.message);
        // }
        console.log('loginUser 6  :', loginUser);
      } else {
        const updatedData = {
          Id: editingKey,
          AuthorName: loginUser.UserName,
          AuthorFullQualifyName: loginUser.FullQualifyName,
          WriteTime: timeString,
          CreateTime: dateString,
          Text: text,
          ProjectCharterId: charterId,
          IsDeleted: false,
        };
        console.log('loginUser 7  :', loginUser);
        await Update(updatedData);
        console.log('loginUser 8  :', loginUser);
        // if (data.isSuccess) {
        //     toast.success("واحد پولی با موفقیت ویرایش شد");
        // }
        // else {
        //     toast.error(data.message);
        // }
      }

      setEditingKey(null);
      setText('');
      setChecked(false);
      refetchSourceRef(); // بازخوانی داده‌ها
    } catch (error) {
      toast.error('خطا');
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
            await Delete(id);
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
    setValue('Text', '');
    setValue('ParentId', '');
    setChecked(false);
    setEditingKey(null);
    const reject = dataSource.filter((item) => !item.isNew);
    setDataSource(reject);
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
  //#endregion
  //#region useEffects
  useEffect(() => {
    if (descriptionList) {
      const sortedData = descriptionList?.data.map((item, index) => ({
        ...item,
        key: item.Id,
        Id: item.Id,
        AuthorName: item.AuthorName,
        WriteTime: item.WriteTime,
        CreateTime: item.CreateTime,
        CreateTimePersian: moment(item.CreateTime).format('jYYYY/jMM/jDD'),
        Text: item.Text,
        ProjectCharterId: item.ProjectCharterId,
        row: index + 1,
      }));
      setDataSource(sortedData);
    }
  }, [descriptionList]);
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
      // return editingKey === record.key || record.isNew ? (
      //     <>
      //         <Tooltip
      //             placement="bottomRight"
      //             title={"   این فیلد اجباری است"}
      //             open={checked}
      //             color="red"
      //         >
      //             <Controller
      //                 name={dataIndex}
      //                 control={control}
      //                 render={({ field }) => (
      //                     <Input
      //                         {...field}
      //                         defaultValue={
      //                             typeof record[dataIndex] === "string"
      //                                 ? record[dataIndex]
      //                                 : ""
      //                         }
      //                     />
      //                 )}
      //             />
      //         </Tooltip>
      //     </>
      // ) :
      return searchedColumn === dataIndex ? (
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
      title: 'توضیحات',
      dataIndex: 'Text',
      key: 'Text',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Text' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Text?.localeCompare(b.Text),
      ...getColumnSearchProps('Text'),
    },
    {
      title: 'نویسنده',
      dataIndex: 'AuthorName',
      key: 'AuthorName',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'AuthorName' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.AuthorName?.localeCompare(b.AuthorName),
      ...getColumnSearchProps('AuthorName'),
    },
    {
      title: 'تاریخ ثبت',
      dataIndex: 'CreateTimePersian',
      key: 'CreateTimePersian',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'CreateTimePersian' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.CreateTimePersian?.localeCompare(b.CreateTimePersian),
      ...getColumnSearchProps('CreateTimePersian'),
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
                <FiCheck className='size-5' onClick={() => handleSaveDescription(record)} />
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
  //#endregion

  return (
    <>
      <div className='border-b flex gap-4'>
        <div onClick={handleSaveDescription} className=' flex gap-2 text-primary pb-3 cursor-pointer'>
          <IoAddCircleOutline className='size-5' />
          <div style={{ fontSize: '13px' }} className='font-bold'>
            {editingKey === null ? 'افزودن توضیحات' : 'ثبت تغییرات'}
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
export default Descriptions;
