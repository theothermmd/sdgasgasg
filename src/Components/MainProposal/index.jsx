import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Space, Button, Input, Tooltip, Dropdown } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { RiAddCircleFill } from 'react-icons/ri';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useDeleteProjectCharterById, useGetProjectCharterById } from '../../ApiHooks/ProjectCharts';
import { useGetWaitForActionAccess } from '../../ApiHooks/WorkFlow';
import { useNavigate } from 'react-router-dom';
import { handleChangeSituation } from '../../features/ProjectChart/ProjectChartSlice';
import { setShowLeftSidebar, setSummeryData, handleRefechGridData } from '../../features/LeftSidebar/LeftSidebarSlice';
import { handleAddFlowAccess } from '../../features/WorkFlow/WorkFlowSlice';
import { useGetTabCategories } from '../../ApiHooks/OtherSetting/TabCheckList';
import { useSearchProjectCharter } from '../../ApiHooks/SearchProjectCharter';
import { handleAddTabCategorieId, handleAddFormName } from '../../features/Form';
import { ConfigProvider } from 'antd';
import { theme as antdTheme } from "antd";


const MainProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const { data: TabCategories } = useGetTabCategories();
  useEffect(() => {
    const syncTheme = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };

    window.addEventListener("theme-change", syncTheme);

    return () => {
      window.removeEventListener("theme-change", syncTheme);
    };
  }, []);



  const Title = useSelector((State) => State.ProjectChart.Title);

  const InsertBy = useSelector((State) => State.ProjectChart.InsertBy);
  // const RefetchMainProroposalTable = useSelector((State) => State.ProjectChart.RefetchMainProroposalTable);

  const Situationid = useSelector((state) => state.ProjectChart.Situationid);
  // const { data: SearchProjectCharter, refetch: refetchProjectCharterWithsituation } = useGetProjectCharterWithsituation(Situationid);
  const { data: SearchProjectCharter, refetch: refetchSearchProjectCharter } = useSearchProjectCharter(Title, InsertBy, Situationid);
  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);

  useEffect(() => {
    refetchSearchProjectCharter();
  }, [Title, InsertBy, Situationid]);

  const [TabCategoriesState, setTabCategoriesState] = useState([]);
  useEffect(() => {
    if (TabCategories && TabCategoriesState.length === 0) {
      const tems = TabCategories.data.map((value, index) => {
        return {
          label: value.Title,
          key: index + 1,
          onClick: () => {
            dispatch(handleAddTabCategorieId(value.Id));
            dispatch(handleChangeSituation({ inEdit: false, inAdd: true }));
            dispatch(handleAddFormName(value.Title));
            navigate(`/create-Form`);
          },
        };
      });
      setTabCategoriesState(tems);
    }
  }, [TabCategories, dispatch]);

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
  const {
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();
  const refectchGrid = useSelector((state) => state.leftSidebar.refechGridData);

  useEffect(() => {
    console.log('useEffect for refetch triggered. Title:', Title, 'InsertBy:', InsertBy);
    // Trigger refetch when Title or InsertBy changes and they have values
    // This effect should ONLY run when Title or InsertBy change.
    if (Title || InsertBy) {
      console.log('Calling refetchSearchProjectCharter because Title or InsertBy is truthy');
      refetchSearchProjectCharter();
    } else {
      console.log('Not calling refetchSearchProjectCharter because both Title and InsertBy are falsy');
    }
  }, [Title, InsertBy, refetchSearchProjectCharter]);

  useEffect(() => {
    if (SearchProjectCharter?.data) {
      setDataSource(SearchProjectCharter.data);
    } else {
      setDataSource([]);
    }
  }, [SearchProjectCharter]);

  useEffect(() => {
    if (refectchGrid) {
      refetchSearchProjectCharter();
      dispatch(handleRefechGridData(false));
    }
  }, [refectchGrid]);

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
      width: 80,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'عنوان',
      dataIndex: 'Title',
      key: 'Title',
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => a.Title?.localeCompare(b.Title),
      ...getColumnSearchProps('Title'),
    },
    {
      title: 'کد‌ پروژه',
      dataIndex: 'CharterCode',
      key: 'CharterCode',
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => a.CharterCode?.localeCompare(b.CharterCode),
      ...getColumnSearchProps('CharterCode'),
    },
  ];

  const handleRowClick = (rowData) => {
    console.log('losss : ', rowData);

    //    console.log("Row clicked:", rowData);

    dispatch(setSummeryData(rowData));
    dispatch(setShowLeftSidebar(true));
  };

  const handleNavigateToCreatePage = () => {
    dispatch(handleChangeSituation({ inEdit: false, inAdd: true }));
    navigate(`/create-proposal`);
  };
  console.log(TabCategoriesState);

  return (
    <>
      <div className='flex items-center justify-between border-b border-gray-300 pb-4 mt-6'>
        {/* <button onClick={handleNavigateToCreatePage} className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200'>
          <RiAddCircleFill size={26} className='text-blue-500' />
          <span className='text-sm font-semibold hover:cursor-pointer'>ایجاد منشور پروژه</span>
        </button> */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'title',
                label: (
                  <div className='flex flex-col w-full items-center'>
                    <p className='text-gray-600 self-start cursor-default'>{GlobalTitle} های شما</p>

                    <div className='rounded-full w-full bg-gray-100 h-1 mt-2'></div>
                  </div>
                ),
                type: 'group',
              },
              ...TabCategoriesState,
            ],
          }}
          trigger={['click']}
          className='cursor-pointer hover:bg-gray-50 rounded-md p-1.5 transition-colors flex  items-center gap-2 text-blue-500 hover:text-blue-700'
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <RiAddCircleFill size={26} className='text-blue-500' />
              <span className='text-sm font-semibold hover:cursor-pointer'>ایجاد {GlobalTitle}</span>
            </Space>
          </a>
        </Dropdown>
      </div>
      <ConfigProvider
        key={theme}
        theme={{
          algorithm:
            theme === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,

          // ❗ فقط وقتی دارکه token بده
          token:
            theme === "dark"
              ? {
                colorBgBase: "#0f172a",
                colorBgContainer: "#020617",
                colorText: "#e5e7eb",
                colorBorder: "#1e293b",
                colorPrimary: "#38bdf8",
              }
              : {}, // ← light کاملاً خالی
        }}
      >


        <Table
          id='TableProposal'
          dataSource={dataSource}
          columns={column}
          size='small'
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}

          scroll={{ y: '400' }}
          rowClassName={(record, index) =>
            `
    cursor-pointer
    ${index % 2 === 0
              ? "bg-white dark:bg-slate-900"
              : "bg-gray-50 dark:bg-slate-800"}
  `
          }



        />
      </ConfigProvider >

    </>
  );
};

export default MainProposal;
