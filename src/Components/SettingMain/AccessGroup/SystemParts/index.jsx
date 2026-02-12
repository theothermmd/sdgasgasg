import React, { useState } from 'react';
import { Checkbox, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { handleAccessGroupOthers } from '../../../../features/AccessGroup';
const SystemParts = () => {
  // const [accessGroup, setAccessGroup] = useState({
  //   Reports: false,
  //   Approved: false,
  //   Settings: false,
  // });
  const dispatch = useDispatch();
  const GlobalTitle = useSelector((state) => state.GlobalSetting.GlobalTitle);
  // const handleCheckboxChange = (key) => {
  //   setAccessGroup((prev) => ({
  //     ...prev,
  //     [key]: !prev[key],
  //   }));
  // };
  const editAccessGroup = useSelector((state) => state.AccessGroup.AccessGroupOtherDto);
  return (
    <Space direction='horizontal'>
      <Checkbox
        checked={editAccessGroup.charterChanges}
        onClick={() => {
          dispatch(
            handleAccessGroupOthers({
              action: '1',
              status: !editAccessGroup.charterChanges,
            }),
          );
        }}
      >
        تغییرات {GlobalTitle}
      </Checkbox>
      <Checkbox
        checked={editAccessGroup.Approved}
        onClick={() => {
          dispatch(
            handleAccessGroupOthers({
              action: '2',
              status: !editAccessGroup.Approved,
            }),
          );
        }}
      >
        تاییدکنندگان
      </Checkbox>
      <Checkbox
        checked={editAccessGroup.Settings}
        onClick={() => {
          dispatch(
            handleAccessGroupOthers({
              action: '3',
              status: !editAccessGroup.Settings,
            }),
          );
        }}
      >
        تنظیمات
      </Checkbox>
    </Space>
  );
};

export default SystemParts;
