import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Input, Space, Tooltip, message, Switch, TreeSelect, Modal, Popconfirm } from 'antd';

import {
  BarsOutlined,
  PlusCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
  CloseOutlined,
  MenuOutlined,
  CaretLeftFilled,
  CaretDownFilled,
  TableOutlined,
} from '@ant-design/icons';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';

import FormTableInside from './FormTableInside';

import { PiTreeStructure } from 'react-icons/pi';
import { RiAddCircleFill, RiCloseLine } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useGetAllCategoriesWithChildren,
  useCreateTabCheckList,
  useEditTabCheckList,
  useDeleteTabCheckListById,
  useCreateTabSubject,
  useEditTabSubject,
  useDeleteTabSubject,
  useReorderTabCheckList,
  useCreateTabForm,
  useEditTabForm,
  useDeleteTabForm,
  useReorderTabForm,
  useReorderTabFormSubject,
} from '../ApiHooks/OtherSetting/TabCheckList';

import { useGetLookUpTable } from '../ApiHooks/OtherSetting/LookUpTable';

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

const FormDetails = () => {
  const [searchParams] = useSearchParams();
  const access = searchParams.get('access');

  const formId = searchParams.get('FormId');

  const { data: AllCategoriesWithChildren, refetch: refetchAllCategoriesWithChildren } = useGetAllCategoriesWithChildren(formId);
  const { mutate: CreateTabForm } = useCreateTabForm();
  const { mutate: EditTabForm } = useEditTabForm();
  const { mutate: DeleteTabForm } = useDeleteTabForm();
  const { mutate: ReorderTabCheckList } = useReorderTabCheckList();
  const { mutate: ReorderTabForm } = useReorderTabForm();
  const { mutate: ReorderTabFormSubject } = useReorderTabFormSubject();

  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [editingData, setEditingData] = useState({});
  const [addingChildTo, setAddingChildTo] = useState('');
  const [addingChildType, setAddingChildType] = useState('');
  const [newChildData, setNewChildData] = useState({});
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [currentTableId, setCurrentTableId] = useState('');
  const { data: LookUpTables } = useGetLookUpTable();
  const [formTypeOptions, setformTypeOptions] = useState([]);
  useEffect(() => {
    if (LookUpTables && formTypeOptions.length === 0) {
      const lookuptablestostate = LookUpTables.data.map((value) => ({
        value: value.Id,
        label: value.Title,
      }));

      const test = {
        value: 'ReferenceTable',
        label: 'جدول مراجعه',
        children: lookuptablestostate,
      };

      setformTypeOptions([
        { value: 'Text', label: 'متن' },
        { value: 'LongText', label: 'متن بلند' },
        { value: 'Cost', label: 'هزینه' },
        { value: 'Number', label: 'عدد' },
        { value: 'Table', label: 'جدول' },
        { value: 'Date', label: 'تاریخ' },
        { value: 'Checkbox', label: 'چک باکس' },
        { value: 'Userlist', label: 'لیست کاربران' },
        test,
      ]);
    }
  }, [LookUpTables]);

  const { mutate: CreateTabCheckList } = useCreateTabCheckList();
  const { mutate: EditTabCheckList } = useEditTabCheckList();
  const { mutate: DeleteTabCheckList } = useDeleteTabCheckListById();

  const { mutate: CreateTabSubject } = useCreateTabSubject();
  const { mutate: EditTabSubject } = useEditTabSubject();
  const { mutate: DeleteTabSubject } = useDeleteTabSubject();

  useEffect(() => {
    if (AllCategoriesWithChildren) {
      setData(AllCategoriesWithChildren?.data);
    }
  }, [AllCategoriesWithChildren]);

  // Transform server data to table format
  const transformDataToTable = useCallback(() => {
    const result = [];

    const sortedData = [...data].sort((a, b) => a.Order - b.Order);

    sortedData.forEach((tab) => {
      // Add tab row
      result.push({
        key: tab.Id,
        id: tab.Id,
        title: tab.Title,
        order: tab.Order,
        type: 'تب',
        Visible: tab.Visible,
        required: null,
        level: 0,
        parentId: null,
        hasChildren: tab.TabFormSubjects && tab.TabFormSubjects.length > 0,
        isTable: false,
        Default: tab.Default,
        data: tab,
      });

      // Add subjects if tab is expanded
      if (expandedRowKeys.includes(tab.Id) && tab.TabFormSubjects) {
        const sortedSubjects = [...tab.TabFormSubjects].sort((a, b) => a.Order - b.Order);

        sortedSubjects.forEach((subject) => {
          result.push({
            key: subject.Id,
            id: subject.Id,
            title: subject.Title,
            order: subject.Order,
            type: 'سر فصل',
            Visible: subject.Visible,
            required: null,
            level: 1,
            parentId: tab.Id,
            hasChildren: subject.TabFormDtos && subject.TabFormDtos.length > 0,
            isTable: false,
            data: subject,
          });

          // Add forms if subject is expanded
          if (expandedRowKeys.includes(subject.Id) && subject.TabFormDtos) {
            const sortedForms = [...subject.TabFormDtos].sort((a, b) => a.Order - b.Order);

            sortedForms.forEach((form) => {
              result.push({
                key: form.Id,
                id: form.Id,
                title: form.Title,
                order: form.Order,
                type: form.Type,
                Visible: form.Visible,
                required: form.IsRequired,
                LookupTableId: form.LookupTableId,
                isChoosen: form.IsChoosen,
                level: 2,
                parentId: subject.Id,
                hasChildren: false,
                isTable: form.IsTable,
                data: form,
              });
            });
          }

          // Add "adding form" row if needed
          if (addingChildTo === subject.Id && addingChildType === 'form') {
            result.push({
              key: `adding-form-${subject.Id}`,
              id: `adding-form-${subject.Id}`,
              title: '',
              order: -1,
              type: 'Text',
              Visible: true,
              LookupTableId: '',
              required: false,
              level: 2,
              parentId: subject.Id,
              addingType: 'form',
              hasChildren: false,
              isTable: false,
            });
          }
        });
      }

      // Add "adding subject" row if needed
      if (addingChildTo === tab.Id && addingChildType === 'subject') {
        result.push({
          key: `adding-subject-${tab.Id}`,
          id: `adding-subject-${tab.Id}`,
          title: '',
          order: -1,
          type: 'سر فصل',
          Visible: true,
          required: null,
          level: 1,
          parentId: tab.Id,
          addingType: 'subject',
          hasChildren: false,
          isTable: false,
        });
      }
    });

    return result;
  }, [data, expandedRowKeys, addingChildTo, addingChildType]);

  const tableData = transformDataToTable();

  // Toggle expand/collapse
  const toggleExpand = (record) => {
    const newExpandedKeys = [...expandedRowKeys];
    const index = newExpandedKeys.indexOf(record.id);

    if (index > -1) {
      newExpandedKeys.splice(index, 1);
    } else {
      newExpandedKeys.push(record.id);
    }

    setExpandedRowKeys(newExpandedKeys);
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
  // Add new tab
  const addNewTab = () => {
    const newId = `new-tab-${Date.now()}`;
    const maxOrder = Math.max(...data.map((item) => item.Order), -1);

    const newTab = {
      Id: newId,
      Title: '',
      Order: maxOrder + 1,
      Default: false,
      Visible: true,
      TabCategoriesId: null,
      TabFormSubjects: [],
    };

    setData([...data, newTab]);
    setEditingKey(newId);
    setEditingData({ title: '' });
  };

  // Toggle visibility
  const toggleVisibility = (record) => {
    const newData = [...data];

    if (record.level === 0) {
      // Toggle tab visibility
      const tabIndex = newData.findIndex((tab) => tab.Id === record.id);
      if (tabIndex > -1) {
        newData[tabIndex] = { ...newData[tabIndex], Visible: !newData[tabIndex].Visible };
      }
      EditTabCheckList(
        {
          Id: record.id,
          Title: record.title,
          Order: record.order,
          Default: record.Default,
          Visible: !record.Visible,
          TabCategoriesId: formId,
        },
        {
          onSuccess: () => {
            refetchAllCategoriesWithChildren();
          },
        },
      );
    } else if (record.level === 1) {
      // Toggle subject visibility
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          const subjectIndex = tab.TabFormSubjects.findIndex((subject) => subject.Id === record.id);
          if (subjectIndex > -1) {
            tab.TabFormSubjects[subjectIndex] = {
              ...tab.TabFormSubjects[subjectIndex],
              Visible: !tab.TabFormSubjects[subjectIndex].Visible,
            };
          }
        }
      });
      EditTabSubject(
        {
          Id: record.id,
          Title: record.title,
          Visible: !record.Visible,
          Default: record.Default,
          Order: record.order,
          TabCheckListId: record.parentId,
        },
        {
          onSuccess: () => {
            refetchAllCategoriesWithChildren();
          },
        },
      );
    } else if (record.level === 2) {
      // Toggle form visibility
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          tab.TabFormSubjects.forEach((subject) => {
            if (subject.TabFormDtos) {
              const formIndex = subject.TabFormDtos.findIndex((form) => form.Id === record.id);
              if (formIndex > -1) {
                subject.TabFormDtos[formIndex] = {
                  ...subject.TabFormDtos[formIndex],
                  Visible: !subject.TabFormDtos[formIndex].Visible,
                };
              }
            }
          });
        }
      });
      console.log(record);

      const isChoosenToSend = editingData.isChoosen !== undefined ? editingData.isChoosen : record.data?.IsChoosen;
      console.log('dsd : ', record);

      EditTabForm(
        {
          Id: record.id,
          Title: record.title,
          Type: record.type,
          Visible: !record.Visible,
          IsRequired: record.IsRequired,
          Default: record.Default,
          IsChoosen: isChoosenToSend,
          LookupTableId: record.LookupTableId,
          Order: record.order,
          IsTable: record.isTable,
          TabFormSubjectId: record.parentId,
        },
        {
          onSuccess: () => {
            refetchAllCategoriesWithChildren();
          },
        },
      );
    }

    setData(newData);
  };

  // Start editing
  const startEdit = (record) => {
    setEditingKey(record.id);
    setEditingData({
      title: record.title,
      type: record.type,
      required: record.required,
    });
  };

  // Save edit
  const saveEdit = () => {
    if (!editingData.title || !editingData.title.trim()) {
      message.error('عنوان نمیتواند خالی باشد.');
      return;
    }

    const record = tableData.find((item) => item.id === editingKey);
    const newData = [...data];

    if (record.level === 0) {
      // Edit tab
      const tabIndex = newData.findIndex((tab) => tab.Id === editingKey);
      if (tabIndex > -1) {
        newData[tabIndex] = { ...newData[tabIndex], Title: editingData.title };
      }
      if (record.id.includes('new')) {
        CreateTabCheckList(
          {
            Title: editingData.title,
            Order: record.order,
            Default: false,
            Visible: record.Visible,
            TabCategoriesId: formId,
          },

          {
            onSuccess: () => {
              refetchAllCategoriesWithChildren();
              message.success('تب با موفقیت ساخته شد.');
            },
          },
        );
        return;
      }
      EditTabCheckList(
        {
          Id: record.id,
          Title: editingData.title,
          Order: record.order,
          Default: false,
          Visible: record.Visible,
          TabCategoriesId: formId,
        },

        {
          onSuccess: () => {
            refetchAllCategoriesWithChildren();
            message.success('تب با موفقیت بروزرسانی  شد.');
          },
        },
      );
    } else if (record.level === 1) {
      // Edit subject
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          const subjectIndex = tab.TabFormSubjects.findIndex((subject) => subject.Id === editingKey);
          if (subjectIndex > -1) {
            tab.TabFormSubjects[subjectIndex] = {
              ...tab.TabFormSubjects[subjectIndex],
              Title: editingData.title,
            };
          }
        }
      });
      EditTabSubject(
        {
          Id: record.id,
          Title: editingData.title,
          Visible: record.Visible,
          Default: record.Default,
          Order: record.order,
          TabCheckListId: record.parentId,
        },
        {
          onSuccess: () => {
            message.success('سر فصل با موفقیت بروزرسانی شد.');
            refetchAllCategoriesWithChildren();
          },
        },
      );
    } else if (record.level === 2) {
      // Edit Tab form
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          tab.TabFormSubjects.forEach((subject) => {
            if (subject.TabFormDtos) {
              const formIndex = subject.TabFormDtos.findIndex((form) => form.Id === editingKey);
              if (formIndex > -1) {
                subject.TabFormDtos[formIndex] = {
                  ...subject.TabFormDtos[formIndex],
                  Title: editingData.title,
                  IsRequired: editingData.required,
                };
              }
            }
          });
        }
      });
      console.log(record);
      const isChoosenToSend = editingData.isChoosen !== undefined ? editingData.isChoosen : record.data?.IsChoosen;

      EditTabForm(
        {
          Id: record.id,
          Title: editingData.title,
          Type: record.type,
          Visible: record.Visible,
          IsRequired: editingData.required,
          Default: record.default,
          IsChoosen: isChoosenToSend,
          Order: record.order,
          LookupTableId: record.LookupTableId,
          IsTable: record.isTable,
          TabFormSubjectId: record.parentId,
        },
        {
          onSuccess: () => {
            refetchAllCategoriesWithChildren();
          },
        },
      );
    }

    setData(newData);
    setEditingKey('');
    setEditingData({});
    message.success('بروزرسانی با موفقیت انجام شد.');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingKey('');
    setEditingData({});
  };

  // Delete row
  const deleteRow = (record) => {
    const newData = [...data];

    if (record.level === 0) {
      // Delete tab
      const tabIndex = newData.findIndex((tab) => tab.Id === record.id);
      if (tabIndex > -1) {
        newData.splice(tabIndex, 1);
      }
      DeleteTabCheckList(record.id, {
        onSuccess: () => {
          message.success('تب با موفقیت حذف شد.');
          refetchAllCategoriesWithChildren();
        },
      });
    } else if (record.level === 1) {
      // Delete subject
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          tab.TabFormSubjects = tab.TabFormSubjects.filter((subject) => subject.Id !== record.id);
        }
      });
      DeleteTabSubject(record.id, {
        onSuccess: () => {
          message.success('سر فصل با موفقیت حذف شد.');
          refetchAllCategoriesWithChildren();
        },
      });
    } else if (record.level === 2) {
      // Delete form
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          tab.TabFormSubjects.forEach((subject) => {
            if (subject.TabFormDtos) {
              subject.TabFormDtos = subject.TabFormDtos.filter((form) => form.Id !== record.id);
            }
          });
        }
      });
      DeleteTabForm(record.id, {
        onSuccess: () => {
          message.success('ورودی  با موفقیت حذف شد.');
          refetchAllCategoriesWithChildren();
        },
      });
    }

    setData(newData);
  };

  // Add child
  const addChild = (parentId, childType) => {
    setAddingChildTo(parentId);
    setAddingChildType(childType);
    setNewChildData({
      title: '',
      type: 'Text',
      required: false,
    });

    // Auto expand parent if not already expanded
    if (!expandedRowKeys.includes(parentId)) {
      setExpandedRowKeys([...expandedRowKeys, parentId]);
    }
  };

  // Save new child
  const saveNewChild = () => {
    if (!newChildData.title || !newChildData.title.trim()) {
      message.error('عنوان نمیتواند خالی باشد.');
      return;
    }

    const newChildId = `${addingChildType}-${Date.now()}`;
    const newData = [...data];

    if (addingChildType === 'subject') {
      // Add new subject
      const tab = newData.find((tab) => tab.Id === addingChildTo);
      if (tab) {
        if (!tab.TabFormSubjects) {
          tab.TabFormSubjects = [];
        }
        const maxOrder = tab.TabFormSubjects.length > 0 ? Math.max(...tab.TabFormSubjects.map((s) => s.Order)) : -1;

        const newSubject = {
          Id: newChildId,
          Title: newChildData.title,
          Visible: true,
          Order: maxOrder + 1,
          TabCheckListId: addingChildTo,
          TabFormDtos: [],
        };

        tab.TabFormSubjects.push(newSubject);
        CreateTabSubject(
          {
            Title: newChildData.title,
            Order: maxOrder + 1,
            Visible: true,
            TabCheckListId: addingChildTo,
          },

          {
            onSuccess: () => {
              refetchAllCategoriesWithChildren();
              message.success('سر فصل با موفقیت ساخته شد.');
            },
          },
        );
      }
    } else if (addingChildType === 'form') {
      // Add new form
      newData.forEach((tab) => {
        if (tab.TabFormSubjects) {
          const subject = tab.TabFormSubjects.find((s) => s.Id === addingChildTo);
          if (subject) {
            if (!subject.TabFormDtos) {
              subject.TabFormDtos = [];
            }
            const maxOrder = subject.TabFormDtos.length > 0 ? Math.max(...subject.TabFormDtos.map((f) => f.Order)) : -1;

            const newForm = {
              Id: newChildId,
              Title: newChildData.title,
              Type: newChildData.type,
              Visible: true,
              IsRequired: newChildData.required,
              IsChoosen: newChildData.isChoosen || false,
              Order: maxOrder + 1,
              IsTable: newChildData.type === 'Table',
              TabFormSubjectId: addingChildTo,
              TableFormInsideDtos: [],
            };

            const Defaulttypes = ['Text', 'LongText', 'Cost', 'Number', 'Date', 'Table', 'Checkbox', 'Userlist'];

            CreateTabForm(
              {
                Title: newChildData.title,
                Type: !Defaulttypes.includes(newChildData.type) ? 'LookUp' : newChildData.type,
                IsRequired: newChildData.required,
                Default: false,
                Visible: true,
                Order: maxOrder + 1,
                IsChoosen: newChildData.isChoosen || false,
                IsTable: newChildData.type === 'Table',
                LookupTableId: !Defaulttypes.includes(newChildData.type) ? newChildData.type : null,
                TabFormSubjectId: addingChildTo,
              },
              {
                onSuccess: () => {
                  message.success('ورودی با موفقیت ایجاد شد.');
                  refetchAllCategoriesWithChildren();
                },
              },
            );

            subject.TabFormDtos.push(newForm);
          }
        }
      });
    }

    setData(newData);
    setAddingChildTo('');
    setAddingChildType('');
    setNewChildData({});
  };

  // Cancel new child
  const cancelNewChild = () => {
    setAddingChildTo('');
    setAddingChildType('');
    setNewChildData({});
  };

  // Handle table modal
  const openTableModal = (id) => {
    setCurrentTableId(id);
    setTableModalVisible(true);
  };

  // Toggle required status
  const toggleRequired = (record, checked) => {
    const newData = [...data];

    newData.forEach((tab) => {
      if (tab.TabFormSubjects) {
        tab.TabFormSubjects.forEach((subject) => {
          if (subject.TabFormDtos) {
            const formIndex = subject.TabFormDtos.findIndex((form) => form.Id === record.id);
            if (formIndex > -1) {
              subject.TabFormDtos[formIndex] = {
                ...subject.TabFormDtos[formIndex],
                IsRequired: checked,
              };
            }
          }
        });
      }
    });

    setData(newData);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tableData.findIndex((item) => item.key === active.id);
    const newIndex = tableData.findIndex((item) => item.key === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const activeItem = tableData[oldIndex];
    const overItem = tableData[newIndex];

    // Only allow reordering within the same level and parent
    if (activeItem.level !== overItem.level || activeItem.parentId !== overItem.parentId) {
      console.warn('Reordering only allowed within same level and parent');
      message.warning('انتقال فقط درون همان سطح و والد مجاز است.');
      return;
    }

    const newData = [...data];

    if (activeItem.level === 0) {
      // --- Reorder Tabs (Top Level) ---
      const activeTabIndex = newData.findIndex((tab) => tab.Id === activeItem.id);
      const overTabIndex = newData.findIndex((tab) => tab.Id === overItem.id);

      if (activeTabIndex !== -1 && overTabIndex !== -1) {
        // Get only the visible tabs for correct ordering
        const sortedTabs = [...newData].sort((a, b) => a.Order - b.Order);
        const activeSortedIndex = sortedTabs.findIndex((tab) => tab.Id === activeItem.id);
        const overSortedIndex = sortedTabs.findIndex((tab) => tab.Id === overItem.id);

        // Reorder within the sorted array
        const reorderedTabs = arrayMove(sortedTabs, activeSortedIndex, overSortedIndex);

        // Update Order properties and apply to original data
        reorderedTabs.forEach((tab, index) => {
          const originalIndex = newData.findIndex((t) => t.Id === tab.Id);
          if (originalIndex !== -1) {
            newData[originalIndex] = { ...newData[originalIndex], Order: index };
          }
        });

        setData(newData);

        ReorderTabCheckList(
          {
            MovedItemId: activeItem.id,
            NewPosition: overSortedIndex + 1, // Position within sorted tabs
            TabCategoriesId: formId,
          },
          {
            onSuccess: () => {
              refetchAllCategoriesWithChildren();
            },
            onError: (error) => {
              console.error('Reorder Tab failed:', error);
              setData([...data]);
              message.error('خطا در تغییر ترتیب تب.');
            },
          },
        );
      }
    } else if (activeItem.level === 1) {
      // --- Reorder Subjects (Children of a Tab) ---
      const parentId = activeItem.parentId;
      const parentTabIndex = newData.findIndex((tab) => tab.Id === parentId);

      if (parentTabIndex !== -1) {
        const parentTab = newData[parentTabIndex];
        const subjects = [...(parentTab.TabFormSubjects || [])];

        // Sort subjects by their current order
        const sortedSubjects = subjects.sort((a, b) => a.Order - b.Order);

        // Find indices in the sorted array
        const activeSortedIndex = sortedSubjects.findIndex((s) => s.Id === activeItem.id);
        const overSortedIndex = sortedSubjects.findIndex((s) => s.Id === overItem.id);

        if (activeSortedIndex !== -1 && overSortedIndex !== -1) {
          // Reorder within sorted subjects
          const reorderedSubjects = arrayMove(sortedSubjects, activeSortedIndex, overSortedIndex);

          // Update Order properties
          const updatedSubjects = reorderedSubjects.map((subject, index) => ({
            ...subject,
            Order: index,
          }));

          // Update the parent tab
          const updatedParentTab = {
            ...parentTab,
            TabFormSubjects: updatedSubjects,
          };

          newData[parentTabIndex] = updatedParentTab;
          setData(newData);

          ReorderTabFormSubject(
            {
              MovedItemId: activeItem.id,
              NewPosition: overSortedIndex + 1, // Position within sorted subjects
              TabChecklistId: parentId,
            },
            {
              onSuccess: () => {
                refetchAllCategoriesWithChildren();
              },
              onError: (error) => {
                console.error('Reorder Subject failed:', error);
                setData([...data]);
                message.error('خطا در تغییر ترتیب سر فصل.');
              },
            },
          );
        }
      }
    } else if (activeItem.level === 2) {
      // --- Reorder Forms (Children of a Subject) ---
      const parentId = activeItem.parentId;

      // Find the parent subject
      let foundParent = false;
      for (let i = 0; i < newData.length; i++) {
        const tab = newData[i];
        if (tab.TabFormSubjects) {
          const subjectIndex = tab.TabFormSubjects.findIndex((s) => s.Id === parentId);
          if (subjectIndex !== -1) {
            const parentSubject = tab.TabFormSubjects[subjectIndex];
            const forms = [...(parentSubject.TabFormDtos || [])];

            // Sort forms by their current order
            const sortedForms = forms.sort((a, b) => a.Order - b.Order);

            // Find indices in the sorted array
            const activeSortedIndex = sortedForms.findIndex((f) => f.Id === activeItem.id);
            const overSortedIndex = sortedForms.findIndex((f) => f.Id === overItem.id);

            if (activeSortedIndex !== -1 && overSortedIndex !== -1) {
              // Reorder within sorted forms
              const reorderedForms = arrayMove(sortedForms, activeSortedIndex, overSortedIndex);

              // Update Order properties
              const updatedForms = reorderedForms.map((form, index) => ({
                ...form,
                Order: index,
              }));

              // Update the parent subject
              const updatedParentSubject = {
                ...parentSubject,
                TabFormDtos: updatedForms,
              };

              // Update the grandparent tab
              const updatedParentTab = {
                ...tab,
                TabFormSubjects: [...tab.TabFormSubjects.slice(0, subjectIndex), updatedParentSubject, ...tab.TabFormSubjects.slice(subjectIndex + 1)],
              };

              newData[i] = updatedParentTab;
              setData(newData);

              ReorderTabForm(
                {
                  MovedItemId: activeItem.id,
                  NewPosition: overSortedIndex + 1, // Position within sorted forms
                  TabSubjectId: parentId,
                },
                {
                  onSuccess: () => {
                    refetchAllCategoriesWithChildren();
                  },
                  onError: (error) => {
                    console.error('Reorder Form failed:', error);
                    setData([...data]);
                    message.error('خطا در تغییر ترتیب ورودی.');
                  },
                },
              );

              foundParent = true;
              break;
            }
          }
        }
        if (foundParent) break;
      }

      if (!foundParent) {
        console.error('Could not find parent subject for form reorder');
        message.error('خطا در یافتن والد برای تغییر ترتیب ورودی.');
      }
    }
  };

  // Row styles
  const getRowClassName = (record) => {
    if (record.level === 1) return 'subject-row';
    if (record.level === 2) return 'form-row';
    return '';
  };

  const columns = [
    {
      title: 'ترتیب',
      dataIndex: 'order',
      width: 80,
      align: 'center',
      render: (_, record) => {
        if (record.addingType) return null;
        return record.order;
      },
    },
    {
      title: 'عنوان',
      dataIndex: 'title',
      align: 'right',
      render: (text, record) => {
        const isEditing = editingKey === record.id;
        const indent = record.level * 24;

        if (record.addingType) {
          return (
            <div style={{ marginRight: indent }}>
              <Input
                placeholder={`عنوان ${record.addingType === 'form' ? 'ورودی' : 'سر فصل'} را وارد کنید...`}
                value={newChildData.title}
                onChange={(e) => setNewChildData({ ...newChildData, title: e.target.value })}
                onPressEnter={saveNewChild}
                autoFocus
                size='middle'
              />
            </div>
          );
        }

        if (isEditing) {
          return (
            <div style={{ marginRight: indent }}>
              <Input
                placeholder='عنوان را وارد کنید...'
                value={editingData.title}
                onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                onPressEnter={saveEdit}
                autoFocus
              />
            </div>
          );
        }

        return (
          <div
            style={{
              opacity: record.Visible ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {record.hasChildren && (
              <Button
                type='text'
                size='small'
                icon={expandedRowKeys.includes(record.id) ? <CaretDownFilled /> : <CaretLeftFilled />}
                onClick={() => toggleExpand(record)}
                style={{ marginLeft: 8, padding: '0 4px' }}
              />
            )}
            {!record.hasChildren && record.level < 2 && <span></span>}
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      width: 150,
      align: 'center',
      render: (type, record) => {
        if (record.addingType === 'form') {
          return (
            <TreeSelect
              treeData={formTypeOptions}
              showSearch
              treeNodeFilterProp='label'
              value={newChildData.type}
              onChange={(value) => setNewChildData({ ...newChildData, type: value })}
              placeholder='انتخاب نوع'
              size='middle'
              style={{ width: '100%' }}
            />
          );
        }

        return <span>{getTypeLabel(type, record.LookupTableId)}</span>;
      },
    },
    {
      title: 'چند گزینه ای',
      dataIndex: 'isChoosen',
      width: 100,
      align: 'center',
      render: (isChoosen, record) => {
        // Only show for forms (level 2)
        if (record.level !== 2) return null;

        // Handle adding new form row
        if (record.addingType === 'form') {
          return (
            <Switch
              checked={newChildData.isChoosen || false} // Default to false if undefined
              onChange={(checked) => setNewChildData({ ...newChildData, isChoosen: checked })}
              size='middle'
            />
          );
        }

        // Handle editing existing form row
        const isEditing = editingKey === record.id;
        if (isEditing) {
          return (
            <Switch
              checked={editingData.isChoosen !== undefined ? editingData.isChoosen : record.data?.IsChoosen || false} // Fallback to record data if editingData not set yet
              onChange={(checked) => setEditingData({ ...editingData, isChoosen: checked })}
              size='middle'
            />
          );
        }

        // Display for non-editing rows
        return (
          <Switch
            checked={record.data?.IsChoosen || false} // Fallback to false if undefined
            size='small'
            disabled // Make it non-interactive outside edit mode, similar to required column display
          />
        );
      },
    },

    {
      title: 'ضروری بودن',
      dataIndex: 'required',
      width: 100,
      align: 'center',
      render: (required, record) => {
        if (record.level !== 2) return null;

        if (record.addingType === 'form') {
          return <Switch checked={newChildData.required} onChange={(checked) => setNewChildData({ ...newChildData, required: checked })} size='middle' />;
        }

        const isEditing = editingKey === record.id;

        if (isEditing) {
          return <Switch checked={editingData.required} onChange={(checked) => setEditingData({ ...editingData, required: checked })} size='middle' />;
        }

        return (
          <Switch
            checked={required}
            size='small'
            disabled={!editingKey || record.Id !== record}
            onChange={(checked) => {
              toggleRequired(record, checked);
            }}
          />
        );
      },
    },
    {
      title: 'عملیات',
      dataIndex: 'operations',
      width: 200,
      align: 'center',
      // align: 'center',
      render: (_, record) => {
        const isEditing = editingKey === record.id;

        if (record.addingType) {
          return (
            <Space>
              <Tooltip title='ذخیره'>
                <Button type='text' icon={<CheckOutlined />} size='small' onClick={saveNewChild} />
              </Tooltip>
              <Tooltip title='انصراف'>
                <Button type='text' icon={<CloseOutlined />} size='small' onClick={cancelNewChild} />
              </Tooltip>
            </Space>
          );
        }

        if (isEditing) {
          return (
            <Space>
              <Tooltip title='ذخیره'>
                <Button type='text' icon={<CheckOutlined />} size='small' onClick={saveEdit} />
              </Tooltip>
              <Tooltip title='انصراف'>
                <Button type='text' icon={<CloseOutlined />} size='small' onClick={cancelEdit} />
              </Tooltip>
            </Space>
          );
        }

        const operations = [];

        // Hide/Show button
        operations.push(
          <Tooltip key='visibility' title={record.Visible ? 'مخفی کردن' : 'نمایش دادن'}>
            <Button type='text' icon={record.Visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} size='small' onClick={() => toggleVisibility(record)} />
          </Tooltip>,
        );

        // Edit button
        operations.push(
          <Tooltip key='edit' title='ویرایش'>
            <Button type='text' icon={<MdOutlineEdit />} size='small' onClick={() => startEdit(record)} />
          </Tooltip>,
        );

        // Delete button (not for default tabs)
        if (!(record.level === 0 && record.Default) && access === 'sazmanyartech') {
          operations.push(
            <Tooltip key='delete' title='حذف'>
              <Button type='text' icon={<FaRegTrashCan />} size='small' danger onClick={() => deleteRow(record)} />
            </Tooltip>,
          );
        }

        // Add child button for tabs and subjects
        if (record.level === 0 && access === 'sazmanyartech') {
          operations.push(
            <Tooltip key='add-subject' title='افزودن سر فصل جدید'>
              <Button type='text' icon={<PiTreeStructure />} size='small' onClick={() => addChild(record.id, 'subject')} />
            </Tooltip>,
          );
        } else if (record.level === 1 && access === 'sazmanyartech') {
          operations.push(
            <Tooltip key='add-form' title='افزودن ورودی جدید'>
              <Button type='text' icon={<BarsOutlined />} size='small' onClick={() => addChild(record.id, 'form')} />
            </Tooltip>,
          );
        }

        // Table modal button for forms with IsTable = true
        if (record.level === 2 && record.isTable) {
          operations.push(
            <Tooltip key='table-config' title='تنظیمات جدول'>
              <Button type='text' icon={<TableOutlined />} size='small' onClick={() => openTableModal(record.id)} />
            </Tooltip>,
          );
        }

        return <Space>{operations}</Space>;
      },
    },
  ];

  const rowStyles = `
    .subject-row {
      background-color: #ededed !important;
    }
    .form-row {
      background-color: #f8f8f8 !important;
    }
    .ant-table {
      direction: rtl;
    }
    .ant-table-thead > tr > th {
      text-align: center;
    }
  `;

  return (
    <div style={{ direction: 'rtl' }} className='px-0.4 py-4'>
      <style>{rowStyles}</style>

      {access === 'sazmanyartech' && (
        <div className='flex items-center justify-between border-b border-gray-300 pb-4 mb-8 mt-2'>
          <button onClick={addNewTab} className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200'>
            <RiAddCircleFill size={26} className='text-blue-500' />
            <span className='text-sm font-semibold hover:cursor-pointer'>ایجاد تب جدید</span>
          </button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={tableData.filter((item) => !item.addingType).map((item) => item.key)} strategy={verticalListSortingStrategy}>
          <Table
            components={{
              body: {
                row: (props) => {
                  if (props['data-row-key'] && props['data-row-key'].toString().startsWith('adding-')) {
                    return <tr {...props} />;
                  }
                  return <SortableRow {...props} />;
                },
              },
            }}
            columns={columns}
            dataSource={tableData}
            pagination={false}
            rowKey='key'
            size='middle'
            rowClassName={getRowClassName}
            scroll={{ x: 800 }}
          />
        </SortableContext>
      </DndContext>

      {/* Table Configuration Modal */}
      <Modal
        title='تنظیمات جدول'
        open={tableModalVisible}
        onCancel={() => setTableModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setTableModalVisible(false)}>
            بستن پنجره
          </Button>,
        ]}
        className='!min-w-[80vw]'
      >
        <FormTableInside Tableid={currentTableId} />
      </Modal>
    </div>
  );
};

export default FormDetails;
