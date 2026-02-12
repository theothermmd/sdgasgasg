import React, { useState, useCallback, useEffect } from 'react';
import { Table, Button, Input, Space, Tooltip, message, Divider, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { RiAddCircleFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useCreateTabCategories, useEditTabCategories, useDeleteTabCategoriesById, useGetTabCategories } from '../../../../ApiHooks/OtherSetting/TabCheckList';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import GlobalTitle from '../../GlobalSetting/GlobalTitle';

const FormGeneratorFormssazmanyar = () => {
  const { pathname } = useLocation();

  const { mutate: CreateTabCategories } = useCreateTabCategories();
  const { mutate: EditTabCategories } = useEditTabCategories();
  const { mutate: DeleteTabCategoriesById } = useDeleteTabCategoriesById();
  const { data: TabCategories, refetch: RefetchTabCategories } = useGetTabCategories();

  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (TabCategories?.data) {
      setData(TabCategories.data);
      setValue('forms', TabCategories.data);
    }
  }, [TabCategories]);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      forms: data,
      editingValue: '',
    },
  });

  useEffect(() => {
    setValue('forms', data);
  }, [data, setValue]);

  // Transform data for table display
  const transformDataForTable = useCallback(() => {
    const formData = getValues('forms') || data;
    return formData.map((form, index) => ({
      key: form.Id,
      id: form.Id,
      title: form.Title,
      order: form.Order,
      default: form.Default,
      formIndex: index,
    }));
  }, [data, getValues]);

  const tableData = transformDataForTable();

  // Add new row
  const addNewRow = () => {
    const newId = `new-${Date.now()}`;

    const newForm = {
      Id: newId,
      Title: '',
      Order: data.length,
      Default: false,
    };

    const newData = [...data, newForm];
    setData(newData);
    setValue('forms', newData);
    setEditingKey(newId);
    setValue('editingValue', '');
  };

  // Start editing
  const startEdit = (id, currentTitle) => {
    setEditingKey(id);
    setValue('editingValue', currentTitle);
  };

  // Save edit with form validation
  const saveEdit = handleSubmit((formData, record) => {
    const editValue = formData.editingValue;
    if (!editValue || !editValue.trim()) {
      messageApi.error('Please enter a title.');
      return;
    }

    if (record.key.includes('new')) {
      // Handle new form creation
      const newData = data.map((form) => (form.Id === editingKey ? { ...form, Title: editValue } : form));
      setData(newData);
      setValue('forms', newData);
      console.log(formData);
      console.log(record);

      CreateTabCategories(
        {
          Title: formData.editingValue,
          Order: record.order,
          Default: false,
        },
        {
          onSuccess: () => {
            RefetchTabCategories();
          },
        },
      );
      messageApi.success('فرم با موفقیت ساخته شد');
    } else {
      // Handle existing form edit
      const newData = data.map((form) => (form.Id === editingKey ? { ...form, Title: editValue } : form));
      setData(newData);
      setValue('forms', newData);
      EditTabCategories(
        {
          Id: record.id,
          Title: formData.editingValue,
          Order: record.order,
          Default: record.default,
        },
        {
          onSuccess: () => {
            RefetchTabCategories();
          },
        },
      );
      messageApi.success('عنوان فرم با موفقیت بروزرسانی شد.');
    }

    setEditingKey('');
    setValue('editingValue', '');
  });

  // Cancel edit
  const cancelEdit = () => {
    setEditingKey('');
    setValue('editingValue', '');
    // Remove new items that weren't saved
    const newData = data.filter((item) => !item.Id.includes('new'));
    setData(newData);
    setValue('forms', newData);
  };

  // Delete row
  const deleteRow = (id) => {
    const newData = data.filter((form) => form.Id !== id);
    setData(newData);
    setValue('forms', newData);
    DeleteTabCategoriesById(id, {
      onSuccess: () => {
        RefetchTabCategories();
      },
    });

    messageApi.success('فرم با موفقیت حذف شد.');
  };

  const navigate = useNavigate();

  // Handle go to form page
  const handleGoToForm = (id) => {
    // Simulate opening a new page with the ID
    if (pathname === '/RcrSABYwQYwmdtcOTsJmxYbIhMOEnwOt') {
      navigate(`/FormDetails?FormId=${id}&access=sazmanyartech`);
    } else {
      navigate(`/FormDetails?FormId=${id}`);
    }
  };

  // Handle drag end - removed drag functionality

  const columns = [
    {
      title: 'ردیف',
      dataIndex: 'order',
      width: 80,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'عنوان',
      dataIndex: 'title',
      render: (text, record) => {
        const isEditing = editingKey === record.id;

        if (isEditing) {
          return (
            <Controller
              name='editingValue'
              control={control}
              rules={{ required: 'عنوان نمیتواند خالی باشد.' }}
              render={({ field }) => (
                <div>
                  <Input
                    placeholder='عنوان تب را وارد کنید...'
                    {...field}
                    onPressEnter={() => saveEdit(record)}
                    autoFocus
                    status={errors.editingValue ? 'error' : ''}
                    className='!p-1 !px-2 '
                    style={{ padding: 0 }}
                  />
                  {errors.editingValue && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{errors.editingValue.message}</div>}
                </div>
              )}
            />
          );
        }

        return <span>{text}</span>;
      },
    },
    {
      title: 'عملیات',
      dataIndex: 'operations',
      width: 300,
      align: 'center',
      render: (_, record) => {
        const isEditing = editingKey === record.id;
        const showDelete = !record.default;

        if (isEditing) {
          return (
            <Space>
              <Tooltip title='ذخیره فرم'>
                <Button type='text' icon={<CheckOutlined />} size='small' onClick={() => saveEdit(record)} />
              </Tooltip>
              <Tooltip title='انصراف'>
                <Button type='text' icon={<CloseOutlined />} size='small' onClick={cancelEdit} />
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space className='w-full flex items-center justify-center'>
            <Tooltip title='ویرایش'>
              <Button type='text' icon={<MdOutlineEdit />} size='small' onClick={() => startEdit(record.id, record.title)} />
            </Tooltip>
            <Tooltip title='رفتن به تنظیمات فرم'>
              <Button type='text' icon={<FileTextOutlined />} size='small' onClick={() => handleGoToForm(record.id)} />
            </Tooltip>
            {showDelete && pathname !== '/FormGenerator' ? (
              <Tooltip title='حذف'>
                <Popconfirm className='cursor-pointer' title='حذف' description='آیا از حذف اطمینان دارید ؟' onConfirm={() => deleteRow(record.id)} okText='بله' cancelText='خیر'>
                  <FaRegTrashCan color='red' />
                </Popconfirm>
              </Tooltip>
            ) : (
              <FaRegTrashCan color='red' className='opacity-30 cursor-not-allowed' />
            )}
          </Space>
        );
      },
    },
  ];

  const table_style = `
  .table-row-light {
  background-color: #f0f8ff; /* آبی خیلی روشن */
}

.table-row-dark {
  background-color: #ffffff;
}
`;
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <div className='p-4 ring-1 ring-gray-200 shadow rounded-md mt-4 w-full'>
        {contextHolder}
        <style>{table_style}</style>
        <h4 className=' text-gray-500 pb-4'>فرم ساز</h4>

        <div className='flex items-center justify-between mt-2 '>
          <button
            onClick={addNewRow}
            className='flex items-center gap-2 text-blue-600 hover:cursor-pointer hover:text-blue-800 transition-colors duration-200'
            disabled={editingKey}
          >
            <RiAddCircleFill size={26} className='text-blue-500' />
            <span className='text-sm font-semibold '>ایجاد فرم جدید</span>
          </button>
        </div>
        <hr className='border-gray-100 border-2 rounded-full w-full mt-4 mb-8  custom-hide-on-small-height-500 ' />

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          rowKey='key'
          size='middle'
          rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        />
      </div>
      <div className='p-4 ring-1 ring-gray-200 shadow rounded-md  w-full'>
        <h4 className=' text-gray-500 pb-4'>تنظیمات عمومی</h4>
        <GlobalTitle />
      </div>
    </div>
  );
};

export default FormGeneratorFormssazmanyar;
