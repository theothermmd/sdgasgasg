import React, { useState, useEffect } from 'react';
import { Table, Button, TreeSelect, Switch, Space, Input, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, MenuOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { RiAddCircleFill } from 'react-icons/ri';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSearchParams } from 'react-router-dom';
import {
  useGetTableFormInside,
  useCreateTableFormInside,
  useEditTableFormInside,
  useDeleteTableFormInside,
  useReorderTableFormInside,
} from '../ApiHooks/OtherSetting/TabCheckList';
import { useGetLookUpTable } from '../ApiHooks/OtherSetting/LookUpTable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Sortable Row Component
const SortableRow = ({ children, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child, {
            children: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MenuOutlined
                  {...listeners}
                  style={{
                    cursor: 'grab',
                    color: '#999',
                  }}
                />
                {child.props.children}
              </div>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const FormTableInside = ({ Tableid }) => {
  const [searchParams] = useSearchParams();
  const access = searchParams.get('access');
  // Initial data based on server response
  const { data: TableFormInsides, refetch: refetchGetTableFormInside } = useGetTableFormInside(Tableid);
  const { mutate: CreateTableFormInside } = useCreateTableFormInside();
  const { mutate: EditTableFormInside } = useEditTableFormInside();
  const { mutate: DeleteTableFormInside } = useDeleteTableFormInside();
  const { mutate: ReorderTableFormInside } = useReorderTableFormInside();
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    if (TableFormInsides) {
      setDataSource(TableFormInsides.data);
    }
  }, [TableFormInsides]);

  const [editingId, setEditingId] = useState('');
  const [editingData, setEditingData] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const { data: LookUpTables } = useGetLookUpTable();

  const [typeOptions, settypeOptions] = useState([]);
  useEffect(() => {
    if (LookUpTables && typeOptions.length === 0) {
      const lookuptablestostate = LookUpTables.data.map((value) => ({
        value: value.Id,
        label: value.Title,
      }));

      const test = {
        value: 'ReferenceTable',
        label: 'جدول مراجعه',
        children: lookuptablestostate,
      };
      const llok = [
        { value: 'Text', label: 'متن' },
        { value: 'LongText', label: 'متن بلند' },
        { value: 'Cost', label: 'هزینه' },
        { value: 'Number', label: 'عدد' },
        { value: 'Date', label: 'تاریخ' },
        { value: 'Checkbox', label: 'چک باکس' },
        test,
      ];

      settypeOptions(llok);
    }
  }, [LookUpTables, typeOptions]);

  // Handle required change in table
  const handleRequiredChange = (checked, record) => {
    const newData = dataSource.map((item) => (item.Id === record.Id ? { ...item, IsRequired: checked } : item));
    setDataSource(newData);
  };

  // Handle multiple options change in table
  const handleMultipleOptionsChange = (checked, record) => {
    const newData = dataSource.map((item) => (item.Id === record.Id ? { ...item, IsChoosen: checked } : item));
    setDataSource(newData);
  };

  // Start editing
  const startEdit = (record) => {
    setEditingId(record.Id);
    setEditingData({
      Title: record.Title,
      IsRequired: record.IsRequired,
      IsChoosen: record.IsChoosen || false,
    });
  };

  // Save edit
  const saveEdit = (record) => {
    if (!editingData.Title || !editingData.Title.trim()) {
      message.error('Title cannot be empty.');
      return;
    }

    const newData = dataSource.map((item) =>
      item.Id === editingId
        ? {
            ...item,
            Title: editingData.Title,
            IsRequired: editingData.IsRequired,
            IsChoosen: editingData.IsChoosen,
          }
        : item,
    );
    setDataSource(newData);
    setEditingId('');
    setEditingData({});

    EditTableFormInside(
      {
        Id: record.Id,
        Title: editingData.Title,
        Type: record.Type,
        Order: record.Order,
        IsRequired: editingData.IsRequired,
        IsChoosen: editingData.IsChoosen,
        LookupTableId: record.LookupTableId,
        DefaultTab: false,
        TabFormId: record.TabFormId,
      },
      {
        onSuccess: () => {
          message.success('وروردی با موفقیت بروزرسانی شد.');
          refetchGetTableFormInside();
        },
      },
    );
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId('');
    setEditingData({});
  };

  // Handle delete
  const handleDelete = (record) => {
    const newData = dataSource.filter((item) => item.Id !== record.Id);
    // Update Order for remaining items
    const reorderedData = newData.map((item, index) => ({
      ...item,
      Order: index,
    }));
    setDataSource(reorderedData);
    DeleteTableFormInside(record.Id, {
      onSuccess: () => {
        message.success('وروردی جدول با موفقیت حذف شد.');
        refetchGetTableFormInside();
      },
    });
  };

  // Handle add row
  const handleAddRow = () => {
    const maxOrder = dataSource.length > 0 ? Math.max(...dataSource.map((item) => item.Order)) : -1;

    setAddingNew(true);
    setNewRowData({
      Id: `new-${Date.now()}`,
      Title: '',
      Type: 'Text',
      Order: maxOrder + 1,
      IsRequired: false,
      IsChoosen: false,
      TabFormId: Tableid,
    });
  };

  // Save new row
  const saveNewRow = () => {
    if (!newRowData.Title || !newRowData.Title.trim()) {
      message.error('Title cannot be empty.');
      return;
    }

    setDataSource([...dataSource, newRowData]);
    setAddingNew(false);
    setNewRowData({});

    const Defaulttypes = ['Text', 'LongText', 'Cost', 'Number', 'Date', 'Checkbox'];

    CreateTableFormInside(
      {
        Title: newRowData.Title,
        Type: !Defaulttypes.includes(newRowData.Type) ? 'LookUp' : newRowData.Type,
        Order: newRowData.Order,
        IsRequired: newRowData.IsRequired,
        IsChoosen: newRowData.IsChoosen,
        DefaultTab: false,
        LookupTableId: !Defaulttypes.includes(newRowData.Type) ? newRowData.Type : null,
        TabFormId: newRowData.TabFormId,
      },
      {
        onSuccess: () => {
          message.success('ورودی جدید با موفقیت ساخته شد.');
          refetchGetTableFormInside();
        },
      },
    );
  };

  const getTypeLabel = (value, lookupTableId) => {
    const typeMap = {
      Text: 'متن',
      LongText: 'متن بلند',
      Cost: 'هزینه',
      Number: 'عدد',
      Table: 'جدول',
      Date: 'تاریخ',
      Checkbox: 'چک باکس',
    };

    // If it's a standard type
    if (typeMap[value]) {
      return typeMap[value];
    }

    // If it's a Lookup type, find the table title
    if (LookUpTables?.data && lookupTableId) {
      const lookupTable = LookUpTables.data.find((table) => table.Id === lookupTableId);
      return lookupTable ? `${lookupTable.Title}` : 'جدول مراجعه';
    }

    // Fallback
    return value;
  };

  // Cancel new row
  const cancelNewRow = () => {
    setAddingNew(false);
    setNewRowData({});
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = dataSource.findIndex((item) => item.Id === active.id);
      const newIndex = dataSource.findIndex((item) => item.Id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newData = arrayMove(dataSource, oldIndex, newIndex);
        const reorderedData = newData.map((item, index) => ({
          ...item,
          Order: index,
        }));
        setDataSource(reorderedData);
        message.success('Order updated successfully');
        console.log(newIndex);
        ReorderTableFormInside(
          {
            MovedItemId: active.id,
            NewPosition: newIndex + 1,
            TabFormId: Tableid,
          },
          {
            onSuccess: () => {
              refetchGetTableFormInside();
            },
          },
        );
      }
    }
  };

  const columns = [
    {
      title: 'ترتیب',
      dataIndex: 'Order',
      width: 50,
      align: 'center',
      render: (text, record) => {
        if (record.isNewRow) return '';
        return text;
      },
    },
    {
      title: 'عنوان',
      dataIndex: 'Title',
      width: 200,
      render: (text, record) => {
        if (record.isNewRow) {
          return (
            <Input
              placeholder='عنوان را وارد کنید...'
              value={newRowData.Title}
              onChange={(e) => setNewRowData({ ...newRowData, Title: e.target.value })}
              onPressEnter={saveNewRow}
              autoFocus
              size='middle'
            />
          );
        }

        const isEditing = editingId === record.Id;
        if (isEditing) {
          return (
            <Input
              placeholder='عنوان را وارد کنید...'
              value={editingData.Title}
              onChange={(e) => setEditingData({ ...editingData, Title: e.target.value })}
              onPressEnter={saveEdit}
              autoFocus
              size='middle'
            />
          );
        }

        return <span style={{ fontWeight: 500 }}>{text}</span>;
      },
    },
    {
      title: 'نوع',
      dataIndex: 'Type',
      width: 250,
      align: 'center',
      render: (type, record) => {
        if (record.isNewRow) {
          return (
            <TreeSelect
              value={newRowData.Type}
              style={{ width: '100%' }}
              treeData={typeOptions}
              placeholder='انتخاب نوع'
              treeDefaultExpandAll
              treeNodeFilterProp='label'
              showSearch
              size='middle'
              onChange={(value) => setNewRowData({ ...newRowData, Type: value })}
            />
          );
        }

        return <span>{getTypeLabel(type, record.LookupTableId)}</span>;
      },
    },
    {
      title: 'ضروری بودن',
      dataIndex: 'IsRequired',
      width: 120,
      align: 'center',
      render: (text, record) => {
        if (record.isNewRow) {
          return <Switch checked={newRowData.IsRequired} onChange={(checked) => setNewRowData({ ...newRowData, IsRequired: checked })} size='default' />;
        }

        const isEditing = editingId === record.Id;
        if (isEditing) {
          return <Switch checked={editingData.IsRequired} onChange={(checked) => setEditingData({ ...editingData, IsRequired: checked })} size='default' />;
        }

        return <Switch disabled={!isEditing} checked={text} size='default' onChange={(checked) => handleRequiredChange(checked, record)} />;
      },
    },
    {
      title: 'چند گزینه ای',
      dataIndex: 'IsChoosen',
      width: 120,
      align: 'center',
      render: (text, record) => {
        if (record.isNewRow) {
          return <Switch checked={newRowData.IsChoosen} onChange={(checked) => setNewRowData({ ...newRowData, IsChoosen: checked })} size='default' />;
        }

        const isEditing = editingId === record.Id;
        if (isEditing) {
          return <Switch checked={editingData.IsChoosen} onChange={(checked) => setEditingData({ ...editingData, IsChoosen: checked })} size='default' />;
        }

        return <Switch disabled={!isEditing} checked={text || false} size='default' onChange={(checked) => handleMultipleOptionsChange(checked, record)} />;
      },
    },
    {
      title: 'عملیات',
      width: 120,
      align: 'center',
      render: (text, record) => {
        if (record.isNewRow) {
          return (
            <Space size='small'>
              <Tooltip title='ذخیره'>
                <Button type='text' size='small' icon={<CheckOutlined />} onClick={saveNewRow} />
              </Tooltip>
              <Tooltip title='انصراف'>
                <Button type='text' size='small' icon={<CloseOutlined />} onClick={cancelNewRow} />
              </Tooltip>
            </Space>
          );
        }

        const isEditing = editingId === record.Id;
        if (isEditing) {
          return (
            <Space size='small'>
              <Tooltip title='ذخیره'>
                <Button type='text' size='small' icon={<CheckOutlined />} onClick={() => saveEdit(record)} />
              </Tooltip>
              <Tooltip title='انصراف'>
                <Button type='text' size='small' icon={<CloseOutlined />} onClick={cancelEdit} />
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space size='small'>
            <Tooltip title='ویرایش'>
              <Button type='text' size='small' icon={<EditOutlined />} onClick={() => startEdit(record)} />
            </Tooltip>
            {access === 'sazmanyartech' && (
              <Tooltip title='حذف'>
                <Button type='text' size='small' icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Prepare data source including new row if adding
  const tableDataSource = addingNew ? [...dataSource, { ...newRowData, isNewRow: true }] : dataSource;

  const rowStyles = `
    .ant-table {
      direction: rtl;
    }
    .ant-table-thead > tr > th {
      text-align: center;
      background-color: #fafafa;
      font-weight: 600;
    }
    .ant-table-tbody > tr {
      background-color: #ffffff;
    }
    .ant-table-tbody > tr:hover {
      background-color: #f5f5f5 !important;
    }
    .ant-table-tbody > tr > td {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 8px;
    }
    .ant-table-bordered .ant-table-tbody > tr > td {
      border-right: 1px solid #f0f0f0;
    }
  `;

  return (
    <div style={{ padding: '24px', direction: 'rtl' }}>
      <style>{rowStyles}</style>
      {access === 'sazmanyartech' && (
        <div className='flex items-center justify-between border-b border-gray-300 pb-4 mb-8 mt-2'>
          <button
            onClick={handleAddRow}
            disabled={addingNew || editingId !== ''}
            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200'
          >
            <RiAddCircleFill size={26} className='text-blue-500' />
            <span className='text-sm font-semibold hover:cursor-pointer'>افزودن ردیف</span>
          </button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={dataSource.map((item) => item.Id)} strategy={verticalListSortingStrategy}>
          <Table
            components={{
              body: {
                row: (props) => {
                  // Don't make new rows draggable
                  if (props['data-row-key'] && tableDataSource.find((item) => item.Id === props['data-row-key'])?.isNewRow) {
                    return <tr {...props} />;
                  }
                  return <SortableRow {...props} />;
                },
              },
            }}
            dataSource={tableDataSource}
            columns={columns}
            pagination={false}
            size='middle'
            rowKey='Id'
            scroll={{ x: 1000 }}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default FormTableInside;
