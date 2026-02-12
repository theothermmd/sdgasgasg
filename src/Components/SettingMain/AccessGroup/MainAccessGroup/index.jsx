import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Collapse } from 'antd';
import AccessGroupItems from '../CollapseItemsAccessGroup';
import { toast } from 'react-toastify';
import { handleSwitchAccessGroup } from '../../../../features/AccessGroup';
import TableAccessGroup from '../TableAccessGroup';
import { useCreateAccessGroup, useEditAccessGroup } from '../../../../ApiHooks/AccessGroup';
import { useQueryClient } from '@tanstack/react-query';
//صفحه اصلی ثبت گروه دسترسی
const MainAccessGroup = () => {
  const dispatch = useDispatch();
  const queryclient = useQueryClient();
  const AccessGroup = useSelector((state) => state.AccessGroup);

  const handleCancelAccessGroup = () => {
    dispatch(handleSwitchAccessGroup(false));
  };
  const emptyGuid = '00000000-0000-0000-0000-000000000000';
  const { mutateAsync: CreateAccessGroup } = useCreateAccessGroup();
  const { mutateAsync: EditAccessGroup } = useEditAccessGroup();
  const handleSaveAccessGroup = async () => {
    const { open, ...AccessGroupFormat } = AccessGroup;
    const { open: openValue, Id, ...AccessGroupFormatEdit } = AccessGroup;
    if (AccessGroup.Id) {
      try {
        let Data = ConvertData(AccessGroupFormat, AccessGroupFormat.Id, AccessGroupFormat.AccessGroupOtherDto.Id, AccessGroupFormat.AccessGroupPropertiesDto.Id);
        await EditAccessGroup(Data);
        dispatch(handleSwitchAccessGroup(false));
        queryclient.invalidateQueries({ queryKey: ['userAccess-list'] });
        toast.success(' گروه دسترسی موفقیت ویرایش شد');
      } catch (error) {
        toast.error(' گروه دسترسی خطا در ویرایش ');
      }
    } else {
      try {
        let Data = ConvertData(AccessGroupFormat, emptyGuid, emptyGuid, emptyGuid);
        await CreateAccessGroup(Data);
        dispatch(handleSwitchAccessGroup(false));
        toast.success(' گروه دسترسی موفقیت ثبت شد');
      } catch (error) {
        toast.error(' گروه دسترسی خطا در ثبت  ');
      }
    }
    dispatch(handleSwitchAccessGroup(false));
  };
  const ConvertData = (data, accessGroupId, accessGroupPermissionId, accessGroupPropertiesId) => {
    let convertedData = {};
    convertedData.AccessGroup = {
      Id: accessGroupId,
      Title: data.Title,
      Description: data.Description,
    };
    convertedData.AccessGroupPermissions = {
      Id: accessGroupPermissionId,
      ProjectCharter: data.AccessGroupOtherDto.charterChanges,
      BaseSettings: data.AccessGroupOtherDto.Settings,
      WorkFlow: data.AccessGroupOtherDto.Approved,
    };
    convertedData.AccessGroupGroups = data.AddAccessGroupGroupsDto;
    convertedData.AccessGroupUsers = data.AccessGroupUsersDto;
    convertedData.AccessGroupProjectType = data.AccessGroupTypeProjectDto;
    convertedData.AccessGroupProjectPortfolio = data.AccessGroupProjectPortfolioDto;
    convertedData.AccessGroupTrusteeUnit = data.AccessGroupUnitDto;
    convertedData.AccessGroupProperties = {
      Id: accessGroupPropertiesId,
      ProjectTypeSave: data.AccessGroupPropertiesDto.TypeProjectSubmit,
      ProjectTypeView: data.AccessGroupPropertiesDto.TypeProjectView,
      ProjectTypeEdit: data.AccessGroupPropertiesDto.TypeProjectEdit,
      ProjectTypeDelete: data.AccessGroupPropertiesDto.TypeProjectDelete,

      ProjectPortfolioSave: data.AccessGroupPropertiesDto.projectPortfolioSubmit,
      ProjectPortfolioView: data.AccessGroupPropertiesDto.projectPortfolioView,
      ProjectPortfolioEdit: data.AccessGroupPropertiesDto.projectPortfolioEdit,
      ProjectPortfolioDelete: data.AccessGroupPropertiesDto.projectPortfolioDelete,

      TrusteeUnitSave: data.AccessGroupPropertiesDto.UnitSubmit,
      TrusteeUnitView: data.AccessGroupPropertiesDto.UnitView,
      TrusteeUnitEdit: data.AccessGroupPropertiesDto.UnitEdit,
      TrusteeUnitDelete: data.AccessGroupPropertiesDto.UnitDelete,
    };
    return convertedData;
  };
  const accessGroupItems = AccessGroupItems();
  return (
    <div className='bg-white h-[92vh] overflow-y-auto'>
      <div className='px-3 flex-col justify-between mt-4'>
        {AccessGroup.open ? (
          <div>
            <Collapse items={accessGroupItems} className='mt-4' />
            <div className='flex justify-center mt-4 content-end  py-4 gap-4 bottom-0'>
              <button
                onClick={handleSaveAccessGroup}
                type='button'
                className='mb-4  text-xs w-[6rem] h-[30px]  text-black bg-transparent hover:bg-blue-500  font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
              >
                ذخیره
              </button>
              <button
                onClick={handleCancelAccessGroup}
                type='button'
                className='mb-4  text-xs w-[6rem] h-[30px]  text-black bg-transparent hover:bg-blue-500  font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
              >
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <div>
            <TableAccessGroup />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainAccessGroup;
