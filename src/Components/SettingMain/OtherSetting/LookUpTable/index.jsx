import React, { useState, useRef, useEffect } from 'react';
import { Table, Button, Popconfirm, Input, Form, Empty, Space, Modal, Tooltip } from 'antd';
import toast from 'react-hot-toast';
import Highlighter from 'react-highlight-words';
import { CloseOutlined, PlusCircleFilled, DeleteTwoTone, EditTwoTone, CheckOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import CustomModal from '../../../CustomModal';
import LookUpTableInside from '../LookUpTableInside';
import { IoAddCircleOutline } from 'react-icons/io5';
import { handleAddId, handleShowModal } from '../../../../features/Modal/ModalSlice';
import { useSelector, useDispatch } from 'react-redux';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';
import { PiTreeStructure } from 'react-icons/pi';
import { useGetLookUpTable, useEditLookUpTable, useDeleteLookUpTableById, useCreateLookUpTable } from '../../../../ApiHooks/OtherSetting/LookUpTable';

const LookUpTable = () => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const { data: LookUpTabledata, refetch: refetchGetLookUpTable } = useGetLookUpTable();
  const { mutate: UpdateLookupTable } = useEditLookUpTable();
  const { mutate: CreateLookUpTable } = useCreateLookUpTable();
  const [dataSource, setDataSource] = useState([]);
  const { mutate: DeleteLookUpTable } = useDeleteLookUpTableById();

  useEffect(() => {
    if (LookUpTabledata) {
      console.log(LookUpTabledata.data);
      setDataSource(LookUpTabledata.data);
    }
  }, [LookUpTabledata]);

  const [editingKey, setEditingKey] = useState(null);
  const [inAddMode, setInAddModel] = useState(false);
  const [addNewRow, setAddNewRow] = useState(true);
  const [tempData, setTempData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const statusModal = useSelector((state) => state.Modal.statusModal);
  const searchInput = useRef(null);

  const handleAdd = () => {
    if (!addNewRow) return;
    setInAddModel(true);
    const newData = {
      Id: 'null',
      row: dataSource.length,
      Title: '', // Changed from 'title' to 'Title' for consistency
    };
    const newDataSource = [...dataSource];
    const insertIndex = currentPage === 1 ? 0 : currentPage * 10 - 10;
    newDataSource.splice(insertIndex, 0, newData);
    setDataSource(newDataSource);
    setTempData({ Title: '' }); // Changed from 'title' to 'Title'
    setEditingKey(newData.Id);
    setAddNewRow(false);
    form.setFieldsValue({ Title: '' }); // Initialize form field
  };

  const handleEdit = (index) => {
    const current = currentPage * 10 - 10 + index;
    setInAddModel(false);
    const item = dataSource[current];
    console.log(item);

    setTempData({ Title: item.Title }); // Changed from 'title' to 'Title'
    form.setFieldsValue({ Title: item.Title }); // Properly set form field value
    setEditingKey(item.Id);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setAddNewRow(true);
    setTempData({});
    form.resetFields();
  };

  const handleDoNotSave = (index) => {
    const newData = [...dataSource];
    newData.splice(index, 1);
    setDataSource(newData);
    setInAddModel(false);
    setAddNewRow(true);
    setEditingKey(null);
  };

  const handleSave = async (record) => {
    try {
      const values = await form.validateFields();
      const newData = [...dataSource];
      const itemIndex = newData.findIndex((obj) => obj.Id === record.Id);

      if (itemIndex !== -1) {
        newData[itemIndex] = {
          ...newData[itemIndex],
          Title: values.Title,
          row: record.row,
        };
      }

      if (record.Id === 'null') {
        CreateLookUpTable(
          {
            Id: '00000000-0000-0000-0000-000000000000',
            Title: values.Title,
            row: record.row,
          },
          {
            onSuccess: () => {
              refetchGetLookUpTable();
              toast.success('جدول مرجع با موفقیت ایجاد شد');
            },
            onError: () => {
              toast.error('خطا در ایجاد جدول مرجع');
            },
          },
        );
      } else {
        UpdateLookupTable(
          {
            Id: record.Id,
            Title: values.Title,
            row: record.row,
          },
          {
            onSuccess: () => {
              refetchGetLookUpTable();
              toast.success('جدول مرجع با موفقیت به‌روزرسانی شد');
            },
            onError: () => {
              toast.error('خطا در به‌روزرسانی جدول مرجع');
            },
          },
        );
      }

      setDataSource(newData);
      setEditingKey(null);
      form.resetFields();
      setAddNewRow(true);
      toast.success('با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('لطفا فیلدها را کامل کنید');
    }
  };

  const handleDelete = (index, record) => {
    const current = currentPage * 10 - 10 + index;
    const newData = [...dataSource];
    newData.splice(current, 1);
    DeleteLookUpTable(record.Id, {
      onSuccess: () => {
        refetchGetLookUpTable();
        toast.success('با موفقیت حذف شد');
      },
      onError: () => {
        toast.error('خطا در حذف جدول مرجع');
      },
    });

    setDataSource(newData);
  };

  const handleFieldChange = (value, index, field) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const AddInside = ({ record, name }) => {
    dispatch(handleShowModal(name));
    dispatch(handleAddId(record.Id));
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder='جستجو'
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button type='primary' onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>
            جستجو
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            پاک کردن
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  const columns = [
    {
      title: 'ردیف',
      render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
      width: 90,
      align: 'center',
    },
    {
      title: 'عنوان',
      dataIndex: 'Title',
      sorter: (a, b) => a.Title?.localeCompare(b.Title),
      ...getColumnSearchProps('Title'),
      render: (text, record, index) =>
        editingKey === record.Id ? (
          <Form.Item name='Title' rules={[{ required: true, message: 'عنوان ضروری است!' }]} style={{ margin: 0 }}>
            <Input value={tempData.Title} onChange={(e) => handleFieldChange(e.target.value, index, 'Title')} placeholder='عنوان را وارد کنید' />
          </Form.Item>
        ) : searchedColumn === 'Title' ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={record.Title ? record.Title.toString() : ''}
          />
        ) : (
          text
        ),
    },
    {
      title: 'عملیات',
      align: 'center',
      width: 150,
      render: (_, record, index) => {
        const current = currentPage * 10 - 10 + index;
        return editingKey === record.Id ? (
          <Space>
            <Tooltip title='ذخیره'>
              <Button icon={<CheckOutlined />} type='text' onClick={() => handleSave(record)} />
            </Tooltip>
            <Tooltip title='لغو'>
              <Button icon={<CloseOutlined />} type='text' onClick={() => (inAddMode ? handleDoNotSave(current) : handleCancel())} />
            </Tooltip>
          </Space>
        ) : (
          <Space>
            <Tooltip title='ویرایش'>
              <Button type='text' icon={<MdOutlineEdit />} onClick={() => handleEdit(index)} />
            </Tooltip>

            <Popconfirm title='آیا مطمئن هستید که می‌خواهید حذف کنید؟' onConfirm={() => handleDelete(index, record)} okText='بله' cancelText='خیر'>
              <Tooltip title='حذف'>
                <Button type='text' icon={<FaRegTrashCan />} />
              </Tooltip>
            </Popconfirm>
            <Tooltip title='افزودن مقادیر'>
              <Button type='text' icon={<PiTreeStructure />} onClick={() => AddInside({ record, name: 'LookUpTableInside' })} />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

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
      {statusModal === 'LookUpTableInside' && <CustomModal Component={<LookUpTableInside />} width={'50%'} title='' />}
      <Form form={form} component={false}>
        <Table
          bordered
          dataSource={dataSource}
          columns={columns}
          size='small'
          rowKey='Id'
          pagination={{
            pageSize: 10,
            current: currentPage,
            onChange: handlePageChange,
          }}
          locale={{ emptyText: <Empty description='داده‌ای وجود ندارد' /> }}
        />
      </Form>
    </>
  );
};

export default LookUpTable;
