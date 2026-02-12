import React, { useState, useEffect } from 'react';
import { Table, Select, InputNumber, Space } from 'antd';
import { useGetProjectCostDistribution, useEditProjectCostDistribution } from '../../../ApiHooks/ProjectCostDistribution';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
const { Option } = Select;

const Costs = () => {
  const [selectedView, setSelectedView] = useState('Annual');
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const ProjectCharterId = useSelector((state) => state.Form?.ProjectCharterId);
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const IsEdit = workflowActionAccess.filter((value) => value.Id == ProjectCharterId)?.at(0)?.IsEdit;
  const { data: ProjectCostDistribution, refetch: refetchProjectCostDistribution } = useGetProjectCostDistribution(ProjectCharterId);
  const { mutate: EditProjectCostDistribution } = useEditProjectCostDistribution();

  useEffect(() => {
    if (ProjectCostDistribution?.data) {
      setOriginalData(ProjectCostDistribution.data);
      processTableData(ProjectCostDistribution.data, selectedView);
    }
  }, [ProjectCostDistribution]);

  // Function to convert quarter to season name
  const convertQuarterToSeason = (quarter) => {
    const seasonMap = {
      Q1: 'بهار',
      Q2: 'تابستان',
      Q3: 'پاییز',
      Q4: 'زمستان',
    };
    return seasonMap[quarter] || quarter;
  };

  // Function to convert month number to Persian month name
  const convertToPersianMonth = (monthNumber) => {
    const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const monthIndex = parseInt(monthNumber) - 1;
    return persianMonths[monthIndex] || monthNumber;
  };

  // Function to format the solar date for display
  const formatSolarDateForDisplay = (periodLabel) => {
    if (periodLabel.includes('-Q')) {
      // Quarterly format: 1404-Q3
      const [year, quarter] = periodLabel.split('-');
      const seasonName = convertQuarterToSeason(quarter);
      return `${year} - ${seasonName}`;
    } else if (periodLabel.includes('-')) {
      // Monthly format: 1404-07
      const [year, month] = periodLabel.split('-');
      const persianMonth = convertToPersianMonth(month);
      return `${year} - ${persianMonth}`;
    } else {
      // Annual format: 1404
      return periodLabel;
    }
  };

  const filterDataByView = (data, view) => {
    switch (view) {
      case 'Annual':
        return data.filter((item) => item.PeriodLabel.length === 4 && !isNaN(item.PeriodLabel));
      case 'Monthly':
        return data.filter((item) => item.PeriodLabel.includes('-') && !item.PeriodLabel.includes('Q'));
      case 'Quarterly':
        return data.filter((item) => item.PeriodLabel.includes('-Q'));
      default:
        return data;
    }
  };

  const processTableData = (data, view) => {
    const filteredData = filterDataByView(data, view);

    // Group by PeriodLabel
    const groupedData = {};
    filteredData.forEach((item) => {
      if (!groupedData[item.PeriodLabel]) {
        groupedData[item.PeriodLabel] = [];
      }
      groupedData[item.PeriodLabel].push(item);
    });

    const processedData = Object.keys(groupedData).map((periodLabel) => {
      const periodData = groupedData[periodLabel];
      const currencies = {};

      periodData.forEach((item) => {
        currencies[item.CurrencyName] = {
          id: item.Id,
          cost: item.Cost,
          currencyName: item.CurrencyName,
          projectCharterId: item.ProjectCharterId,
          periodLabel: item.PeriodLabel,
          costDistributionPattern: item.CostDistributionPattern,
          CurrencyId: item.CurrencyId,
        };
      });

      return {
        key: periodLabel,
        periodLabel,
        displayLabel: formatSolarDateForDisplay(periodLabel),
        currencies,
      };
    });

    setTableData(processedData);
  };

  const handleSelectChange = (value) => {
    setSelectedView(value);
    processTableData(originalData, value);
  };

  const handleCostChange = (currencyData, newValue) => {
    // Update the local state when the value changes
    setOriginalData((prevData) => prevData.map((item) => (item.Id === currencyData.id ? { ...item, Cost: newValue } : item)));

    // Re-process table data to reflect changes
    processTableData(
      originalData.map((item) => (item.Id === currencyData.id ? { ...item, Cost: newValue } : item)),
      selectedView,
    );
  };

  const handleCostBlur = async (currencyData, currentValue) => {
    // Make API call when focus is lost
    const updateData = {
      Id: currencyData.id,
      ProjectCharterId: currencyData.projectCharterId,
      PeriodLabel: currencyData.periodLabel,
      Cost: currentValue,
      CurrencyName: currencyData.currencyName,
      CostDistributionPattern: currencyData.costDistributionPattern,
      CurrencyId: currencyData.CurrencyId,
    };

    if (!IsEdit && IsEdit !== undefined) {
      toast.error('شما دسترسی ویرایش ندارید.');
      return;
    }

    EditProjectCostDistribution(updateData, {
      onSuccess: (data) => {
        console.log('msg : /', data);

        if (data.data?.isSuccess === false) {
          toast.error('مبلغ وارده بیشتر از مبلغ تعیین شده است.');
          refetchProjectCostDistribution();
          return;
        }
        toast.success('با موفقیت ثبت شد.');
        refetchProjectCostDistribution();
      },
    });
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const unformatNumber = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/,/g, ''));
  };

  const getColumns = () => {
    const currencyNames = [...new Set(originalData.map((item) => item.CurrencyName))];

    const columns = [
      {
        title: 'ردیف',
        dataIndex: 'key',
        key: 'row',
        render: (text, record, index) => index + 1,
      },
      {
        title: 'بازه',
        dataIndex: 'displayLabel',
        key: 'period',
        render: (text) => <span>{text}</span>,
      },
      {
        title: 'هزینه اجرای پروژه',
        key: 'project_cost',
        children: currencyNames.map((currencyName) => ({
          title: currencyName,
          key: `cost_${currencyName}`,
          render: (text, record) => {
            const currencyData = record.currencies[currencyName];
            if (!currencyData) return 'N/A';

            return (
              <InputNumber
                value={currencyData.cost}
                onChange={(value) => {
                  handleCostChange(currencyData, value);
                }}
                formatter={(value) => formatNumber(value)}
                parser={(value) => unformatNumber(value)}
                style={{ width: '100%' }}
                onBlur={() => {
                  handleCostBlur(currencyData, currencyData.cost);
                }}
              />
            );
          },
        })),
      },
    ];

    return columns;
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select defaultValue='Annual' style={{ width: 120 }} onChange={handleSelectChange}>
          <Option value='Annual'>سالانه</Option>
          <Option value='Monthly'>ماهانه</Option>
          <Option value='Quarterly'>فصلی</Option>
        </Select>
      </Space>

      <Table columns={getColumns()} dataSource={tableData} pagination={false} bordered size='middle' />
    </div>
  );
};

export default Costs;
