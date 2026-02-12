import { useEffect, useState } from 'react';
import { useGetUsers } from '../../../ApiHooks/CommonHooks/Users';
import { Button, Dropdown, Select, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
const AssignButton = ({ send }) => {
  const userInformation = useSelector((state) => state.Auth.userInformation);
  const { data: UsersData } = useGetUsers();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [UsersDatas, setUsersData] = useState([]);
  const [open, setOpen] = useState(false);
  const TransForToSelectData = (array, name, idName) => {
    const newArray = array?.map((item) => ({
      label: item[name],
      value: item[idName],
    }));
    return newArray;
  };
  useEffect(() => {
    if (UsersData?.data) {
      const UsersDatafiltered = UsersData?.data.filter((value) => value.Id !== userInformation.Id);

      setUsersData(TransForToSelectData(UsersDatafiltered, 'UserName', 'Id'));
    }
  }, [UsersData?.data]);
  const dropdownContent = (
    <Select
      mode='multiple'
      value={selectedUsers}
      onChange={setSelectedUsers}
      style={{ width: '250px' }}
      dropdownStyle={{ padding: '8px' }}
      allowClear
      showSearch
      optionFilterProp='label'
      options={UsersDatas}
    />
  );
  return (
    <>
      <div>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Space.Compact block>
            <Button
              type='primary'
              onClick={() => send(selectedUsers)}
              disabled={selectedUsers?.length === 0}
              style={{ width: '70%', borderColor: '#0d6efd', borderLeft: '0', maxHeight: '29px' }}
            >
              ارجاع {selectedUsers?.length > 0 && `(${selectedUsers?.length})`}
            </Button>
            <Dropdown overlay={dropdownContent} trigger={['click']} open={open} onOpenChange={setOpen}>
              <Button icon={<DownOutlined />} style={{ borderColor: '#0d6efd', maxHeight: '29px', width: '30%' }} />
            </Dropdown>
          </Space.Compact>
        </Space>
      </div>
    </>
  );
};
export default AssignButton;
