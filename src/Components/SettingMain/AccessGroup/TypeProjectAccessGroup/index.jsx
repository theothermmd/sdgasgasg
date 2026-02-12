import React, { useEffect, useState } from 'react';
import { Checkbox, TreeSelect, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { handleAccessGroupAllAndNullDto, handlePermissions, handleTypeProjectIds } from '../../../../features/AccessGroup';
import { useGetProjectType } from '../../../../ApiHooks/OtherSetting/ProjectType';
const { SHOW_CHILD } = TreeSelect;
const TypeProjectAccessGroup = () => {
  const [form] = Form.useForm();
  const [value, setValue] = useState([]); // مقادیر انتخاب‌شده در TreeSelect
  const [sourceData, setSourceData] = useState([]); // داده‌های درخت
  const dispatch = useDispatch();
  const editAccessGroup = useSelector((state) => state?.AccessGroup);
  const { data: ProjectTypeList, isLoading: isLoadingProjectTypeList } = useGetProjectType();
  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };
  function findTypeProjectById(TypeProjectIds, id) {
    for (let TypeProject of TypeProjectIds) {
      if (TypeProject.Id === id) {
        return TypeProject;
      }
      // فرض بر این است که فرزندان در آرایه‌ای مانند children ذخیره شده‌اند.
      if (TypeProject?.children && TypeProject?.children?.length > 0) {
        const found = findTypeProjectById(TypeProject?.children, id);
        if (found) return found;
      }
    }
    return null;
  }
  useEffect(() => {
    if (ProjectTypeList?.data) {
      if (sourceData.length === 0) {
        setSourceData(TransForToSelectData(ProjectTypeList?.data, 'Title', 'Id'));
      }
    }
  }, [ProjectTypeList?.data]);
  useEffect(() => {
    if (!value?.length && editAccessGroup?.AccessGroupTypeProjectDto?.length && !isLoadingProjectTypeList) {
      const selectedOptions = editAccessGroup.AccessGroupTypeProjectDto.map((idObj) => {
        // استفاده از تابع بازگشتی به جای find ساده
        const option = findTypeProjectById(ProjectTypeList?.data, idObj);
        return option ? { label: option.Title, value: option.Id } : null;
      }).filter((option) => option !== null);

      setValue(selectedOptions);
    }
  }, [editAccessGroup, ProjectTypeList, value?.length]);
  // useEffect(() => {
  //   if (!value?.length && editAccessGroup?.AccessGroupOrganDto?.length) {
  //     const selectedOptions = editAccessGroup.AccessGroupOrganDto.map((id) => {
  //       const option = TreeOrganizationalUnitList.data.find(
  //         (item) => item.Id === id.OrganId
  //       );
  //       return option ? { label: option.Title, value: option.Id } : null;
  //     }).filter((option) => option !== null);

  //     setValue(selectedOptions);
  //   }
  // }, [editAccessGroup, TreeOrganizationalUnitList, value.length]);
  // useEffect(() => {
  //   const transformData = (data) => {
  //     if (!Array.isArray(data)) return [];
  //     const transformItem = (item, index, parentIndex) => {
  //       const newItem = {
  //         row: !item.parentChapterId
  //           ? (index + 1).toString()
  //           : `${parentIndex}.${index + 1}`,
  //         id: item.Id,
  //         key: item.Id,
  //         label: item.Title,
  //         value: item.Id,
  //         ParentId: item.ParentId,
  //       };
  //       if (item.children && Array.isArray(item.children)) {
  //         newItem.children = item.children.map((child, childIndex) =>
  //           transformItem(child, childIndex, newItem.row)
  //         );
  //       }
  //       return newItem;
  //     };
  //     return data.map(transformItem);
  //   };
  //   if (!isLoadingOrganizationalUnitList) {
  //     const transformedData = transformData(TreeOrganizationalUnitList?.data);
  //     setSourceData(transformedData);
  //   }
  // }, [TreeOrganizationalUnitList]);

  const getAllValues = (nodes) => {
    let allValues = [];
    nodes.forEach((node) => {
      allValues.push({ value: node.value, label: node.title }); // تغییر از node.label به node.title
      if (node.children && node.children.length > 0) {
        allValues = allValues.concat(getAllValues(node.children));
      }
    });
    return allValues;
  };
  const allNodeValues = getAllValues(sourceData);
  const toggleSelectAll = () => {
    let newValues;
    if (value.length === allNodeValues.length) {
      newValues = [];
    } else {
      newValues = allNodeValues;
    }
    setValue(newValues);
    const TypeProjectId = newValues.map((item) => item.value);
    dispatch(handleTypeProjectIds(TypeProjectId));
  };

  const onChange = (newValue) => {
    setValue(newValue);
    const TypeProjectId = newValue.map((item) => item.value);
    dispatch(handleTypeProjectIds(TypeProjectId));
  };

  // محاسبه وضعیت انتخاب همه و indeterminate
  const isAllSelected = value.length === allNodeValues.length;
  const isIndeterminate = value.length > 0 && !isAllSelected;

  // تنظیمات TreeSelect
  const tProps = {
    treeData: sourceData,
    value,
    onChange,
    treeCheckStrictly: true,
    treeCheckable: true,
    labelInValue: true, // اینجا اضافه کنید
    // treeNodeLabelProp: "title",
    showCheckedStrategy: TreeSelect.SHOW_ALL,
    placeholder: 'لطفا انتخاب کنید',
    style: {
      width: '100%',
    },
  };
  const handleCheckbox = (permissionType) => {
    switch (permissionType) {
      case 'delete': {
        const currentDelete = editAccessGroup.AccessGroupPropertiesDto.TypeProjectDelete;
        const newDelete = !currentDelete;
        dispatch(handlePermissions({ action: '4', status: newDelete }));

        if (!currentDelete) {
          dispatch(handlePermissions({ action: '3', status: true }));
          dispatch(handlePermissions({ action: '2', status: true }));
        } else {
          dispatch(handlePermissions({ action: '3', status: false }));
          dispatch(
            handlePermissions({
              action: '3',
              status: editAccessGroup.AccessGroupAllAndNullDto.IsNullTypeProject,
            }),
          );
        }
        break;
      }
      case 'edit': {
        const currentEdit = editAccessGroup.AccessGroupPropertiesDto.TypeProjectEdit;
        const newEdit = !currentEdit;
        dispatch(handlePermissions({ action: '3', status: newEdit }));
        dispatch(
          handlePermissions({
            action: '2',
            status: editAccessGroup.AccessGroupAllAndNullDto.IsNullTypeProject || !currentEdit,
          }),
        );
        break;
      }
      case 'view':
        dispatch(
          handlePermissions({
            action: '2',
            status: !editAccessGroup.AccessGroupPropertiesDto.TypeProjectView,
          }),
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className='flex flex-row gap-10 p-4 bg-gray-50 rounded-xl shadow-sm'>
      {/* بخش انتخاب نوع پروژه */}
      <div className='flex flex-col w-1/2 bg-white p-4 rounded-lg shadow-sm'>
        {/* <div className="flex items-center mb-4">
          <Checkbox
            checked={
              editAccessGroup?.AllAccessGroupAllAndNullDto?.IsNullTypeProject ||
              editAccessGroup?.AccessGroupAllAndNullDto?.IsNullTypeProject
            }
            className="me-2"
            onChange={handleIncludes}
          />
          <span className="text-sm text-gray-700">
            شامل دیتا های بدون عنوان نوع پروژه می باشد.
          </span>
        </div> */}
        <label className='text-sm text-gray-700 mb-2 mr-1'>انتخاب نوع پروژه:</label>
        <TreeSelect
          showSearch
          className='w-full'
          allowClear
          direction='rtl'
          {...tProps}
          filterTreeNode={(inputValue, treeNode) => treeNode.title.toLowerCase().includes(inputValue.toLowerCase())}
          dropdownRender={(menu) => (
            <div>
              <div className='p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50' onClick={toggleSelectAll}>
                <Checkbox checked={isAllSelected} indeterminate={isIndeterminate}>
                  انتخاب همه
                </Checkbox>
              </div>
              {menu}
            </div>
          )}
        />
      </div>
      <div className='w-px bg-gray-300'></div>
      <div className='flex flex-col w-1/2 bg-white p-4 rounded-lg shadow-sm'>
        <div className='font-bold text-gray-800 mb-3'>سطح دسترسی:</div>

        {[
          {
            label: 'ثبت',
            action: '1',
            checked: editAccessGroup.AccessGroupPropertiesDto.TypeProjectSubmit,
            disabled: false,
            onClick: () =>
              dispatch(
                handlePermissions({
                  action: '1',
                  status: !editAccessGroup.AccessGroupPropertiesDto.TypeProjectSubmit,
                }),
              ),
          },
          {
            label: 'مشاهده',
            action: '2',
            checked: editAccessGroup.AccessGroupPropertiesDto.TypeProjectView,
            disabled:
              editAccessGroup.AccessGroupPropertiesDto.TypeProjectEdit ||
              editAccessGroup.AccessGroupPropertiesDto.TypeProjectDelete ||
              editAccessGroup.AccessGroupAllAndNullDto.IsNullTypeProject,
            onClick: () => handleCheckbox('view'),
          },
          {
            label: 'ویرایش',
            action: '3',
            checked: editAccessGroup.AccessGroupPropertiesDto.TypeProjectEdit,
            disabled: editAccessGroup.AccessGroupPropertiesDto.TypeProjectDelete,
            onClick: () => handleCheckbox('edit'),
          },
          {
            label: 'حذف',
            action: '4',
            checked: editAccessGroup.AccessGroupPropertiesDto.TypeProjectDelete,
            disabled: false,
            onClick: () => handleCheckbox('delete'),
          },
        ].map((item, idx) => (
          <div key={idx} className='mb-4'>
            <Checkbox className='text-sm' checked={item.checked} disabled={item.disabled} onClick={item.onClick}>
              {item.label}
            </Checkbox>
            <div className='text-xs text-blue-700 bg-blue-50 px-3 py-2 mt-1 rounded'>دسترسی به {item.label} منشور پروژه مربوط به نوع پروژه انتخاب شده</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypeProjectAccessGroup;
