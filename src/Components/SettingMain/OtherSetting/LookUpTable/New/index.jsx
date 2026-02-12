import React, { useState, useEffect, useRef } from 'react';

import { Table, Button, Popconfirm, Input, Form, Empty, Space, Modal, Tooltip } from 'antd';

import toast, { Toaster } from 'react-hot-toast';

import Highlighter from 'react-highlight-words';

import { useCreateLookUpTable, useGetLookUpTable, useEditLookUpTable, useDeleteLookUpTableById } from '../../../../../ApiHooks/OtherSetting/LookUpTable';

import { CloseOutlined, PlusCircleFilled, DeleteTwoTone, EditTwoTone, CheckOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';

import LookUpTableInside from './LookUpTableInside.jsx';

const LookUpTable = () => {
  const [dataSource, setDataSource] = useState([]);

  const [count, setCount] = useState(0);

  const [editingKey, setEditingKey] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const { data: Datas, refetch: Refetch, isLoading, isError } = useGetLookUpTable();
  // console.log(isLoading);
  console.log(isError);

  const { mutateAsync: deleted } = useDeleteLookUpTableById();

  const { mutateAsync: create } = useCreateLookUpTable();

  const { mutateAsync: update } = useEditLookUpTable();

  /**

     * این برای این هست که اگر شخص سطری را اضافه کرد

     * ولی قبل ذخیره کردن سطر کنسل کرد آن سطر حذف شود

     */

  const [inAddMode, setInAddModel] = useState(false);

  /**

     * برای این است که مانع اضافه کردن پی درپی سطر ها شود

     * و شخص تا سطری را ثبت نکرده نتواند سطر دیگری را ثبت کند

     */

  const [addNewRow, setAddNewRow] = useState(true);

  /*

       برای این است اگر مقدار داخل فیلد تغییر کرد

        ولی ما نخواستیم تغییرات اعمال شود

         مقدار قبلی جایگذاری شود 

       */

  const [tempData, setTempData] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalValue, setModalValue] = useState(null);

  //#region searchTabel

  const searchInput = useRef(null);

  const [searchText, setSearchText] = useState('');

  const [searchedColumn, setSearchedColumn] = useState('');

  const [checked, setChecked] = useState(false);

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
    filterDropdown: ({
      setSelectedKeys,

      selectedKeys,

      confirm,

      clearFilters,

      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`جستوجو`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />

        <Space>
          <Button type='primary' onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>
            جستوجو
          </Button>

          <Button onClick={() => clearFilters && handleReset(clearFilters, selectedKeys, confirm, dataIndex)} size='small' style={{ width: 90 }}>
            بازنشانی
          </Button>
        </Space>
      </div>
    ),

    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,

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
  });

  //#endregion

  //#region function

  const AddInside = (record) => {
    setIsModalOpen(true);

    setModalValue(record);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  //#endregion

  const [form] = Form.useForm();

  const columns = [
    {
      title: 'ردیف',

      render: (text, record, index) => record.row + 1,
    },

    {
      title: 'عنوان',

      dataIndex: 'Title',

      sorter: (a, b) => a.title?.localeCompare(b.title),

      ...getColumnSearchProps('title'),

      render: (text, record, index) => {
        return editingKey === record.Id ? (
          <Form.Item
            name='title'
            rules={[
              {
                required: true,

                message: 'عنوان ضروری است!',
              },
            ]}
            style={{ margin: 0 }}
          >
            <Input value={tempData.Title} onChange={(e) => handleFieldChange(e.target.value, index, 'title')} style={{ margin: '0px' }} />
          </Form.Item>
        ) : searchedColumn === 'title' ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',

              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={record.title ? record.title.toString() : ''}
          />
        ) : (
          text
        );
      },
    },

    {
      title: 'عملیات',

      render: (_, record, index) => {
        return editingKey === record.Id ? (
          <>
            <Button type='link' icon={<CheckOutlined style={{ color: '#1677ff' }} />} onClick={() => handleSave(index)}></Button>

            {inAddMode ? (
              <>
                <Button type='link' icon={<CloseOutlined style={{ color: '#f93e3e' }} />} onClick={() => handleDoNotSave(index)}></Button>
              </>
            ) : (
              <>
                <Button type='link' icon={<CloseOutlined style={{ color: '#f93e3e' }} />} onClick={() => handleCancel(index)}></Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button type='link' icon={<EditTwoTone twoToneColor='#1677ff' />} onClick={() => handleEdit(index)}></Button>

            <Tooltip title='مقادیر جدول'>
              <Button type='link' icon={<PlusOutlined style={{ color: '#5b8c00' }} />} onClick={() => AddInside(record)} />
            </Tooltip>

            <Popconfirm title='آیا از حذف این مورد مطمئن هستید؟' onConfirm={() => handleDelete(index)}>
              <Button type='link' icon={<DeleteTwoTone twoToneColor='#f93e3e' />} danger></Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const handleFieldChange = (value, index, field) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (addNewRow) {
      setInAddModel(true);

      const newData = {
        Id: '00000000-0000-0000-0000-000000000000',

        row: -1,

        title: '',
      };

      if (currentPage === 1) {
        Datas?.data?.unshift(newData);
      } else {
        Datas?.data?.splice(currentPage * 10 - 10, 0, newData);
      }

      setTempData({ title: '' });

      setEditingKey('00000000-0000-0000-0000-000000000000');

      //setCount(Datas.data.length + 1);

      setAddNewRow(false);

      form.resetFields();
    }
  };

  const handleDoNotSave = (index) => {
    setInAddModel(false);

    setAddNewRow(true);

    Datas.data = Datas.data.filter((_, i) => i !== index);
  };

  const handleEdit = (index) => {
    //

    const current = currentPage * 10 - 10 + index;

    setInAddModel(false);

    setTempData({
      title: Datas.data[current].title,
    });

    form.setFieldsValue({
      title: Datas.data[current].title,
    });

    setEditingKey(Datas.data[current].Id);
  };

  const handleSave = async (index) => {
    const current = currentPage * 10 - 10 + index;

    form

      .validateFields()

      .then((values) => {
        const newData = [...Datas.data];

        newData[current] = { ...newData[current], ...values };

        newData[current].row = Datas.data.length;

        const currentData = {
          Id: Datas.data[current].Id,

          row: Datas.data[current].row,

          Title: values.title,
        };

        if (inAddMode) {
          SaveData(currentData);

          return;
        }

        UpdateData(currentData);

        setDataSource(newData);

        setEditingKey(null);

        form.resetFields();

        setAddNewRow(true);
      })

      .catch((errorInfo) => {
        //   console.log('Validation Failed:', errorInfo);

        handleError(count);

        setAddNewRow(false);
      });
  };

  const SaveData = async (data) => {
    try {
      let { data: result, status } = await create(data);

      if (status === 200) {
        if (result.isSuccess === true) {
          await Refetch();

          toast.success(`${result.message}`);

          setEditingKey(null);

          form.resetFields();

          setAddNewRow(true);

          return;
        }

        toast.error(`${result.message} !`);

        return;
      }
    } catch (error) {
      toast.error(`${error.message} !`);
    }
  };

  const UpdateData = async (data) => {
    try {
      let { data: result, status } = await update(data);

      if (status === 200) {
        if (result.isSuccess === true) {
          await Refetch();

          toast.success(`${result.message}`);

          setEditingKey(null);

          form.resetFields();

          setAddNewRow(true);

          setInAddModel(true);

          return;
        }

        toast.error(`${result.message}`);

        return;
      }
    } catch (error) {
      toast.error(`${error.message}`);
    }
  };

  const handleCancel = (index) => {
    setEditingKey(null);

    setAddNewRow(true);

    setTempData({});

    form.resetFields();
  };

  const handleDelete = async (index) => {
    const data = Datas.data[index].Id;

    let { data: result, status } = await deleted(data);

    if (status === 200) {
      if (result.isSuccess === true) {
        toast.success(`${result.message}`);

        await Refetch();

        setEditingKey(null);

        form.resetFields();

        setAddNewRow(true);

        setInAddModel(true);

        return;
      }

      toast.error(`${result.item1} !`);

      return;
    }
  };

  const handleError = (index) => {
    setAddNewRow(true);

    const newData = dataSource.splice(index, 1);

    setDataSource(newData);
  };

  const handlePageChange = (page) => {
    // console.log(page);

    setCurrentPage(page);
  };

  return (
    <>
      <Button onClick={handleAdd} type='primary' style={{ marginBottom: 16, fontFamily: 'vazir', float: 'right' }}>
        <PlusCircleFilled style={{ fontSize: '20px', cursor: 'pointer' }} className='' />
        اضافه کردن
      </Button>

      <Form form={form} component={false}>
        <Table
          Id='table-1'
          dataSource={Datas?.data}
          columns={columns}
          rowKey='key'
          pagination={{
            pageSize: 10,

            onChange: handlePageChange,
          }}
          locale={{
            emptyText: <Empty description={'بدون داده'} />,
          }}
        />
      </Form>

      <Modal open={isModalOpen} footer={null} title={modalValue?.title} onCancel={handleClose} width={1000} className='initTableModal'>
        <LookUpTableInside lookUp={modalValue} />
      </Modal>

      <Toaster />
    </>
  );
};

export default LookUpTable;
