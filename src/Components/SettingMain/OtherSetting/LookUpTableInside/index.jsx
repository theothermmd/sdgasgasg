import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useGetAllLookUpTableInside, useCreateLookUpTableInside, useDeleteLookUpTableInside, useEditLookUpTableInside } from '../../../../ApiHooks/OtherSetting/LookUpTable';

const LookUpTableInside = () => {
  const [data, setData] = useState([]);
  const LookupTableId = useSelector((state) => state.Modal.id);
  const { data: AllLookupTableInside, refetch: RefetchAllLookupTableInside } = useGetAllLookUpTableInside(LookupTableId);
  const { mutate: EditLookUpTableInside } = useEditLookUpTableInside();
  const { mutate: CreateInside } = useCreateLookUpTableInside();
  const { mutate: DeleteLookUpTableInside } = useDeleteLookUpTableInside();
  const [editingKey, setEditingKey] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [tempRows, setTempRows] = useState([]);
  const [editValue, setEditValue] = useState('');

  // Process data with proper key format: parentId|actualKey
  const processData = (items, parentKey = null) => {
    return items.map((item) => {
      const displayKey = `${parentKey || 'null'}|${item.key}`;

      return {
        ...item,
        displayKey, // For table operations
        actualKey: item.key, // Original server key
        parentKey, // Parent's actual key
        children: item.children ? processData(item.children, item.key) : [],
      };
    });
  };

  useEffect(() => {
    if (AllLookupTableInside) {
      const processedData = processData(AllLookupTableInside.data);
      setData(processedData);
    }
  }, [AllLookupTableInside]);

  const handleAddRoot = () => {
    const tempId = `temp_root_${Date.now()}`;
    setTempRows([
      {
        displayKey: tempId,
        actualKey: tempId,
        parentKey: null,
        title: '',
        isTemp: true,
        tempType: 'root',
      },
      ...tempRows,
    ]);
  };

  const handleAddChild = (parentRecord) => {
    const tempId = `temp_child_${Date.now()}`;
    setTempRows([
      {
        displayKey: tempId,
        actualKey: tempId,
        parentKey: parentRecord.actualKey,
        title: '',
        isTemp: true,
        tempType: 'child',
        tempParent: parentRecord,
      },
      ...tempRows,
    ]);

    // Expand parent to show new child
    if (!expandedRowKeys.includes(parentRecord.displayKey)) {
      setExpandedRowKeys([...expandedRowKeys, parentRecord.displayKey]);
    }
  };

  const handleConfirmTemp = (tempRow, inputValue) => {
    if (!inputValue?.trim()) {
      message.error('Title cannot be empty');
      return;
    }

    const newItem = {
      lookUpTableId: LookupTableId,
      parentId: tempRow.parentKey,
      title: inputValue.trim(),
    };

    // Remove temp row
    setTempRows((prev) => prev.filter((tr) => tr.displayKey !== tempRow.displayKey));

    CreateInside(newItem, {
      onSuccess: () => {
        RefetchAllLookupTableInside();
      },
    });
  };

  const handleCancelTemp = (tempRow) => {
    setTempRows((prev) => prev.filter((tr) => tr.displayKey !== tempRow.displayKey));
  };

  const handleEdit = (record) => {
    setEditingKey(record.displayKey);
    setEditValue(record.title);
  };

  const handleSaveEdit = (record) => {
    if (!editValue?.trim()) {
      message.error('Title cannot be empty');
      return;
    }

    EditLookUpTableInside(
      {
        key: record.actualKey,
        lookUpTableId: LookupTableId,
        parentId: record.parentKey,
        title: editValue.trim(),
      },
      {
        onSuccess: () => {
          RefetchAllLookupTableInside();
        },
      },
    );

    setEditingKey('');
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingKey('');
    setEditValue('');
  };

  const handleDelete = (record) => {
    DeleteLookUpTableInside(record.actualKey);
  };

  // Combine actual data with temp rows
  const getTableData = () => {
    const combined = [...data];

    // Add root temp rows
    const rootTempRows = tempRows.filter((tr) => tr.tempType === 'root');
    combined.unshift(...rootTempRows);

    // Add child temp rows to their parents
    const addTempChildren = (items) => {
      return items.map((item) => {
        const childTempRows = tempRows.filter((tr) => tr.tempType === 'child' && tr.parentKey === item.actualKey);

        if (childTempRows.length > 0 || (item.children && item.children.length > 0)) {
          return {
            ...item,
            children: [...childTempRows, ...(item.children ? addTempChildren(item.children) : [])],
          };
        }

        return item;
      });
    };

    return addTempChildren(combined);
  };

  const columns = [
    {
      title: 'عنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        const isEditing = editingKey === record.displayKey;

        if (record.isTemp) {
          let inputValue = '';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 17, display: 'inline-block' }} />
              <Input
                placeholder={record.tempType === 'root' ? 'Enter title' : 'Enter child title'}
                autoFocus
                onChange={(e) => {
                  inputValue = e.target.value;
                }}
                onPressEnter={() => handleConfirmTemp(record, inputValue)}
                style={{ flex: 1 }}
              />
            </div>
          );
        }

        if (isEditing) {
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 17, display: 'inline-block' }} />
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onPressEnter={() => handleSaveEdit(record)} autoFocus style={{ flex: 1 }} />
              <Button type='primary' size='small' onClick={() => handleSaveEdit(record)}>
                <CheckOutlined />
              </Button>
              <Button size='small' onClick={handleCancelEdit}>
                <CloseOutlined />
              </Button>
            </div>
          );
        }

        // Normal display with expand/collapse button
        const hasChildren = record.children && record.children.length > 0;
        const isExpanded = expandedRowKeys.includes(record.displayKey);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {hasChildren ? (
              <Button
                type='text'
                size='small'
                onClick={() => {
                  if (isExpanded) {
                    setExpandedRowKeys((prev) => prev.filter((key) => key !== record.displayKey));
                  } else {
                    setExpandedRowKeys((prev) => [...prev, record.displayKey]);
                  }
                }}
                style={{
                  width: 17,
                  height: 17,
                  padding: 0,
                  minWidth: 17,
                  fontSize: '12px',
                  lineHeight: 1,
                }}
              >
                {isExpanded ? '−' : '+'}
              </Button>
            ) : (
              <span style={{ width: 17, display: 'inline-block' }} />
            )}
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      title: 'عملیات',
      key: 'operations',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const isEditing = editingKey === record.displayKey;

        if (record.isTemp) {
          return (
            <Space size='small'>
              <Button
                type='primary'
                size='small'
                icon={<CheckOutlined />}
                onClick={() => {
                  const input = document.querySelector(`input[placeholder*="${record.tempType === 'root' ? 'Enter title' : 'Enter child title'}"]`);
                  handleConfirmTemp(record, input?.value);
                }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              />
              <Button size='small' icon={<CloseOutlined />} onClick={() => handleCancelTemp(record)} danger />
            </Space>
          );
        }

        if (isEditing) {
          return null;
        }

        return (
          <Space size='small'>
            <Button icon={<PlusOutlined />} onClick={() => handleAddChild(record)} size='small' type='text' title='Add Child' />
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size='small' type='text' title='Edit' />
            <Popconfirm title='Are you sure you want to delete this item?' onConfirm={() => handleDelete(record)} okText='Yes' cancelText='No'>
              <Button icon={<DeleteOutlined />} size='small' type='text' danger title='Delete' />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const getRowClassName = (record) => {
    return record.parentKey ? 'child-row' : '';
  };

  const expandable = {
    expandedRowKeys,
    onExpandedRowsChange: setExpandedRowKeys,
    expandRowByClick: false,
    expandIcon: () => null,
  };

  return (
    <div style={{ padding: 24 }}>
      <style jsx>{`
        .child-row {
          background-color: #fafafa !important;
        }
        .child-row:hover {
          background-color: #f0f0f0 !important;
        }
      `}</style>

      <div style={{ marginBottom: 16 }}>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleAddRoot} dir='ltr'>
          افزودن مقادیر
        </Button>
      </div>

      <Table columns={columns} dataSource={getTableData()} pagination={false} expandable={expandable} size='middle' rowKey='displayKey' bordered rowClassName={getRowClassName} />
    </div>
  );
};

export default LookUpTableInside;
