import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Input, Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { FixedSizeList as List } from 'react-window';
import { RiArrowRightSLine, RiArrowRightDoubleLine } from 'react-icons/ri';
import classNames from 'classnames';
import { handleAddGroups, handleAddMembers } from '../../../../features/AccessGroup';
import { useGetUsers } from '../../../../ApiHooks/CommonHooks/Users';
import { useGetAllAccessGroup, useGetAccessGroupById } from '../../../../ApiHooks/AccessGroup';
import { handleTitleAccessGroup, handleDescriptionAccessGroup, handleEditModel } from '../../../../features/AccessGroup';
const { TextArea } = Input;

const CreateAccessGroup = () => {
  const [rightList, setRightList] = useState([]); // آیتم‌های در دسترس
  const [leftList, setLeftList] = useState([]); // آیتم‌های انتخاب‌شده
  const [searchTermLeft, setSearchTermLeft] = useState('');
  const [searchTermRight, setSearchTermRight] = useState('');
  const [filteredLeftList, setFilteredLeftList] = useState([]);
  const [filteredRightList, setFilteredRightList] = useState([]);
  const [users, setusers] = useState([]);

  const [checkItem, setCheckItem] = useState([]);
  const editData = useSelector((state) => state.AccessGroup);

  const { control, setValue } = useForm();
  const dispatch = useDispatch();
  const { data: UsersList } = useGetUsers();
  const { data: AccessGroupList } = useGetAllAccessGroup();
  const { mutate: postAccessGroupById } = useGetAccessGroupById();
  useEffect(() => {
    setValue('Title', editData.Title);
    setValue('description', editData.Description);
  }, [editData, setValue]);
  // useEffect(() => {
  //   const mockUsersAndGroups = [
  //     { title: "کاربر ۱", id: 1, key: 1, isGroup: false },
  //     { title: "کاربر ۲", id: 2, key: 2, isGroup: false },
  //     { title: "گروه A", id: 101, key: 101, isGroup: true },
  //     { title: "گروه B", id: 102, key: 102, isGroup: true },
  //   ];
  //   setRightList(mockUsersAndGroups);
  //   setFilteredRightList(mockUsersAndGroups);
  //   setLeftList([]);
  //   setFilteredLeftList([]);
  // }, []);
  useEffect(() => {
    if (editData?.Id) {
      postAccessGroupById(editData.Id, {
        onSuccess: (data) => {
          const max = UsersList.data.filter((user) => data.data.AccessGroupUsers.includes(user.Id));
          console.log(data?.data?.AccessGroupUsers);
          console.log(UsersList.data);
          console.log('kkkkkkkkk : ', max);
          const transformedList = max.map((item) => ({
            title: item.UserName,
            id: item.Id,
            key: item.Id,
            isGroup: false,
          }));

          setFilteredLeftList(transformedList);

          // اینجا می‌تونید دیتای دریافتی رو پردازش کنید
        },
      });
    }
  }, [editData?.Id, postAccessGroupById, UsersList]);

  useMemo(() => {
    if (UsersList && AccessGroupList) {
      const idsAccessUser = editData.AccessGroupUsersDto?.map((item) => item);
      //const idsaccessGroup = ListAccessGroup?.data.map((item) => item.id);
      const idsaccessGroup = editData?.AddAccessGroupGroupsDto?.map((item) => item);

      const isInArrayUser = (id) => idsAccessUser.includes(id);
      // const isInArrayGroup = (id) => idsaccessGroup.includes(id);
      // const isInArrayUser = (id) => idsAccessUser.includes([]);
      const isInArrayGroup = (id) => idsaccessGroup.includes(id);

      const matchedState = [];
      const unmatchedState = [];

      AccessGroupList?.data?.forEach((item) => {
        if (isInArrayGroup(item.Id)) {
          matchedState.push({
            title: item.Title,
            id: item.Id,
            key: item.Id,
            isGroup: true,
          });
        } else {
          unmatchedState.push({
            title: item.Title,
            id: item.Id,
            key: item.Id,
            isGroup: true,
          });
        }
      });

      UsersList.data?.forEach((item) => {
        if (isInArrayUser(item.Id)) {
          matchedState.push({
            title: item.UserName,
            id: item.Id,
            key: item.Id,
            isGroup: false,
          });
        } else {
          unmatchedState.push({
            title: item.UserName,
            id: item.Id,
            key: item.Id,
            isGroup: false,
          });
        }
      });

      const sortedUnmatchedState = unmatchedState.sort((a, b) => a?.title?.localeCompare(b?.title));
      const sortedMatchedState = matchedState.sort((a, b) => a?.title?.localeCompare(b?.title));
      console.log('matchedState : ', matchedState);

      setRightList(sortedUnmatchedState);
      setFilteredRightList(sortedUnmatchedState);
      setFilteredLeftList(sortedMatchedState);
      setLeftList(sortedMatchedState);
      setSearchTermRight('');
      setSearchTermLeft('');
      if (editData?.inEditMode) {
        dispatch(handleEditModel(false));
      }
      // setEditStatus(false);
    }
  }, [UsersList, AccessGroupList]);
  const sortList = (list) => [...list].sort((a, b) => a.title.localeCompare(b.title));

  const moveItem = useCallback((item, fromRightToLeft) => {
    if (fromRightToLeft) {
      setRightList((prev) => {
        const updated = prev.filter((i) => i !== item);

        setFilteredRightList(updated);
        return updated;
      });
      setLeftList((prev) => {
        const updated = sortList([...prev, item]);
        setFilteredLeftList(updated);
        return updated;
      });
    } else {
      setLeftList((prev) => {
        const updated = prev.filter((i) => i !== item);
        setFilteredLeftList(updated);
        return updated;
      });
      setRightList((prev) => {
        const updated = sortList([...prev, item]);
        setFilteredRightList(updated);
        return updated;
      });
    }
    setCheckItem([]);
    setSearchTermLeft('');
    setSearchTermRight('');
  }, []);

  const Row = ({ data, index, style }) => (
    <div
      style={style}
      className={classNames('row-item px-2 gap-2 py-[6px] hover:cursor-pointer flex', {
        'bg-slate-100': index % 2 === 0,
        'bg-white': index % 2 !== 0,
      })}
      onDoubleClick={() => moveItem(data[index], data === filteredRightList)}
    >
      <Checkbox onChange={(e) => handleCheckboxChange(e, data[index])} checked={checkItem.includes(data[index].id)} />
      <div className='text-xs font-medium content-center'>{data[index].title}</div>
    </div>
  );

  const handleCheckboxChange = (e, item) => {
    if (e.target.checked) {
      setCheckItem((prev) => [...prev, item.id]);
    } else {
      setCheckItem((prev) => prev.filter((i) => i !== item.id));
    }
  };

  const handleSearchLeft = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTermLeft(value);
    setFilteredLeftList(value ? leftList.filter((item) => item.title.toLowerCase().includes(value)) : leftList);
  };

  const handleSearchRight = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTermRight(value);
    setFilteredRightList(value ? rightList.filter((item) => item.title.toLowerCase().includes(value)) : rightList);
  };

  const moveItemsRightToLeft = () => {
    const selected = rightList.filter((item) => checkItem.includes(item.id));
    setRightList((prev) => {
      const updated = prev.filter((i) => !checkItem.includes(i.id));
      console.log('1 update', updated);

      setFilteredRightList(updated);
      return updated;
    });
    setLeftList((prev) => {
      const updated = sortList([...prev, ...selected]);
      console.log('2 update', updated);
      setFilteredLeftList(updated);
      return updated;
    });
    setCheckItem([]);
    setSearchTermLeft('');
    setSearchTermRight('');
  };

  const moveItemsLeftToRight = () => {
    const selected = leftList.filter((item) => checkItem.includes(item.id));
    setLeftList((prev) => {
      const updated = prev.filter((i) => !checkItem.includes(i.id));
      console.log('update', updated);

      setFilteredLeftList(updated);
      return updated;
    });
    setRightList((prev) => {
      const updated = sortList([...prev, ...selected]);
      setFilteredRightList(updated);
      return updated;
    });
    setCheckItem([]);
    setSearchTermLeft('');
    setSearchTermRight('');
  };

  const moveAllRightToLeft = () => {
    const moved = [...filteredRightList];
    const newLeft = sortList([...leftList, ...moved]);
    const newRight = rightList.filter((i) => !moved.includes(i));
    setLeftList(newLeft);
    setRightList(newRight);
    setFilteredLeftList(newLeft);
    setFilteredRightList(newRight);
    setCheckItem([]);
  };

  const moveAllLeftToRight = () => {
    const moved = [...filteredLeftList];
    const newRight = sortList([...rightList, ...moved]);
    const newLeft = leftList.filter((i) => !moved.includes(i));
    setRightList(newRight);
    setLeftList(newLeft);
    setFilteredRightList(newRight);
    setFilteredLeftList(newLeft);
    setCheckItem([]);
  };

  const groupSelected = useMemo(() => leftList.filter((i) => i.isGroup).map((i) => i.id), [leftList]);
  const userSelected = useMemo(() => leftList.filter((i) => !i.isGroup).map((i) => i.id), [leftList]);

  useEffect(() => {
    console.log(
      filteredLeftList.map((value) => {
        return value.id;
      }),
    );

    dispatch(handleAddGroups(groupSelected));
    dispatch(
      handleAddMembers(
        filteredLeftList.map((value) => {
          return value.id;
        }),
      ),
    );
  }, [groupSelected, userSelected, filteredLeftList]);

  return (
    <div className='flex bg-white rounded-xl shadow-md p-6 gap-6'>
      {/* فرم عنوان و توضیحات */}
      <div className='flex flex-col w-1/2 gap-4'>
        <div className='flex items-start gap-2'>
          <label className='w-24 text-sm font-semibold mt-2'>عنوان گروه:</label>
          <Controller
            name='Title'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className='w-full border rounded-md px-2 py-1'
                onChange={(e) => {
                  field.onChange(e);
                  dispatch(handleTitleAccessGroup(e.target.value));
                }}
              />
            )}
          />
        </div>

        <div className='flex items-start gap-2'>
          <label className='w-24 text-sm font-semibold mt-2'>توضیحات:</label>
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  dispatch(handleDescriptionAccessGroup(e.target.value));
                }}
                className='w-full border rounded-md px-2 py-1'
                placeholder='توضیحات'
                autoSize={{ minRows: 9, maxRows: 9 }}
              />
            )}
          />
        </div>
      </div>

      <div className='border-r-1 mx-2 h-auto border-gray-400' />

      {/* لیست کاربران و گروه‌ها */}
      <div className='flex flex-col'>
        <div className='flex gap-6 justify-between'>
          {/* لیست در دسترس */}
          <div className='flex flex-col items-center gap-2'>
            <span className='text-xs font-medium'>کاربران و گروه‌های در دسترس</span>
            <input value={searchTermRight} onChange={handleSearchRight} className='border rounded-md w-[200px] h-8 px-2 text-sm' placeholder='جستجو کنید' />
            <List className='border rounded-md' height={200} width={200} itemCount={filteredRightList.length} itemSize={35} itemData={filteredRightList}>
              {Row}
            </List>
          </div>

          <div className='flex flex-col items-center justify-center gap-2 mt-7'>
            <RiArrowRightDoubleLine onClick={moveAllRightToLeft} size={28} className='p-1 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer rotate-180' />
            <RiArrowRightSLine onClick={moveItemsRightToLeft} size={28} className='p-1 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer rotate-180' />
            <RiArrowRightDoubleLine onClick={moveAllLeftToRight} size={28} className='p-1 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer' />
            <RiArrowRightSLine onClick={moveItemsLeftToRight} size={28} className='p-1 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer' />
          </div>

          {/* لیست انتخاب شده */}
          <div className='flex flex-col items-center gap-2'>
            <span className='text-xs font-medium'>کاربران و گروه‌های انتخاب‌شده</span>
            <input value={searchTermLeft} onChange={handleSearchLeft} className='border rounded-md w-[200px] h-8 px-2 text-sm' placeholder='جستجو کنید' />
            <List className='border rounded-md' height={200} width={200} itemCount={filteredLeftList.length} itemSize={35} itemData={filteredLeftList}>
              {Row}
            </List>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccessGroup;
