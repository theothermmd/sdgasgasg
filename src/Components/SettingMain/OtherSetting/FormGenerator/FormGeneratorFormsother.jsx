import React, { useState, useCallback, useEffect } from 'react';
import { Table, Button, Input, Space, Tooltip, message, Divider, Popconfirm, Popover } from 'antd';
import { CheckOutlined, CloseOutlined, FileTextOutlined, CopyOutlined, DeleteFilled } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { RiAddCircleFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import {
  useCreateTabCategories,
  useEditTabCategories,
  useDeleteTabCategoriesById,
  useGetTabCategories,
  useUpdateOfficeOnline,
} from '../../../../ApiHooks/OtherSetting/TabCheckList';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { FaFileWord } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
const FormGeneratorFormsother = () => {
  const { pathname } = useLocation();
  const PRPURL = useSelector((state) => state.Auth.PRPURL);

  const { mutate: CreateTabCategories } = useCreateTabCategories();
  const { mutate: EditTabCategories } = useEditTabCategories();
  const { mutate: DeleteTabCategoriesById } = useDeleteTabCategoriesById();
  const { mutate: UpdateOfficeOnline } = useUpdateOfficeOnline();
  const { data: TabCategories, refetch: RefetchTabCategories } = useGetTabCategories();

  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [Wordloading, setWordloading] = useState(null);

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
    if (TabCategories?.data) {
      setData(TabCategories.data);
      setValue('forms', TabCategories.data);
    }
  }, [TabCategories]);

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
      OfficeOnlineDocumentId: form.OfficeOnlineDocumentId,

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

  const AddDocument = (record) => {
    if (record.OfficeOnlineDocumentId) {
      window.open(`${PRPURL}/_layouts/15/WopiFrame2.aspx?sourcedoc=%7B${record?.OfficeOnlineDocumentId}%7D`, '_blank');
      return;
    }
    setWordloading(true);
    let data = {
      TabCategoriesId: record.id,
      filenameId: '',
    };
    console.log('record : ', record);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${PRPURL}/_vti_bin/ProposalSharePoint/ProposalWebService.asmx/AddDocumentTemplateToSharePoint`, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = () => {
      if (xhr.status === 200) {
        const jsonObject = JSON.parse(xhr.response);
        data.filenameId = jsonObject?.d;
        console.log(record);

        UpdateOfficeOnline(data, {
          onSuccess: () => {
            RefetchTabCategories();
            setRecordOfficeOnlineMode(null);
            window.open(`${PRPURL}/_layouts/15/WopiFrame2.aspx?sourcedoc=%7B${data?.filenameId}%7D`, '_blank');
          },
          onError: () => {
            toast.error('خطا در بارگذاری سند');
          },
        });
      } else {
        toast.error('خطا در بارگذاری سند');
      }
    };
    xhr.onerror = () => {
      toast.error('خطا در بارگذاری سند');
    };
    xhr.send(JSON.stringify({ fileName: record.title, templateType: 1 }));
  };
  const removeDocument = (record) => {
    let data = {
      TabCategoriesId: record.id,
      filenameId: null,
    };
    UpdateOfficeOnline(data, {
      onSuccess: () => {
        RefetchTabCategories();
        toast.success('با موفقیت حذف گردید');
      },
      onError: () => {
        toast.error('خطا در بارگذاری سند');
      },
    });
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
          <Space className='max-w-20 flex items-center justify-center'>
            <Tooltip title='ویرایش'>
              <Button type='text' icon={<MdOutlineEdit />} size='small' onClick={() => startEdit(record.id, record.title)} />
            </Tooltip>
            <Tooltip title='رفتن به تنظیمات فرم'>
              <Button type='text' icon={<FileTextOutlined />} size='small' onClick={() => handleGoToForm(record.id)} />
            </Tooltip>
            {showDelete && pathname !== '/FormGenerator' && (
              <Tooltip title='حذف'>
                <Popconfirm className='cursor-pointer' title='حذف' description='آیا از حذف اطمینان دارید ؟' onConfirm={() => deleteRow(record.id)} okText='بله' cancelText='خیر'>
                  <FaRegTrashCan />
                </Popconfirm>
              </Tooltip>
            )}

            <Tooltip title={`${record.OfficeOnlineDocumentId ? 'ویرایش سند' : 'طراحی سند'} `}>
              <button className='cursor-pointer' onClick={() => AddDocument(record)}>
                <FaFileWord size={16} color={record.OfficeOnlineDocumentId ? 'blue' : 'black'} />
              </button>
            </Tooltip>
            <Tooltip title={`${record.OfficeOnlineDocumentId ? 'حذف سند' : ' سند ندارد'} `}>
              <button className='cursor-pointer' onClick={() => removeDocument(record)}>
                <DeleteFilled size={16} color={record.OfficeOnlineDocumentId ? 'red' : 'black'} />
              </button>
            </Tooltip>
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
    <div className='py-4' id='tab-lists'>
      {contextHolder}
      <style>{table_style}</style>
      {pathname !== '/FormGenerator' && (
        <div className='flex items-center justify-between border-b border-gray-300 pb-4 mb-8 mt-2'>
          <button onClick={addNewRow} className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200' disabled={editingKey}>
            <RiAddCircleFill size={26} className='text-blue-500' />
            <span className='text-sm font-semibold hover:cursor-pointer'>ایجاد فرم جدید</span>
          </button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey='key'
        size='middle'
        rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
      />
      <Toaster />
    </div>
  );
};

export default FormGeneratorFormsother;
