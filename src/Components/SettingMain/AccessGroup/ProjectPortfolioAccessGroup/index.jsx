import React, { useEffect, useState } from 'react';
import { Checkbox, TreeSelect, Form } from 'antd';
import { handleAccessGroupAllAndNullDto, handlePermissions, handleprojectPortfolioIds } from '../../../../features/AccessGroup';
import { useGetProjectPortfolio } from '../../../../ApiHooks/OtherSetting/ProjectPortfolio';
import { useDispatch, useSelector } from 'react-redux';
const { SHOW_CHILD } = TreeSelect;
const ProjectPortfolioAccessGroup = () => {
  const [form] = Form.useForm();
  const [value, setValue] = useState([]); // مقادیر انتخاب‌شده در TreeSelect
  const [sourceData, setSourceData] = useState([]); // داده‌های درخت
  const dispatch = useDispatch();
  const editAccessGroup = useSelector((state) => state?.AccessGroup);
  const { data: ProjectPortfolioList, isLoading: isLoadingProjectPortfolioList } = useGetProjectPortfolio();
  const TransFormToTreeSelectData = (array) => {
    const transformData = (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      const transformItem = (item) => {
        const newItem = {
          lable: item.Title,
          title: item.Title,
          value: item.Id,
          parentKey: item.ParentId,
        };
        if (item.Children && Array.isArray(item.Children)) {
          newItem.children = item.Children.map((child, childIndex) => transformItem(child, childIndex));
        }
        return newItem;
      };
      return data.map(transformItem);
    };

    const transformedData = transformData(array);

    return transformedData;
  };
  useEffect(() => {
    if (ProjectPortfolioList?.data) {
      if (sourceData.length === 0) {
        setSourceData(TransFormToTreeSelectData(ProjectPortfolioList?.data));
      }
    }
  }, [ProjectPortfolioList?.data]);
  function findProjectPortfolioById(ProjectPortfolios, id) {
    for (let portfolio of ProjectPortfolios) {
      if (portfolio.Id === id) {
        return portfolio;
      }
      // فرض بر این است که فرزندان در آرایه‌ای مانند children ذخیره شده‌اند.
      if (portfolio?.Children && portfolio?.Children?.length > 0) {
        const found = findProjectPortfolioById(portfolio?.Children, id);
        if (found) return found;
      }
    }
    return null;
  }
  //  function findProjectPortfolioById(portfolios, id) {
  //     for (let portfolio of portfolios) {
  //       if (portfolio.Id === id) {
  //         return portfolio;
  //       }
  //     }
  //     return null;
  //   }
  useEffect(() => {
    if (!value?.length && editAccessGroup?.AccessGroupProjectPortfolioDto?.length && !isLoadingProjectPortfolioList) {
      const selectedOptions = editAccessGroup.AccessGroupProjectPortfolioDto.map((idObj) => {
        // استفاده از تابع بازگشتی به جای find ساده
        const option = findProjectPortfolioById(ProjectPortfolioList?.data, idObj);
        return option ? { label: option.Title, value: option.Id } : null;
      }).filter((option) => option !== null);

      setValue(selectedOptions);
    }
  }, [editAccessGroup, ProjectPortfolioList, value?.length]);
  // useEffect(() => {
  //   if (!value?.length && editAccessGroup?.AccessGroupUnitDto?.length) {
  //     const selectedOptions = editAccessGroup.AccessGroupUnitDto.map((id) => {
  //       const option = TreeOrganizationalUnitList.data.find(
  //         (item) => item.Id === id.UnitId
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
    const ProjectPortfolioId = newValues.map((item) => item.value);
    dispatch(handleprojectPortfolioIds(ProjectPortfolioId));
  };

  const onChange = (newValue) => {
    setValue(newValue);
    const ProjectPortfolioId = newValue.map((item) => item.value);
    dispatch(handleprojectPortfolioIds(ProjectPortfolioId));
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
        const currentDelete = editAccessGroup.AccessGroupPropertiesDto.projectPortfolioDelete;
        const newDelete = !currentDelete;
        dispatch(handlePermissions({ action: '12', status: newDelete }));

        if (!currentDelete) {
          dispatch(handlePermissions({ action: '11', status: true }));
          dispatch(handlePermissions({ action: '10', status: true }));
        } else {
          dispatch(handlePermissions({ action: '11', status: false }));
          dispatch(
            handlePermissions({
              action: '10',
              status: editAccessGroup.AccessGroupAllAndNullDto.IsNullprojectPortfolio,
            }),
          );
        }
        break;
      }
      case 'edit': {
        const currentEdit = editAccessGroup.AccessGroupPropertiesDto.projectPortfolioEdit;
        const newEdit = !currentEdit;
        dispatch(handlePermissions({ action: '11', status: newEdit }));
        dispatch(
          handlePermissions({
            action: '10',
            status: editAccessGroup.AccessGroupAllAndNullDto.IsNullprojectPortfolio || !currentEdit,
          }),
        );
        break;
      }
      case 'view':
        dispatch(
          handlePermissions({
            action: '10',
            status: !editAccessGroup.AccessGroupPropertiesDto.projectPortfolioView,
          }),
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className='flex flex-row gap-10 p-4 bg-gray-50 rounded-xl shadow-sm'>
      {/* انتخاب سبد طراحی */}
      <div className='flex flex-col w-1/2 bg-white p-4 rounded-lg shadow-sm'>
        {/* <div className="flex items-center mb-4">
          <Checkbox
            checked={
              editAccessGroup?.AllAccessGroupAllAndNullDto
                ?.IsNullprojectPortfolio ||
              editAccessGroup?.AccessGroupAllAndNullDto
                ?.IsNullprojectPortfolio
            }
            onChange={handleIncludes}
            className="me-2"
          />
          <span className="text-sm text-gray-700">
            شامل دیتاهای بدون عنوان سبد طراحی می‌باشد.
          </span>
        </div> */}

        <label className='text-sm text-gray-700 mb-2 mr-1'>انتخاب سبد طراحی:</label>
        <TreeSelect
          showSearch
          allowClear
          direction='rtl'
          {...tProps}
          className='w-full'
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
            action: '9',
            checked: editAccessGroup.AccessGroupPropertiesDto.projectPortfolioSubmit,
            disabled: false,
            onClick: () =>
              dispatch(
                handlePermissions({
                  action: '9',
                  status: !editAccessGroup.AccessGroupPropertiesDto.projectPortfolioSubmit,
                }),
              ),
          },
          {
            label: 'مشاهده',
            action: '10',
            checked: editAccessGroup.AccessGroupPropertiesDto.projectPortfolioView,
            disabled:
              editAccessGroup.AccessGroupPropertiesDto.projectPortfolioEdit ||
              editAccessGroup.AccessGroupPropertiesDto.projectPortfolioDelete ||
              editAccessGroup.AccessGroupAllAndNullDto.IsNullprojectPortfolio,
            onClick: () => handleCheckbox('view'),
          },
          {
            label: 'ویرایش',
            action: '11',
            checked: editAccessGroup.AccessGroupPropertiesDto.projectPortfolioEdit,
            disabled: editAccessGroup.AccessGroupPropertiesDto.projectPortfolioDelete,
            onClick: () => handleCheckbox('edit'),
          },
          {
            label: 'حذف',
            action: '12',
            checked: editAccessGroup.AccessGroupPropertiesDto.projectPortfolioDelete,
            disabled: false,
            onClick: () => handleCheckbox('delete'),
          },
        ].map((item, idx) => (
          <div key={idx} className='mb-4'>
            <Checkbox className='text-sm' checked={item.checked} disabled={item.disabled} onClick={item.onClick}>
              {item.label}
            </Checkbox>
            <div className='text-xs text-blue-700 bg-blue-50 px-3 py-2 mt-1 rounded'>دسترسی به {item.label} منشور پروژه مربوط به سبد طراحی/پروژه انتخاب شده</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPortfolioAccessGroup;
