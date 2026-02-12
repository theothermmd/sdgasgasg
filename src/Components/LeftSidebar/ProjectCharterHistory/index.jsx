import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import moment from 'moment'; // Make sure moment is installed

import { useGetProjectCharterHistory } from '../../../ApiHooks/ProjectCharterHistory';

// If you need Persian date formatting, consider using moment-jalaali or similar
// import moment from 'moment-jalaali'; // Example for Jalali calendar

const ProjectCharterHistory = ({ ProjectCharterId }) => {
  // Define the columns for the Ant Design Table

  const [data, setdata] = useState([]);
  const { data: ProjectCharterHistory } = useGetProjectCharterHistory(ProjectCharterId);
  useEffect(() => {
    if (ProjectCharterHistory) {
      setdata(ProjectCharterHistory.data);
    }
  }, [ProjectCharterHistory]);

  const columns = [
    {
      title: 'ردیف', // Row Number
      dataIndex: 'index', // This dataIndex is used for rendering below
      key: 'index', // Unique key for this column
      width: 60, // Optional: Set a fixed width
      align: 'center',
      render: (text, record, index) => index + 1, // Render the row number (1-based index)
    },
    {
      title: 'نام کاربر', // User Name
      dataIndex: 'UserName', // Maps to the 'UserName' property in your data objects
      key: 'UserName', // Unique key for this column
      align: 'center',
      // sorter: (a, b) => a.UserName.localeCompare(b.UserName), // Optional: Enable sorting
    },
    {
      title: 'نوع عملیات کاربر', // User Operation Type
      dataIndex: 'ActionType',
      key: 'ActionType',
      align: 'center',
      // sorter: (a, b) => a.ActionType.localeCompare(b.ActionType), // Optional: Enable sorting
    },
    {
      title: 'زمان عملیات کاربر', // User Operation Time
      dataIndex: 'OperationDate',
      key: 'OperationDate',
      align: 'center',
      render: (dateString) => {
        // Check if dateString is valid
        if (!dateString || dateString === '0001-01-01T00:00:00') {
          // You might want to display a different message or placeholder
          // if the date is this default/unset value
          return '---';
          // Or return a formatted version of the default date if needed:
          // return moment(dateString).format('YYYY/MM/DD HH:mm');
        }
        // Format the date string using moment
        // Adjust the format string as needed (e.g., 'jYYYY/jMM/jDD HH:mm' for Jalali)
        return moment(dateString).format('HH:mm | YYYY/MM/DD');
        // For Jalali (if using moment-jalaali):
        // return moment(dateString, 'YYYY-MM-DDTHH:mm:ss').format('jYYYY/jMM/jDD HH:mm');
      },
      // sorter: (a, b) => moment(a.OperationDate).valueOf() - moment(b.OperationDate).valueOf(), // Optional: Enable sorting
    },
  ];

  // Map the data to include a unique key for each row
  // Using the array index as the key, assuming data order is stable.
  // If your data has unique IDs, use those instead: key: item.Id
  const dataSource = data.map((item, index) => ({
    ...item,
    key: index, // Use index as key
    // key: item.Id // Use this if Ids were unique
  }));

  return (
    <div className='user-operations-table-container'>
      <Table
        dataSource={dataSource} // Pass the processed data array
        columns={columns} // Pass the columns definition
        pagination={false} // Disable pagination if you want to show all rows
        size='middle' // Adjust table size (default, middle, small)
        // bordered              // Uncomment to add borders to the table
        // scroll={{ y: 400 }}   // Optional: Add vertical scrolling
      />
    </div>
  );
};

export default ProjectCharterHistory;
