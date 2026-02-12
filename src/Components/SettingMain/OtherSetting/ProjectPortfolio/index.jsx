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
import { PiTreeStructure } from 'react-icons/pi';
import Swal from 'sweetalert2';
import { useCreateProjectPortfolio, useDeleteProjectPortfolioById, useEditProjectPortfolio, useGetProjectPortfolio } from '../../../../ApiHooks/OtherSetting/ProjectPortfolio';
import { IoMdArrowDropleft } from 'react-icons/io';
import toast, { Toaster } from 'react-hot-toast';
const ProjectPortfolio = () => {
  const [editingKey, setEditingKey] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [addChildren, setAddChildren] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });
  const [enabledProjectPortfolio, setProjectPortfolio] = useState(true);
  const { mutateAsync: CreateProjectPortfolio } = useCreateProjectPortfolio();
  const { mutateAsync: UpdateProjectPortfolio } = useEditProjectPortfolio();
  const { mutateAsync: DeleteProjectPortfolio } = useDeleteProjectPortfolioById();
  const { data: ProjectPortfolioList, refetch: refetchProjectPortfolioList, isPending } = useGetProjectPortfolio();
  const { control, setValue, getValues } = useForm();

  useEffect(() => {
    const transformData = (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      const transformItem = (item, index, parentIndex) => {
        const newItem = {
          row: !item.ParentId ? index + 1 : `${parentIndex}.${index + 1}`,
          id: item.Id,
          key: item.Id,
          Title: item.Title,
          ParentId: item.ParentId,
        };
        if (item.Children && Array.isArray(item.Children)) {
          newItem.children = item.Children.map((child, childIndex) => transformItem(child, childIndex, newItem.row));
        }
        return newItem;
      };
      return data.map(transformItem);
    };
    const transformedData = transformData(ProjectPortfolioList?.data);

    setDataSource(transformedData);
  }, [ProjectPortfolioList]);

  const handleAddChild = async (record) => {
    const hasKeyZero = dataSource.some((item) => item.key === 0);
    if (hasKeyZero || editingKey) {
      setChecked(true);
      return;
    }
    dataSource.forEach((item) => {
      if (item.key !== 0) {
        if (!addChildren) {
          setAddChildren(true);
          // setEnabledCategory(false);
          setValue('ParentId', record.id);
          const newChild = {
            id: Math.random(),
            key: Math.random(),
            isChild: true,
          };

          const newDataSource = (childData, parentId) => {
            return childData.map((childItem) => {
              if (childItem.id === parentId) {
                return {
                  ...childItem,
                  children: [newChild, ...(childItem.children || [])],
                };
              } else if (childItem.children) {
                return {
                  ...childItem,
                  children: newDataSource(childItem.children, parentId),
                };
              }
              return childItem;
            });
          };

          const updatedDataSource = newDataSource(dataSource, record.id);
          setDataSource(updatedDataSource);
        }

        if (!expandedRowKeys.includes(record.key)) {
          setExpandedRowKeys([...expandedRowKeys, record.key]);
        }
      }
    });
    setAddChildren(false);
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
      return editingKey === record.key || record.isNew || record.isChild ? (
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
      sorter: (a, b) => a.row - b.row,
      sortOrder: sortedInfo.columnKey === 'row' ? sortedInfo.order : null,
      ellipsis: true,
      render: (text, record) => {
        return (
          <span
            className={` ${expandedRowKeys.includes(record.id) && 'parentStyle'} 
            ${record.ParentId && record.children?.length === 0 && 'childStyle'}`}
            style={{
              marginRight:
                record.ParentId && record.ParentId <= 8 && record.children?.length === 0
                  ? `${record.row.length * 11}px`
                  : !record.ParentId && record.children?.length === 0
                    ? `30px`
                    : record.ParentId && record.ParentId >= 18 && record.children?.length === 0
                      ? `${record.row.length * 10}px`
                      : '',
            }}
          >
            {record.row}
          </span>
        );
      },
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
        if (editingKey === record.id || record.isNew || record.isChild) {
          return (
            <div size='middle ' className='gap-3 flex justify-center content-center'>
              <div>
                <FiCheck className='size-5' onClick={() => handleSaveProjectPortfolio(record)} />
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
                <FaRegTrashCan className='h-4 w-4  cursor-pointer' onClick={() => handleDelete(record.id)} />
              </div>
              <div className='mouseCursor'>
                <PiTreeStructure className='h-5 w-5  cursor-pointer' onClick={() => handleAddChild(record)} />
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
      setEditingKey(record.id);
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
            await DeleteProjectPortfolio(id);
            refetchProjectPortfolioList();

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
          refetchProjectPortfolioList();
        } else {
          refetchProjectPortfolioList();
          setEditingKey(null);
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
  const handleSaveProjectPortfolio = async (record) => {
    const Title = getValues('Title');
    if (!Title) {
      setChecked(true); // نمایش تولتیپ خطا
      return;
    }

    try {
      if (record.isNew || record.isChild) {
        const newProjectPortfolio = {
          Title,
          ParentId: getValues('ParentId') || null,
        };

        const { data } = await CreateProjectPortfolio(newProjectPortfolio);
        if (data.isSuccess) {
          toast.success('واحد سازمانی با موفقیت ایجاد شد.');
        } else {
          toast.error(data.message);
        }
      } else {
        const updatedProjectPortfolio = {
          Id: record.id,
          Title,
          ParentId: getValues('ParentId') || null,
        };
        const { data } = await UpdateProjectPortfolio(updatedProjectPortfolio);
        if (data.isSuccess) {
          toast.success('واحد سازمانی با موفقیت ویرایش شد.');
        } else {
          toast.error(data.message);
        }
      }

      setEditingKey(null);
      setValue('Title', '');
      setValue('ParentId', null);
      setChecked(false);
      refetchProjectPortfolioList(); // بازخوانی داده‌ها
    } catch (error) {
      toast.error('خطا در ذخیره سبد طراحی/پروژه');
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
        onChange={handleTableChange}
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
        scroll={{ y: 300 }}
        rowClassName={(record, index) => {
          let rowClass = index % 2 === 0 ? 'table-row-light custom-expandable-row treeTable' : 'table-row-dark custom-expandable-row treeTable';
          return rowClass;
        }}
        expandable={{
          expandIcon: ({ expanded, onExpand, record }) =>
            record.children &&
            record.children.length >= 1 && (
              <span onClick={(e) => onExpand(record, e)} className='inline-block ml-3' role='button'>
                {expanded ? <IoMdArrowDropleft size={20} className='-rotate-90' /> : <IoMdArrowDropleft size={20} />}
              </span>
            ),
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [...expandedRowKeys, record.key] : expandedRowKeys.filter((key) => key !== record.key));
          },
        }}
        // onRow={(record) => ({
        //   draggable: true,
        //   onDoubleClick: () => handleRowClick(record),
        //   onDragStart: () => handleDragStart(record),
        //   onDragOver: (e) => handleDragOver(e, record),
        //   onDrop: () => handleDrop(record),
        // })}
      />
      <Toaster />
    </>
  );
};

export default ProjectPortfolio;
