import React, { useState, useEffect, useRef } from 'react';

import { Table, Space, Input, Button, Form, Popconfirm, Empty } from 'antd';

import toast, { Toaster } from 'react-hot-toast';

import { CloseOutlined, PlusOutlined, DeleteTwoTone, EditTwoTone, CheckOutlined, PlusCircleFilled, SearchOutlined } from '@ant-design/icons';

import { useCreateLookUpTable, useGetAllLookUpTableInside, useEditLookUpTable, useDeleteLookUpTableById } from '../../../../../ApiHooks/OtherSetting/LookUpTable';

import Highlighter from 'react-highlight-words';

const LookUpTableInside = ({ lookUp }) => {
  const [expandedKeys, setExpandedKeys] = useState([]);

  const [initform] = Form.useForm();

  const [inAddMode, setInAddMode] = useState(false);

  const [addNewRow, setAddNewRow] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const emptyGuid = '00000000-0000-0000-0000-000000000000';

  const { mutateAsync: created } = useCreateLookUpTable();

  const { mutateAsync: updated } = useEditLookUpTable();

  const { data: InsideData, refetch: Refetch, isLoading } = useGetAllLookUpTableInside(lookUp.Id);

  const { mutateAsync: deleted } = useDeleteLookUpTableById();

  useEffect(() => {
    setData([]);

    Refetch(lookUp.Id);
  }, [Refetch, lookUp.Id]);

  useEffect(() => {
    const transformData = (data) => {
      if (!Array.isArray(data)) {
        return [];
      }

      const transformItem = (item, index, parentIndex) => {
        const newItem = {
          key: item.key,

          parentKey: item.parentKey,

          title: item.title,

          lookUpTableId: item.lookUpTableId,
        };

        if (item.children && Array.isArray(item.children)) {
          newItem.children = item.children.map((child, childIndex) => transformItem(child, childIndex));
        }

        return newItem;
      };

      return data.map(transformItem);
    };

    const transformedData = transformData(InsideData?.data);

    setData(transformedData);
  }, [InsideData]);

  const [datas, setData] = useState([]);

  const [editingKey, setEditingKey] = useState('');

  const [tempData, setTempData] = useState(null);

  const isEditing = (record) => record.key === editingKey;

  //#region searchTabel

  const searchInput = useRef(null);

  const [searchText, setSearchText] = useState('');

  const [searchedColumn, setSearchedColumn] = useState('');

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

  const columnsinit = [
    {
      title: 'ردیف',

      width: '12%', // Adjust width as needed

      render: (_, __, index) => <span className='d-flex w-100 justify-content-center'>{__.row}</span>, // Display the row number (1-based index)
    },

    {
      title: 'عنوان',

      dataIndex: 'title',

      width: '40%',

      sorter: (a, b) => a.title?.localeCompare(b.title),

      ...getColumnSearchProps('title'),

      render: (_, record) => {
        const editing = isEditing(record);

        return editing ? (
          <Form.Item name='title' style={{ margin: 0 }} rules={[{ required: true, message: 'این فیلد اجباری است' }]}>
            <Input />
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
          record.title
        );
      },
    },

    {
      title: 'عملیات',

      render: (_, record, index) => {
        const editing = isEditing(record);

        return (
          <Space>
            {editing ? (
              <>
                <Button type='link' icon={<CheckOutlined style={{ color: '#1677ff' }} />} onClick={() => save(record.key)} />

                {inAddMode ? (
                  <>
                    <Button
                      type='link'
                      icon={<CloseOutlined style={{ color: '#f93e3e' }} />}
                      onClick={() => {
                        doNotSave(record.parentKey, record.key);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button type='link' icon={<CloseOutlined style={{ color: '#f93e3e' }} />} onClick={cancel} />
                  </>
                )}
              </>
            ) : (
              <>
                <Button type='link' icon={<EditTwoTone twoToneColor='#1677ff' />} onClick={() => edit(record)} />

                <Button type='link' icon={<PlusOutlined style={{ color: '#5b8c00' }} />} onClick={() => addChild(record, record.key)} />

                <Popconfirm title='آیا از حذف این مورد مطمئن هستید؟' onConfirm={() => deleteNode(record.key)}>
                  <Button type='link' icon={<DeleteTwoTone twoToneColor='#f93e3e' />} />
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const edit = (record) => {
    initform.setFieldsValue({ title: record.title });

    setEditingKey(record.key);

    setTempData({ ...record });
  };

  const cancel = () => {
    //

    setEditingKey('');

    if (tempData) {
      const updateData = (items) => {
        return items.map((item) => {
          if (item.key === tempData.key) {
            return tempData;
          }

          if (item.children) {
            return {
              ...item,

              children: updateData(item.children),
            };
          }

          return item;
        });
      };

      setData(updateData(datas));
    }
  };

  const doNotSave = (parentKey = null, key) => {
    //

    setInAddMode(false);

    setAddNewRow(true);

    if (parentKey) {
      setData(removeNodeById(datas, key));

      return;
    }

    setData(datas.filter((_, i) => _.key !== key));
  };

  const save = async (key) => {
    try {
      initform

        .validateFields()

        .then(async (values) => {
          let newData = {
            ...tempData,

            ...values,
          };

          if (tempData.parentKey === null || tempData.parentKey === undefined) {
            newData.parentKey = null;
          }

          if (newData?.children !== undefined && newData?.children.length > 0) {
            newData.children = [];
          }

          if (inAddMode) {
            let { data: result } = await created(newData);

            if (result.isSuccess) {
              toast.success(result.message);

              Refetch();

              setEditingKey('');

              setTempData(null);

              setInAddMode(false);

              setAddNewRow(true);

              return;
            }

            toast.error(result.message);

            return;
          }

          let { data: result } = await updated(newData);

          if (result.isSuccess) {
            toast.success(result.message);

            Refetch();

            setEditingKey('');

            setTempData(null);

            setInAddMode(false);

            setAddNewRow(true);

            return;
          }

          toast.error(result.message);
        })

        .catch((errorInfo) => {
          toast.error('خطا در اتصال به سرور !');

          setAddNewRow(false);
        });
    } catch (errInfo) {
      toast.error('خطا در ثبت اطلاعات');
    }
  };

  const removeNodeById = (data, idToRemove) => {
    return data.reduce((acc, node) => {
      if (node.key === idToRemove) {
        return acc;
      }

      if (node.children) {
        const filteredChildren = removeNodeById(node.children, idToRemove);

        acc.push({
          ...node,

          children: filteredChildren,
        });
      } else {
        acc.push(node);
      }

      return acc;
    }, []);
  };

  const addChild = (parent, parentKey) => {
    //

    setInAddMode(true);

    setAddNewRow(false);

    if (addNewRow) {
      const newChild = {
        key: emptyGuid,

        parentKey: parentKey,

        title: '',

        lookUpTableId: lookUp.Id,
      };

      if (!expandedKeys.includes(parentKey)) {
        setExpandedKeys([...expandedKeys, parentKey]);
      }

      const updateData = (items) => {
        return items.map((item) => {
          if (item.key === parentKey) {
            return {
              ...item,

              children: [...(item.children || []), newChild],
            };
          }

          if (item.children) {
            return {
              ...item,

              children: updateData(item.children),
            };
          }

          return item;
        });
      };

      setData(updateData(datas));

      edit(newChild);
    }
  };

  const addParent = () => {
    //

    if (addNewRow) {
      const newParent = {
        key: emptyGuid,

        title: '',

        lookUpTableId: lookUp.Id,
      };

      if (currentPage === 1) {
        datas?.unshift(newParent);
      } else {
        datas?.splice(currentPage * pageSize - pageSize, 0, newParent);
      }

      setInAddMode(true);

      edit(newParent);

      setAddNewRow(false);
    }
  };

  const deleteNode = async (key) => {
    try {
      let { data: result } = await deleted(key);

      if (result.isSuccess === true) {
        await Refetch();

        toast.success(`${result.message}`);

        return;
      }
    } catch (error) {
      toast.error(`${'خطا در حذف'}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className='credit-source-form-setting'>
      <Form form={initform} component={false}>
        <Button type='primary' onClick={addParent} style={{ marginBottom: 16, fontFamily: 'vazir', float: 'right' }}>
          <PlusCircleFilled style={{ fontSize: '20px', cursor: 'pointer' }} className='' />
          اضافه کردن
        </Button>

        <Table
          Id='table-2'
          columns={columnsinit}
          dataSource={datas}
          pagination={{
            pageSize: pageSize,

            current: currentPage,

            onChange: handlePageChange,
          }}
          expandable={{
            expandedRowKeys: expandedKeys,

            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedKeys([...expandedKeys, record.key]);
              } else {
                setExpandedKeys(expandedKeys.filter((key) => key !== record.key));
              }
            },
          }}
          locale={{
            emptyText: <Empty description={'بدون داده'} />,
          }}
        />
      </Form>

      <Toaster />
    </div>
  );
};

export default LookUpTableInside;
