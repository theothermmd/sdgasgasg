import { Button, Descriptions, Input, Select, Space, Table, Tooltip, Form } from 'antd';
import React, { useRef, useState, useEffect, useContext } from 'react';
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
import {
  useGetProjectCostDistribution,
  useCreateProjectCostDistribution,
  useDeleteProjectCostDistributionById,
  useEditProjectCostDistribution,
} from '../../../ApiHooks/ProjectCostDistribution';
import Title from 'antd/es/skeleton/Title';
import Highlighter from 'react-highlight-words';
import DatePicker from 'react-multi-date-picker';
import moment from 'moment-jalaali';
const Costs = () => {
  //#region state
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [ProjectCostDistributionData, setProjectCostDistributionData] = useState([]);
  const searchInput = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({
    columnKey: null,
    order: null,
  });
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      CommittedDate: moment().format('jYYYY/jMM/jDD'),
    },
  });
  //#endregion

  //#region features
  const projectchartId = useSelector((state) => state.ProjectChart.projectChartId);
  //#endregion
  //#region hooks
  const { data: ProjectCostDistributionList, refetch: refetchSourceRef } = useGetProjectCostDistribution(projectchartId);
  const { mutateAsync: Create } = useCreateProjectCostDistribution();
  const { mutateAsync: Update } = useEditProjectCostDistribution();
  const { mutateAsync: Delete } = useDeleteProjectCostDistributionById();
  //#endregion
  //#region functions
  const handleAdd = async (data) => {
    if (projectchartId === null) {
      toast.error(' ابتدا مایلستون را ایجاد کنید');
      return;
    }
    const newData = {
      ProjectCharterId: projectchartId,
      Title: data?.title,
      Description: data?.description,
    };
    const { data: result } = await Create(newData);
    if (result.Isuccess) {
      toast.success('اطلاعات با موفقیت ثبت شد');
      refetchSourceRef();
    }
  };
  const handleEdit = async (data) => {
    // const newData = {
    //   Id: data?.Id,
    //   ProjectCharterId: projectchartId,
    //   Title: data?.title,
    //   Description: data?.description,
    // };
    // const { data: result } = await Update(newData);
    // if (result.Isuccess) {
    //   toast.success("اطلاعات با موفقیت ویرایش شد");
    //   refetchSourceRef();
    // }
    // setInEditMode(false);
  };
  const TransformToTableData = (array) => {
    const newArray = array?.map((item) => {
      let Distribution = '';
      if (item.CostDistributionPattern === 1) {
        Distribution = moment(item.PeriodLabel)?.format('jYYYY');
      } else if (item.CostDistributionPattern === 2) {
        Distribution = handleMonth(moment(item.PeriodLabel)?.format('jYYYY/jMM')?.split('/')[1]) + ' - ' + moment(item.PeriodLabel)?.format('jYYYY/jMM')?.split('/')[0];
      } else {
        const period = item.PeriodLabel?.split('-')[0] + '-' + item.PeriodLabel?.split('-')[1];
        Distribution = handleQuarter(item.PeriodLabel?.split('-')[2]) + ' - ' + moment(period)?.format('jYYYY');
      }
      return {
        Id: item.Id,
        Distribution: Distribution,
        Cost: item.Cost,
      };
    });
    return newArray;
  };
  const handleSelectDateType = (e) => {
    if (e.value === 1) {
      const YearData = ProjectCostDistributionData?.filter((item) => item.CostDistributionPattern === 1);
      setDataSource(TransformToTableData(YearData));
    } else if (e.value === 2) {
      const MonthData = ProjectCostDistributionData?.filter((item) => item.CostDistributionPattern === 2);
      setDataSource(TransformToTableData(MonthData));
    } else {
      const QuarterData = ProjectCostDistributionData?.filter((item) => item.CostDistributionPattern === 3);
      setDataSource(TransformToTableData(QuarterData));
    }
  };
  const handleMonth = (e) => {
    if (e === '01') {
      return 'فروردین';
    } else if (e === '02') {
      return 'اردیبهشت';
    } else if (e === '03') {
      return 'خرداد';
    } else if (e === '04') {
      return 'تیر';
    } else if (e === '05') {
      return 'مرداد';
    } else if (e === '06') {
      return 'شهریور';
    } else if (e === '07') {
      return 'مهر';
    } else if (e === '08') {
      return 'آبان';
    } else if (e === '09') {
      return 'آذر';
    } else if (e === '10') {
      return 'دی';
    } else if (e === '11') {
      return 'بهمن';
    } else if (e === '12') {
      return 'اسفند';
    }
  };
  const handleQuarter = (e) => {
    if (e === 'Q1') {
      return 'بهار';
    } else if (e === 'Q2') {
      return 'تابستان';
    } else if (e === 'Q3') {
      return 'پاییز';
    } else if (e === 'Q4') {
      return 'زمستان';
    }
  };
  //#endregion
  //#region useEffect
  useEffect(() => {
    if (ProjectCostDistributionList?.data) {
      setProjectCostDistributionData(ProjectCostDistributionList?.data);
    }
  }, [ProjectCostDistributionList?.data]);
  useEffect(() => {
    if (ProjectCostDistributionData) {
      const YearData = ProjectCostDistributionData?.filter((item) => item.CostDistributionPattern === 1);
      setDataSource(TransformToTableData(YearData));
    }
  }, [ProjectCostDistributionData]);
  //#endregion
  //#region table
  const handleSave = async (row) => {
    //
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.Id === item.Id);
    if (index > -1) {
      // بررسی کنید که آیا سطر پیدا شده یا خیر
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row }); // داده جدید را جایگزین کنید
      setDataSource(newData);
    }
    const data = ProjectCostDistributionData.find((x) => x.Id === row.Id);
    // console.log(row);
    const obj = {
      Id: row?.Id,
      Cost: row.Cost,
      ProjectCharterId: projectchartId,
      PeriodLabel: data?.PeriodLabel,
      CostDistributionPattern: data?.CostDistributionPattern,
    };
    await Update(obj);
  };
  const EditableContext = React.createContext(null);
  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };
  const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
    //
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);

    useEffect(() => {
      if (editing) {
        inputRef.current?.focus();
      }
    }, [editing]);
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex], // اطمینان حاصل کنید که مقدار داده در فرم قرار می‌گیرد
      });
    };
    const save = async () => {
      try {
        await form.validateFields();
        const values = form.getFieldsValue();
        const value = form.getFieldValue(dataIndex);

        toggleEdit();
        handleSave({
          ...record,
          ...values, // حفظ اطلاعات قبلی رکورد
          value: value,
          dataIndex: dataIndex, // مقدار جدید تمام فیلدهای فرم
        });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          initialValue={record[dataIndex]}
          rules={[
            {
              required: true,
              message: `${title} ضروری است.`,
            },
            {
              validator: (_, value) => {
                if (value < 0) {
                  return Promise.reject(new Error('عدد منفی قابل قبول نیست'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div
          className='editable-cell-value-wrap'
          style={{
            paddingInlineEnd: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };
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
      title: 'دوره',
      dataIndex: 'Distribution',
      key: 'Distribution',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Distribution' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Distribution?.localeCompare(b.Distribution),
      ...getColumnSearchProps('Distribution'),
    },
    {
      title: 'هزینه اجرای پروژه',
      dataIndex: 'Cost',
      key: 'Cost',
      align: 'center',
      sortOrder: sortedInfo.columnKey === 'Cost' ? sortedInfo.order : null,
      ellipsis: true,
      sorter: (a, b) => a.Cost?.localeCompare(b.Cost),
      ...getColumnSearchProps('Cost'),
      editable: true,
    },

    // {
    //   title: "عملیات",
    //   key: "actions",
    //   width: 100,
    //   align: "center",
    //   render: (text, record) => {
    //     return (
    //       <div
    //         size="middle "
    //         className="gap-3 flex justify-center content-center"
    //       >
    //         <>
    //           <div className="mt-[2px]">
    //             <MdOutlineEdit
    //               className="h-5 w-6  cursor-pointer"
    //               onClick={() => handleFillData(record)}
    //             />
    //           </div>

    //           <div className="mt-1">
    //             <FaRegTrashCan
    //               className="h-4 w-4  cursor-pointer"
    //               onClick={() => handleDelete(record.Id)}
    //             //   onClick={() => handleDeleteReferralOrigin(record.Id)}
    //             />
    //           </div>
    //         </>
    //       </div>
    //     );
    //   },
    // },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = column.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave, // ارسال تابع handleSave
      }),
    };
  });
  //#endregion

  return (
    <div className='bg-white shadow rounded-xl p-6'>
      <form onSubmit={handleSubmit(inEditMode ? handleEdit : handleAdd)} className='max-w-6xl  p-6 bg-white rounded-xl'>
        <div className='grid grid-cols-3 md:grid-cols-3 gap-4 items-end'>
          {/*دوره های مالی */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>دوره های مالی</label>
            <Controller
              name='goalType'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder='انتخاب دوره'
                  className='w-full rounded-full'
                  allowClear
                  onSelect={handleSelectDateType}
                  options={[
                    {
                      value: 1,
                      label: 'سالانه',
                    },
                    {
                      value: 2,
                      label: 'ماهانه',
                    },
                    {
                      value: 3,
                      label: 'فصلی',
                    },
                  ]}
                  defaultValue={{
                    value: 1,
                    label: 'سالانه',
                  }}
                  optionFilterProp='label'
                  showSearch
                  labelInValue={true}
                ></Select>
              )}
            />
          </div>
        </div>
      </form>
      <hr className='mb-6 border-gray-200' />
      {/*     جدول     */}
      <Table
        dataSource={dataSource}
        columns={columns}
        size='small'
        components={components}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ y: 440 }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light editable-row' : 'table-row-dark editable-row')}
      />
    </div>
  );
};
export default Costs;
