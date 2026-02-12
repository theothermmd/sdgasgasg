import React, { useState, useEffect } from 'react';
import { Table, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { IoMdAddCircle } from 'react-icons/io';
import { useMemo } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdOutlineEdit } from 'react-icons/md';
import { handleSwitchAccessGroup, handleEditAccessGroup } from '../../../../features/AccessGroup';
import { useGetAllAccessGroup, useGetAccessGroupById, useDeleteAccessGroupById } from '../../../../ApiHooks/AccessGroup';
const TableAccessGroup = () => {
  //#region state
  const [editId, setEditId] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [accessGroupListById, setAccessGroupListById] = useState(null);
  //#endregion

  //#region redux
  const dispatch = useDispatch();
  //#endregion

  //#region hooks
  const { data: ListAccessGroup, refetch: refetchAccessGroup } = useGetAllAccessGroup();
  const { mutateAsync: getAccesGroup } = useGetAccessGroupById();
  const { mutateAsync: DeleteRowAccessGroup } = useDeleteAccessGroupById();
  //#endregion

  //#region functions
  const handleEdit = (id) => {
    setEditId(id);
  };
  const handleDeleteAccessGroup = async (id) => {
    try {
      const { data } = await DeleteRowAccessGroup(id);
      if (data.isSuccess) {
        toast.success(data.message);
        refetchAccessGroup();
        return;
      }
      toast.error(data.message);
    } catch (error) {
      toast.error('خطا در حذف گروه دسترسی');
    }
  };
  const AddRowAccessGroup = () => {
    dispatch(handleSwitchAccessGroup(true));
  };
  const ConvertData = (data) => {
    return {
      Id: data?.AccessGroup.Id,
      Title: data?.AccessGroup.Title,
      Description: data?.AccessGroup?.Description,
      open: true,
      AccessGroupOtherDto: {
        Id: data?.AccessGroupPermissions?.Id,
        charterChanges: data?.AccessGroupPermissions?.ProjectCharter,
        Settings: data?.AccessGroupPermissions?.BaseSettings,
        Approved: data?.AccessGroupPermissions?.WorkFlow,
      },
      AccessGroupPropertiesDto: {
        Id: data?.AccessGroupProperties?.Id,
        TypeProjectSubmit: data?.AccessGroupProperties?.ProjectTypeSave,
        TypeProjectEdit: data?.AccessGroupProperties?.ProjectTypeEdit,
        TypeProjectView: data?.AccessGroupProperties?.ProjectTypeView,
        TypeProjectDelete: data?.AccessGroupProperties?.ProjectTypeDelete,

        UnitSubmit: data?.AccessGroupProperties?.TrusteeUnitSave,
        UnitView: data?.AccessGroupProperties?.TrusteeUnitView,
        UnitEdit: data?.AccessGroupProperties?.TrusteeUnitEdit,
        UnitDelete: data?.AccessGroupProperties?.TrusteeUnitDelete,

        projectPortfolioSubmit: data?.AccessGroupProperties?.ProjectPortfolioSave,
        projectPortfolioView: data?.AccessGroupProperties?.ProjectPortfolioView,
        projectPortfolioEdit: data?.AccessGroupProperties?.ProjectPortfolioEdit,
        projectPortfolioDelete: data?.AccessGroupProperties?.ProjectPortfolioDelete,
      },
      AccessGroupUsersDto: data?.AccessGroupUsers,
      AddAccessGroupGroupsDto: data?.AccessGroupGroups,
      AccessGroupTypeProjectDto: data?.AccessGroupProjectType,
      AccessGroupProjectPortfolioDto: data?.AccessGroupProjectPortfolio,
      AccessGroupUnitDto: data?.AccessGroupTrusteeUnit,
      AccessGroupAllAndNullDto: {
        IsAllprojectPortfolio: false,
        IsAllUnit: false,
        IsAllTypeProject: false,
        IsNullprojectPortfolio: false,
        IsNullUnit: false,
        IsNullTypeProject: false,
      },
      inEditMode: true,
    };
  };
  //#endregion

  //#region useEffect
  useEffect(() => {
    setDataSource(
      ListAccessGroup?.data.map((item, index) => ({
        key: item.id,
        row: index + 1,
        Id: item.Id,
        Title: item.Title,
        Description: item.Description,
      })),
    );
  }, [ListAccessGroup]);
  useEffect(() => {
    if (editId) {
      const getData = async () => {
        setAccessGroupListById(await getAccesGroup(editId));
      };
      getData();
    }
  }, [editId]);
  useEffect(() => {
    if (editId && accessGroupListById) {
      dispatch(handleEditAccessGroup(ConvertData(accessGroupListById?.data)));
      setEditId(false);
    }
  }, [editId, accessGroupListById]);

  //#endregion

  //#region table
  const column = [
    {
      title: 'ردیف',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'عنوان گروه',
      dataIndex: 'Title',
      key: 'Title',
      width: '100px',
      render: (text, record) => record.Title,
    },
    {
      title: 'توضیحات',
      dataIndex: 'Description',
      key: 'Description',
      width: '100px',
      align: 'right',
      render: (text, record) => record.Description,
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (text, record) => (
        <div className='gap-3 flex justify-center content-center'>
          <div>
            <MdOutlineEdit className='size-5' onClick={() => handleEdit(record.Id)} />
          </div>
          <div>
            <Popconfirm title='آیا از حذف این گروه دسترسی مطمئن هستید؟' onConfirm={() => handleDeleteAccessGroup(record.Id)}>
              <FaRegTrashCan className='size-[18px]' />
            </Popconfirm>
          </div>
        </div>
      ),
    },
  ];
  //#endregion

  return (
    <>
      <div className='flex items-center justify-between border-b border-gray-300 mt-6 pb-4'>
        <button onClick={AddRowAccessGroup} className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200'>
          <IoMdAddCircle className='text-xl' />
          <span className='text-base font-semibold'>افزودن گروه دسترسی جدید</span>
        </button>
      </div>

      <Table
        dataSource={dataSource}
        columns={column}
        size='small'
        id='AccessGroupTable'
        pagination={false}
        scroll={{ y: 250 }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        className='mt-4'
      />
    </>
  );
};

export default TableAccessGroup;
