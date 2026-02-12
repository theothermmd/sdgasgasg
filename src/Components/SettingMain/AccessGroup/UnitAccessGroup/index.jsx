import React, { useEffect, useState } from 'react';
import { Checkbox, TreeSelect, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { handlePermissions, handleUnitIds } from '../../../../features/AccessGroup';
import { useGetTrustee } from '../../../../ApiHooks/CommonHooks/Trustee';
const { SHOW_CHILD } = TreeSelect;
const UnitAccessGroup = () => {
  const [form] = Form.useForm();
  const [value, setValue] = useState([]); // مقادیر انتخاب‌شده در TreeSelect
  const [sourceData, setSourceData] = useState([]); // داده‌های درخت
  const dispatch = useDispatch();
  const editAccessGroup = useSelector((state) => state?.AccessGroup);
  const { data: UnitList, isLoading: isLoadingUnitList } = useGetTrustee();
  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };
  function findUnitById(Units, id) {
    for (let Unit of Units) {
      if (Unit.Id === id) {
        return Unit;
      }
      // فرض بر این است که فرزندان در آرایه‌ای مانند children ذخیره شده‌اند.
      if (Unit?.children && Unit?.children?.length > 0) {
        const found = findUnitById(Unit?.children, id);
        if (found) return found;
      }
    }
    return null;
  }
  useEffect(() => {
    if (UnitList?.data) {
      if (sourceData.length === 0) {
        setSourceData(TransForToSelectData(UnitList?.data, 'Title', 'Id'));
      }
    }
  }, [UnitList?.data]);
  useEffect(() => {
    if (!value?.length && editAccessGroup?.AccessGroupUnitDto?.length && !isLoadingUnitList) {
      const selectedOptions = editAccessGroup.AccessGroupUnitDto.map((idObj) => {
        // استفاده از تابع بازگشتی به جای find ساده
        const option = findUnitById(UnitList?.data, idObj);
        return option ? { label: option.Title, value: option.Id } : null;
      }).filter((option) => option !== null);

      setValue(selectedOptions);
    }
  }, [editAccessGroup, UnitList, value?.length]);
  // useEffect(() => {
  //   if (!value?.length && editAccessGroup?.AccessGroupUnitDto?.length) {
  //     const selectedOptions = editAccessGroup.AccessGroupUnitDto.map((id) => {
  //       const option = TreeUnitList.data.find(
  //         (item) => item.Id === id.UnitId
  //       );
  //       return option ? { label: option.Title, value: option.Id } : null;
  //     }).filter((option) => option !== null);

  //     setValue(selectedOptions);
  //   }
  // }, [editAccessGroup, TreeUnitList, value.length]);
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
  //   if (!isLoadingUnitList) {
  //     const transformedData = transformData(TreeUnitList?.data);
  //     setSourceData(transformedData);
  //   }
  // }, [TreeUnitList]);

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
    const UnitId = newValues.map((item) => item.value);
    dispatch(handleUnitIds(UnitId));
  };

  const onChange = (newValue) => {
    setValue(newValue);
    const UnitId = newValue.map((item) => item.value);
    dispatch(handleUnitIds(UnitId));
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
        const currentDelete = editAccessGroup.AccessGroupPropertiesDto.UnitDelete;
        const newDelete = !currentDelete;
        dispatch(handlePermissions({ action: '8', status: newDelete }));

        if (!currentDelete) {
          dispatch(handlePermissions({ action: '7', status: true }));
          dispatch(handlePermissions({ action: '6', status: true }));
        } else {
          dispatch(handlePermissions({ action: '7', status: false }));
          dispatch(
            handlePermissions({
              action: '6',
              status: editAccessGroup.AccessGroupAllAndNullDto.IsNullUnit,
            }),
          );
        }
        break;
      }
      case 'edit': {
        const currentEdit = editAccessGroup.AccessGroupPropertiesDto.UnitEdit;
        const newEdit = !currentEdit;
        dispatch(handlePermissions({ action: '7', status: newEdit }));
        dispatch(
          handlePermissions({
            action: '6',
            status: editAccessGroup.AccessGroupAllAndNullDto.IsNullUnit || !currentEdit,
          }),
        );
        break;
      }
      case 'view':
        dispatch(
          handlePermissions({
            action: '6',
            status: !editAccessGroup.AccessGroupPropertiesDto.UnitView,
          }),
        );
        break;
      default:
        break;
    }
  };
  const handleIncludes = (e) => {
    const status = e.target.checked ? e.target.checked : !editAccessGroup.AccessGroupPropertiesDto.UnitEdit ? false : true;
    dispatch(
      handlePermissions({
        action: '6',
        status: status,
      }),
    );
    dispatch(
      handleAccessGroupAllAndNullDto({
        action: 'Organ',
        status: e.target.checked,
      }),
    );
  };

  return (
    <div className='flex flex-row gap-10 p-4 bg-gray-50 rounded-xl shadow-sm'>
      {/* بخش انتخاب واحد متولی */}
      <div className='flex flex-col w-1/2 bg-white p-4 rounded-lg shadow-sm'>
        {/* <div className="flex items-center mb-4">
          <Checkbox
            checked={
              editAccessGroup?.AllAccessGroupAllAndNullDto?.IsNullUnit ||
              editAccessGroup?.AccessGroupAllAndNullDto?.IsNullUnit
            }
            className="me-2"
            onChange={handleIncludes}
          />
          <span className="text-sm text-gray-700">
            شامل دیتا های بدون عنوان واحد متولی می باشد.
          </span>
        </div> */}
        <label className='text-sm text-gray-700 mb-2 mr-1'>انتخاب واحد سازمانی:</label>
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
            action: '5',
            checked: editAccessGroup.AccessGroupPropertiesDto.UnitSubmit,
            disabled: false,
            onClick: () =>
              dispatch(
                handlePermissions({
                  action: '5',
                  status: !editAccessGroup.AccessGroupPropertiesDto.UnitSubmit,
                }),
              ),
          },
          {
            label: 'مشاهده',
            action: '6',
            checked: editAccessGroup.AccessGroupPropertiesDto.UnitView,
            disabled:
              editAccessGroup.AccessGroupPropertiesDto.UnitEdit || editAccessGroup.AccessGroupPropertiesDto.UnitDelete || editAccessGroup.AccessGroupAllAndNullDto.IsNullUnit,
            onClick: () => handleCheckbox('view'),
          },
          {
            label: 'ویرایش',
            action: '7',
            checked: editAccessGroup.AccessGroupPropertiesDto.UnitEdit,
            disabled: editAccessGroup.AccessGroupPropertiesDto.UnitDelete,
            onClick: () => handleCheckbox('edit'),
          },
          {
            label: 'حذف',
            action: '8',
            checked: editAccessGroup.AccessGroupPropertiesDto.UnitDelete,
            disabled: false,
            onClick: () => handleCheckbox('delete'),
          },
        ].map((item, idx) => (
          <div key={idx} className='mb-4'>
            <Checkbox className='text-sm' checked={item.checked} disabled={item.disabled} onClick={item.onClick}>
              {item.label}
            </Checkbox>
            <div className='text-xs text-blue-700 bg-blue-50 px-3 py-2 mt-1 rounded'>دسترسی به {item.label} منشور پروژه مربوط به واحد سازمانی انتخاب شده</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitAccessGroup;
