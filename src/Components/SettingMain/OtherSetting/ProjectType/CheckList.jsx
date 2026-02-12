import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Popconfirm, Input, Form, Select, Empty, Space, Checkbox, Switch } from 'antd';
import toast, { Toaster } from 'react-hot-toast';
import { CloseOutlined, SearchOutlined, DeleteTwoTone, EditTwoTone, CheckOutlined, PlusCircleFilled } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
// import { LightTheme } from "../../helpers/Colors.js";
const CheckList = ({ contractType }) => {
  //#region services

  //#endregion
  //#region  useStates
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(0);
  const [editingKey, setEditingKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [LookUptabel, setLookUptabel] = useState([]);
  const [DataGeted, setDataGeted] = useState(false);
  const [Types, setTypes] = useState([
    { label: 'متن', value: 'input' },
    { label: 'تاریخ', value: 'date' },
    { label: 'عدد', value: 'number' },
    { label: 'چک باکس', value: 'check' },
    {
      label: <span>جداول مراجعه‌ای</span>,
      title: 'جداول مراجعه‌ای',
      value: 'lookUpTable',
      options: [],
    },
  ]);

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
  /**
   *
   * برای چک کردن ولیدیشن ها
   */
  const [form] = Form.useForm();
  //#endregion
  //#region  useEffects

  //#endregion
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

  const getColumnSearchProps = (dataIndex, DataType) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
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
        if (
          record[dataIndex] &&
          record[dataIndex]
            ?.toString()
            ?.toLowerCase()
            ?.includes(value?.toLowerCase() && record[dataIndex] !== 'type')
        ) {
          return true;
        }
        if (DataType === 'select') {
          if (record[dataIndex] === 'lookUpTable') {
            if (record[dataIndex] && Types?.find((item) => item.value === record[dataIndex])?.options.find((item) => item.label.includes(value?.toLowerCase()))) {
              return true;
            }
            // if(record[dataIndex] && Types?.find(item => item.value === record[dataIndex])?.title.includes(value?.toLowerCase())) {
            //     return true;
            // }
            return false;
          }
          if (record[dataIndex] && Types?.find((item) => item.value === record[dataIndex])?.label.includes(value?.toLowerCase())) {
            return true;
          }
          return false;
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
  //#region  functions
  const handleFieldChange = (value, index, field) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (addNewRow) {
      setInAddModel(true);
      // const newData = {
      //     id: "00000000-0000-0000-0000-000000000000",
      //     row: CheckListData?.data.length + 1,
      //     title: "",
      //     isRequired: false,
      //     type: null,
      //     lookUpTableId: null,
      //     projectTypeId: cprojectType.id
      // };
      const newKey = Date.now().toString();
      const newRow = {
        key: newKey,
        id: newKey,
        title: '',
        type: '',
      };
      setDataSource([newRow, ...dataSource]);
      form.setFieldsValue(newRow);
      setEditingKey(newKey);
    }
  };
  const handleDoNotSave = (index) => {
    setInAddModel(false);
    setAddNewRow(true);
    // CheckListData.data = CheckListData.data.filter((_, i) => i !== index);
  };
  const RemoveFormInAddMode = () => {
    setAddNewRow(true);
    // CheckListData.data = CheckListData.data.filter((_, i) => _.id !== "00000000-0000-0000-0000-000000000000");
  };
  const handleEdit = (index) => {};

  const handleSave = async (index) => {
    const current = currentPage * 10 - 10 + index;
    try {
      const values = await form.validateFields();
      const newData = [...dataSource];
      newData[current] = {
        ...newData[current],
        ...values,
        row: current,
      };
      setDataSource(newData);
      setEditingKey(null);
      form.resetFields();
      setAddNewRow(true);
      toast.success('با موفقیت ذخیره شد');
    } catch {
      toast.error('لطفا فیلدها را کامل کنید');
    }
  };
  const SaveData = async (data) => {
    try {
      let { data: result, status } = await create(data);
      if (status === 200) {
        if (result.isSuccess === true) {
          toast.success(`${result.message}`);
          // await Refetch();
          setEditingKey(null);
          form.resetFields();
          setAddNewRow(true);
          return;
        }
        toast.error(`${result.message} !`);
        return;
      }
    } catch (error) {
      toast.error(`${error.message}`);
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
  const handleError = (index) => {
    setAddNewRow(true);
    const newData = dataSource.splice(index, 1);
    setDataSource(newData);
  };
  const handleDelete = async (index) => {};
  const handlePageChange = (page) => {
    // console.log(page);
    setCurrentPage(page);
  };

  const TransForToSelectData = (array, name) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: 'lookUpTable-' + item.id,
      key: item.id,
    }));
    return newArray;
  };

  //#endregion
  //#region useEffect

  //#endregion
  const columns = [
    {
      title: 'ردیف',
      render: (text, record, index) => record.row,
    },
    {
      title: 'عنوان',
      dataIndex: 'title',
      sorter: (a, b) => a.title?.localeCompare(b.title),
      ...getColumnSearchProps('title'),
      render: (text, record, index) => {
        return editingKey === record.id ? (
          <Form.Item
            name='title'
            rules={[
              {
                required: true,
                message: 'عنوان  ضروری است!',
              },
            ]}
            style={{ margin: 0 }}
          >
            <Input value={tempData.title} onChange={(e) => handleFieldChange(e.target.value, index, 'title')} style={{ margin: '0px' }} />
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
      title: 'نوع',
      dataIndex: 'type',
      width: 250,
      sorter: (a, b) => {
        const after = Types?.find((item) => item.value === a.type)?.label;
        const before = Types?.find((item) => item.value === b.type)?.label;
        return after.localeCompare(before);
      },
      ...getColumnSearchProps('type', 'select'),
      render: (text, record, index) => {
        //
        return editingKey === record.id ? (
          <Form.Item
            name='type'
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: 'نوع چک لیست ضروری است!',
              },
            ]}
          >
            <Select
              allowClear
              labelInValue={true}
              style={{ width: '100%' }}
              options={Types}
              // labelRender={(label) => {
              //
              //     const value = label.key ? label.value.includes("lookUpTable") ? lookUpData?.data?.find(x => x.id === label.key)?.title : Types.find(x => x.value === label.value)?.label
              //         : label.value.includes("lookUpTable") ? lookUpData?.data?.find(x => x.id === record.lookUpTableId)?.title : Types.find(x => x.value === record.type)?.label;
              //     //const value =  record.type === "lookUpTable" ? lookUpData?.data?.find(x => x.id === record.lookUpTableId)?.title : Types.find(x => x.value === record.type).label;
              //     return value;
              // }}
              // notFoundContent={<Empty description={"بدون داده"} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            />
          </Form.Item>
        ) : searchedColumn === 'type' ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={
              record.type
                ? record.type === 'lookUpTable'
                  ? Types.find((x) => x.value === record.type)?.title.toString() + ' (' + lookUpData?.data?.find((x) => x.id === record.lookUpTableId)?.title.toString() + ')'
                  : Types.find((x) => x.value === record.type)?.label.toString()
                : ''
            }
          />
        ) : record.type === 'lookUpTable' ? (
          <>{Types.find((x) => x.value === record.type)?.title + ' (' + lookUpData?.data?.find((x) => x.id === record.lookUpTableId)?.title + ')'}</>
        ) : (
          Types.find((x) => x.value === record.type)?.label
        );
      },
    },
    {
      title: 'ضروری بودن',
      dataIndex: 'isRequired',
      render: (text, record, index) => {
        return editingKey === record.id ? (
          <Form.Item name='isRequired' style={{ margin: 0 }}>
            <Switch defaultChecked={false} />
            {/* <Checkbox checked={record.isRequired}></Checkbox> */}
          </Form.Item>
        ) : record.isRequired ? (
          <CheckOutlined style={{ color: 'red' }} />
        ) : (
          <></>
        );
      },
    },
    {
      title: 'عملیات',
      render: (_, record, index) => {
        return editingKey === record.id ? (
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
            <Popconfirm title='آیا از حذف این مورد مطمئن هستید؟' onConfirm={() => handleDelete(index)}>
              <Button type='link' icon={<DeleteTwoTone twoToneColor='#f93e3e' />} danger></Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];
  return (
    <>
      <Button onClick={handleAdd} type='primary' style={{ marginBottom: 16, fontFamily: 'vazir', float: 'right' }}>
        <PlusCircleFilled style={{ fontSize: '20px', cursor: 'pointer' }} className='' />
        اضافه کردن
      </Button>
      <Form form={form} component={false}>
        <Table
          // dataSource={CheckListData?.data}
          dataSource={dataSource} //دیتای ماک
          columns={columns}
          rowKey='key'
          pagination={{
            pageSize: 10,
            onChange: handlePageChange,
          }}
          locale={{
            emptyText: <Empty description={'بدون داده'} />,
          }}
          onRow={(record, index) => ({
            // style: {
            //     background:
            //         index % 2 === 0
            //             ? LightTheme.coloredRowTable
            //             : LightTheme.lightyRowTable,
            // },
          })}
        />
      </Form>
      <Toaster />
    </>
  );
};
export default CheckList;
