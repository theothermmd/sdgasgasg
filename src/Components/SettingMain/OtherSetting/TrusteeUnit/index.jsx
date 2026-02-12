import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCreateTrusteeUnit, useEditTrusteeUnit, useDeleteTrusteeUnitByGIUD, useGetTrusteeUnit } from '../../../../ApiHooks/OtherSetting/TrusteeUnit';
import { IoAddCircleOutline } from 'react-icons/io5';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';
import { PiTreeStructure } from 'react-icons/pi';
const TrusteeUnit = () => {
  const { mutate: CreateTrusteeUnit } = useCreateTrusteeUnit();
  const { mutate: EditTrusteeUnit } = useEditTrusteeUnit();
  const { mutate: DeleteTrusteeUnitByGIUD } = useDeleteTrusteeUnitByGIUD();
  const { data: GetTrusteeUnit, refetch: refetchGetTrusteeUnit } = useGetTrusteeUnit();

  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [editingText, setEditingText] = useState('');
  const [newRowKey, setNewRowKey] = useState(''); // Track new row being added
  const [newRowTitle, setNewRowTitle] = useState(''); // Track new row title
  const [newRowParentId, setNewRowParentId] = useState(''); // Track parent ID for new row

  useEffect(() => {
    if (GetTrusteeUnit) {
      setData(GetTrusteeUnit.data || []);
    }
  }, [GetTrusteeUnit]);

  // Add rowNumber and level to data for display (but keep hierarchy)
  const prepareDataForDisplay = (items, parentPath = '', level = 0) => {
    return items.map((item, index) => {
      const currentPath = parentPath ? `${parentPath}-${index}` : `${index}`;

      return {
        ...item,
        key: item.Id,
        rowNumber: currentPath,
        level: level,
        children: item.Children && item.Children.length > 0 ? prepareDataForDisplay(item.Children, currentPath, level + 1) : undefined,
      };
    });
  };

  const handleDelete = (id) => {
    const deleteRecursive = (items) => {
      return items.filter((item) => {
        if (item.Id === id) return false;
        if (item.Children) {
          item.Children = deleteRecursive(item.Children);
        }
        return true;
      });
    };
    DeleteTrusteeUnitByGIUD(id, {
      onSuccess: () => {
        refetchGetTrusteeUnit();
      },
    });

    setData((prevData) => deleteRecursive(prevData));
    setExpandedRowKeys((prev) => prev.filter((key) => key !== id));
    // Clear new row state if deleted

    if (newRowKey === id) {
      setNewRowKey('');
      setNewRowTitle('');
      setNewRowParentId('');
    }
  };

  const handleAddChild = (parentId) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newChild = {
      Id: newId,
      Title: '',
      ParentId: parentId,
      Children: [],
    };

    const addChildRecursive = (items) => {
      return items.map((item) => {
        if (item.Id === parentId) {
          return {
            ...item,
            Children: [...(item.Children || []), newChild],
          };
        }
        if (item.Children) {
          return {
            ...item,
            Children: addChildRecursive(item.Children),
          };
        }
        return item;
      });
    };

    setData((prevData) => addChildRecursive(prevData));
    setExpandedRowKeys((prev) => [...new Set([...prev, parentId])]);
    setNewRowKey(newId);
    setNewRowTitle('');
    setNewRowParentId(parentId); // Store the parent ID
  };

  const handleAddRoot = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newRoot = {
      Id: newId,
      Title: '',
      ParentId: null,
      Children: [],
    };

    setData((prevData) => [...prevData, newRoot]);
    setNewRowKey(newId);
    setNewRowTitle('');
    setNewRowParentId(''); // No parent for root items
  };

  const startEditing = (record) => {
    setEditingKey(record.Id);
    setEditingText(record.Title);
    // Clear new row state when editing existing row
    setNewRowKey('');
    setNewRowTitle('');
    setNewRowParentId('');
  };

  const saveEdit = (record) => {
    const updateTitleRecursive = (items) => {
      return items.map((item) => {
        if (item.Id === record.Id) {
          return {
            ...item,
            Title: editingText,
          };
        }
        if (item.Children) {
          return {
            ...item,
            Children: updateTitleRecursive(item.Children),
          };
        }
        return item;
      });
    };
    EditTrusteeUnit(
      {
        Id: record.Id,
        Title: record.Title,
      },

      {
        onSuccess: () => {
          refetchGetTrusteeUnit();
        },
      },
    );

    setData((prevData) => updateTitleRecursive(prevData));
    setEditingKey('');
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingKey('');
    setEditingText('');
  };

  // Save new row
  const saveNewRow = (newId) => {
    if (!newRowTitle.trim()) {
      // If title is empty, cancel adding
      cancelNewRow(newId);
      return;
    }

    // Here you can access both the title and parent ID
    console.log('New Row Title:', newRowTitle);
    console.log('Parent ID:', newRowParentId);
    console.log('New Row ID:', newId);

    CreateTrusteeUnit(
      {
        Title: newRowTitle,
        ParentId: !newRowParentId ? null : newRowParentId,
      },
      {
        onSuccess: () => {
          refetchGetTrusteeUnit();
        },
      },
    );

    // Call your API to create the new trustee unit
    // CreateTrusteeUnit({
    //   Id: newId,
    //   Title: newRowTitle,
    //   ParentId: newRowParentId === '' ? null : newRowParentId
    // });

    const updateNewRowRecursive = (items) => {
      return items.map((item) => {
        if (item.Id === newId) {
          return {
            ...item,
            Title: newRowTitle,
          };
        }
        if (item.Children) {
          return {
            ...item,
            Children: updateNewRowRecursive(item.Children),
          };
        }
        return item;
      });
    };

    setData((prevData) => updateNewRowRecursive(prevData));
    setNewRowKey('');
    setNewRowTitle('');
    setNewRowParentId('');
  };

  // Cancel new row
  const cancelNewRow = (newId) => {
    const deleteRecursive = (items) => {
      return items.filter((item) => {
        if (item.Id === newId) return false;
        if (item.Children) {
          item.Children = deleteRecursive(item.Children);
        }
        return true;
      });
    };

    setData((prevData) => deleteRecursive(prevData));
    setNewRowKey('');
    setNewRowTitle('');
    setNewRowParentId('');
  };

  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys((prev) => [...new Set([...prev, record.key])]);
    } else {
      setExpandedRowKeys((prev) => prev.filter((key) => key !== record.key));
    }
  };

  const columns = [
    {
      title: 'ردیف',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: '2%',
      align: 'center',
      render: (_, record) => {
        const displayNumber = record.rowNumber
          ? record.rowNumber
              .split('-')
              .map((_, idx) => idx + 1)
              .join('.')
          : '';

        return <span style={{ paddingLeft: `${record.level * 20}px` }}>{displayNumber}</span>;
      },
    },
    {
      title: 'عنوان',
      dataIndex: 'Title',
      key: 'Title',
      width: '60%',
      align: 'center',
      render: (text, record) => {
        // If this is the new row being added
        if (record.Id === newRowKey) {
          return <Input value={newRowTitle} onChange={(e) => setNewRowTitle(e.target.value)} onPressEnter={() => saveNewRow(record.Id)} autoFocus placeholder='Enter title...' />;
        }
        // If this is an existing row being edited
        if (editingKey === record.Id) {
          return <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} onPressEnter={() => saveEdit(record)} onBlur={() => saveEdit(record)} autoFocus />;
        }
        return <span style={{ paddingLeft: `${record.level * 20}px` }}>{text}</span>;
      },
    },
    {
      title: 'عملیات',
      key: 'operations',
      width: '10%',
      align: 'center',
      render: (_, record) => {
        // If this is the new row being added
        if (record.Id === newRowKey) {
          return (
            <Space size='middle'>
              <Button type='text' icon={<CheckOutlined />} size='small' onClick={() => saveNewRow(record.Id)} disabled={!newRowTitle.trim()}>
                تایید
              </Button>
              <Button icon={<CloseOutlined />} size='small' onClick={() => cancelNewRow(record.Id)}>
                انصراف
              </Button>
            </Space>
          );
        }

        // If this is an existing row being edited
        if (editingKey === record.Id) {
          return (
            <Space size='middle'>
              <Button type='text' icon={<CheckOutlined />} size='small' onClick={() => saveEdit(record)}></Button>
              <Button size='text' onClick={cancelEdit} icon={<CloseOutlined />}></Button>
            </Space>
          );
        }

        // Regular row operations
        return (
          <Space size='middle'>
            <Button type='text' icon={<MdOutlineEdit />} size='small' onClick={() => startEditing(record)}></Button>
            <Button type='text' icon={<FaRegTrashCan />} size='small' onClick={() => handleDelete(record.Id)}></Button>
            <Button type='text' icon={<PiTreeStructure />} size='small' onClick={() => handleAddChild(record.Id)}></Button>
          </Space>
        );
      },
    },
  ];

  // Prepare data for display - this maintains the hierarchy
  const displayData = prepareDataForDisplay(data);

  return (
    <div>
      <div className='border-b flex gap-4'>
        <div onClick={handleAddRoot} className=' flex gap-2 text-primary pb-3 cursor-pointer' disabled={!!newRowKey || !!editingKey}>
          <IoAddCircleOutline className='size-5' />
          <div style={{ fontSize: '13px' }} className='font-bold'>
            افزودن
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={displayData}
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpand: handleExpand,
        }}
      />
    </div>
  );
};

export default TrusteeUnit;
