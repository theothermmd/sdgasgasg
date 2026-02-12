import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input, InputNumber, Select, Table, Button, Collapse, Row, Col, Typography, Space, Popconfirm, message, TreeSelect, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAddListTableFormInside, useAddListTabFormValue } from '../ApiHooks/OtherSetting/TabCheckList';
import { useGetTabFormValue, useGetTableFormInsideValue, useEditTableFormInsideValue, useEditTabFormValue } from '../ApiHooks/OtherSetting/TabCheckList';
import { useSelector } from 'react-redux';
import useApiClient from '../services/apiClient';
import { CalendarOutlined } from '@ant-design/icons';
import toast, { Toaster } from 'react-hot-toast';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const { TextArea } = Input;
const { Title } = Typography;
const { Panel } = Collapse;
const { TreeNode } = TreeSelect;

const DynamicFormComponent = ({ formStructure, onsubmiting }) => {
  const workflowActionAccess = useSelector((state) => state.WorkFlow.flowAccess);
  const ProjectCharterId = useSelector((state) => state.Form.ProjectCharterId);

  const apiClient = useApiClient();

  const [users, setUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});

  const IsEdit = workflowActionAccess.IsEdit;

  const TabCheckListId = useSelector((state) => state.Form.TabCheckListId);

  const { data: TableFormInsideValue, refetch: refetchGetTableFormInsideValue } = useGetTableFormInsideValue(ProjectCharterId, TabCheckListId);

  const [tableFormValues, setTableFormInsideValues] = useState([]);
  const { mutate: EditTableFormInsideValue } = useEditTableFormInsideValue();
  const { mutate: EditTabFormValue } = useEditTabFormValue();
  const [formData, setFormData] = useState({});

  const [tableData, setTableData] = useState({});
  const [lookupOptions, setLookupOptions] = useState({});
  const [editingRows, setEditingRows] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tableValidationErrors, setTableValidationErrors] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRender = useRef(true);

  const fieldRefs = useRef({});
  const api = useSelector((state) => state.Auth.api);

  const { mutate: AddListTableFormInside } = useAddListTableFormInside();
  const { mutate: AddListTabFormValue } = useAddListTabFormValue();

  const fetchUsers = async (fieldId) => {
    if (users[fieldId]) return;

    setLoadingUsers((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const response = await apiClient(`${api}User/GetAll`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response?.data && Array.isArray(response.data)) {
        const userData = response.data.map((user) => ({
          value: user.Id,
          label: `${user.FirstName} ${user.LastName}`.trim() || user.UserName || user.FullQualifyName,
        }));

        setUsers((prev) => ({ ...prev, [fieldId]: userData }));
      } else {
        setUsers((prev) => ({ ...prev, [fieldId]: [] }));
      }
    } catch (error) {
      setUsers((prev) => ({ ...prev, [fieldId]: [] }));
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  useEffect(() => {
    if (TableFormInsideValue) {
      setTableFormInsideValues(TableFormInsideValue.data);
    }
  }, [TableFormInsideValue, TabCheckListId, ProjectCharterId]);

  useEffect(() => {
    if ((!formStructure || formStructure.length === 0) && onsubmiting === undefined) return;

    // Only initialize table structure ONCE
    if (isFirstRender.current && (tableFormValues.length > 0 || formStructure)) {
      isFirstRender.current = false;

      const initialTableData = {};
      formStructure.forEach((subject) => {
        subject.TabFormDtos.forEach((form) => {
          if (form.Type === 'Table') {
            initialTableData[form.Id] = [];
          }
        });
      });

      const tableDataMap = {};
      tableFormValues.forEach((item) => {
        // ...same as before...
      });

      Object.keys(tableDataMap).forEach((tableId) => {
        initialTableData[tableId] = Object.values(tableDataMap[tableId]);
      });

      setTableData(initialTableData);
      setIsLoading(false);
    } else if (isFirstRender.current) {
      const initialTableData = {};
      formStructure.forEach((subject) => {
        subject.TabFormDtos.forEach((form) => {
          if (form.Type === 'Table') {
            initialTableData[form.Id] = [];
          }
        });
      });
      setTableData(initialTableData);
      setIsLoading(false);
      isFirstRender.current = false;
    }
  }, [formStructure, tableFormValues, TableFormInsideValue]);

  useEffect(() => {
    if ((!formStructure || formStructure.length === 0) && onsubmiting === undefined) return;

    const initialTableData = {};
    formStructure.forEach((subject) => {
      subject.TabFormDtos.forEach((form) => {
        if (form.Type === 'Table') {
          initialTableData[form.Id] = [];
        }
      });
    });

    const tableDataMap = {};
    tableFormValues.forEach((item) => {
      if (!tableDataMap[item.TableFormInsideId]) {
        tableDataMap[item.TableFormInsideId] = {};
      }
      if (!tableDataMap[item.TableFormInsideId][item.Order]) {
        tableDataMap[item.TableFormInsideId][item.Order] = {
          key: `${item.TableFormInsideId}-${item.Order}`,
          id: `${item.TableFormInsideId}-${item.Order}`,
          isNew: false,
          data: [],
        };
      }

      const tableField = formStructure.flatMap((subject) => subject.TabFormDtos).find((field) => field.Id === item.TableFormInsideId);

      if (tableField) {
        const columnIndex = tableField.TableFormInsideDtos.findIndex((col) => col.Id === item.TabFormId);
        if (columnIndex !== -1) {
          tableDataMap[item.TableFormInsideId][item.Order].data[columnIndex] = {
            Id: item.Id,
            Value: item.Value,
            Type: item.Type,
            TabCheckListId: item.TabCheckListId,
            ProjectCharterId: item.ProjectCharterId,
            TableFormInsideId: item.TableFormInsideId,
            Order: item.Order,
            TabFormId: item.TabFormId,
          };
        }
      }
    });

    Object.keys(tableDataMap).forEach((tableId) => {
      initialTableData[tableId] = Object.values(tableDataMap[tableId]);
    });

    setTableData(initialTableData);
    setIsLoading(false);
  }, [formStructure, tableFormValues, TableFormInsideValue]);

  const convertServerLookupValues = async (tableFormValues, formStructure) => {
    const convertedValues = [...tableFormValues];

    for (let item of convertedValues) {
      const tableField = formStructure.flatMap((subject) => subject.TabFormDtos).find((field) => field.Id === item.TableFormInsideId);

      if (tableField && tableField.TableFormInsideDtos) {
        const columnField = tableField.TableFormInsideDtos.find((col) => col.Id === item.TabFormId);

        if (columnField && columnField.Type === 'LookUp' && columnField.LookupTableId) {
          if (!lookupOptions[columnField.LookupTableId]) {
            await fetchLookupOptions(columnField.LookupTableId);
          }

          const options = lookupOptions[columnField.LookupTableId] || [];

          if (columnField.IsChoosen && item.Value && item.Value.includes(',')) {
            const guids = item.Value.split(',').map((g) => g.trim());
            const titles = guids.map((guid) => findLookupTitleByValueRecursive(guid, options)).filter((title) => title);
            item.Value = titles.join('|');
          } else if (columnField.IsChoosen && item.Value && item.Value.includes('|')) {
            const guids = item.Value.split('|').map((g) => g.trim());
            const titles = guids.map((guid) => findLookupTitleByValueRecursive(guid, options)).filter((title) => title);
            item.Value = titles.join('|');
          } else if (item.Value) {
            item.Value = findLookupTitleByValueRecursive(item.Value, options);
          }
        }
      }
    }

    return convertedValues;
  };

  useEffect(() => {
    const processTableData = async () => {
      if (TableFormInsideValue && TableFormInsideValue.data && formStructure) {
        const convertedData = await convertServerLookupValues(TableFormInsideValue.data, formStructure);
        setTableFormInsideValues(convertedData);
      }
    };

    if (TableFormInsideValue && formStructure.length > 0) {
      processTableData();
    }
  }, [TableFormInsideValue, TabCheckListId, ProjectCharterId, formStructure, lookupOptions]);

  const convertServerTabFormValues = async (tabFormValues, formStructure) => {
    const convertedValues = [...tabFormValues];

    for (let item of convertedValues) {
      const field = formStructure.flatMap((subject) => subject.TabFormDtos).find((field) => field.Id === item.TabFormId);

      if (field && field.Type === 'LookUp' && field.LookupTableId) {
        if (!lookupOptions[field.LookupTableId]) {
          await fetchLookupOptions(field.LookupTableId);
        }

        const options = lookupOptions[field.LookupTableId] || [];

        if (field.IsChoosen && item.Value && (item.Value.includes(',') || item.Value.includes('|'))) {
          // برای انتخاب چندگانه
          const separator = item.Value.includes(',') ? ',' : '|';
          const guids = item.Value.split(separator).map((g) => g.trim());
          const titles = guids.map((guid) => findLookupTitleByValueRecursive(guid, options)).filter((title) => title);
          item.Value = titles.join('|');
        } else if (item.Value) {
          item.Value = findLookupTitleByValueRecursive(item.Value, options);
        }
      }
    }

    return convertedValues;
  };

  const validateFormFields = useCallback(() => {
    const errors = [];
    const fieldErrors = {};

    formStructure.forEach((subject) => {
      subject.TabFormDtos.forEach((field) => {
        if (field.IsRequired && field.Visible && field.Type !== 'Table') {
          const value = formData[field.Id]?.Value;
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            const error = {
              fieldId: field.Id,
              message: `${field.Title} اجباری است`,
              subjectId: subject.Id,
            };
            errors.push(error);
            fieldErrors[field.Id] = error.message;
          }
        }
      });
    });

    return { errors, fieldErrors };
  }, [formStructure, formData]);

  const validateRequiredTables = useCallback(() => {
    const errors = [];

    formStructure.forEach((subject) => {
      subject.TabFormDtos.forEach((field) => {
        if (field.IsRequired && field.Visible && field.Type === 'Table') {
          const rows = tableData[field.Id] || [];

          const hasRows = rows.length > 0;
          const hasCompletedRows = rows.some((row) => !row.isNew);

          if (hasRows && !hasCompletedRows) {
            errors.push({
              fieldId: field.Id,
              message: `${field.Title} حداقل باید دارای یک ردیف تایید شده باشد`,
              subjectId: subject.Id,
            });
          } else if (!hasRows) {
            errors.push({
              fieldId: field.Id,
              message: `${field.Title} حداقل باید دارای یک ردیف باشد`,
              subjectId: subject.Id,
            });
          }
        }
      });
    });

    return errors;
  }, [formStructure, tableData]);

  const showValidationToasts = (fieldErrors, tableErrors) => {
    const allErrors = [...fieldErrors, ...tableErrors];

    if (allErrors.length === 0) return;

    toast.error(allErrors[0].message, {
      duration: 4000,
      position: 'top-center',
    });

    setTimeout(() => {
      scrollToField(allErrors[0].fieldId);
    }, 500);
  };

  const scrollToField = (fieldId) => {
    const fieldElement = fieldRefs.current[fieldId];
    if (fieldElement && fieldElement.current) {
      fieldElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      fieldElement.current.classList.add('field-highlight');
      setTimeout(() => {
        fieldElement.current.classList.remove('field-highlight');
      }, 2000);
    }
  };

  useEffect(() => {
    if (!formStructure || formStructure.length === 0) return;

    formStructure.forEach((subject) => {
      subject.TabFormDtos.forEach((field) => {
        if (field.Type === 'Userlist' && field.Visible) {
          fetchUsers(field.Id);
        }
      });
    });
  }, [formStructure]);

  const renderTreeNodes = (data) => {
    console.log('datamasdasd : ', data);

    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => {
      const value = item.value || item.key;
      const label = item.label || item.title;

      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={label} value={value} key={value}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={label} value={value} key={value} />;
    });
  };

  const findLookupTitleByValue = (value, options) => {
    if (!value || !options || options.length === 0) return value;

    const foundOption = options.find((option) => option.value == value);
    debugger;
    return foundOption ? foundOption.label : value;
  };

  const fetchLookupOptions = async (lookupTableId) => {
    if (lookupOptions[lookupTableId]) return;

    try {
      const response = await apiClient(`${api}LookUpTable/GetAllInside?lookUpTableId=${lookupTableId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let processedData = [];
      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          if (response.data[0].hasOwnProperty('value') && response.data[0].hasOwnProperty('label')) {
            processedData = response.data;
          } else {
            processedData = processLookupData(response.data);
          }
        }
      }

      setLookupOptions((prev) => ({
        ...prev,
        [lookupTableId]: processedData,
      }));
    } catch (error) {
      setLookupOptions((prev) => ({
        ...prev,
        [lookupTableId]: [],
      }));
    }
  };

  const formatCost = (value) => {
    if (!value) return '';
    const numericValue = value.toString().replace(/[^\d]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = (fieldId, value, tabFormId, fieldType) => {
    let finalValue = value;

    if (fieldType === 'LookUp') {
      const field = formStructure.flatMap((subject) => subject.TabFormDtos).find((f) => f.Id === tabFormId);

      if (field && field.LookupTableId) {
        const options = lookupOptions[field.LookupTableId] || [];
        finalValue = findLookupTitleByValue(value, options);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...(prev[fieldId] || {}),
        Value: finalValue,
        TabCheckListId: TabCheckListId,
        TabFormId: tabFormId,
        ProjectCharterId: ProjectCharterId,
      },
    }));

    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCostChange = (fieldId, value, tabFormId, fieldType) => {
    const formattedValue = formatCost(value);
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...(prev[fieldId] || {}),
        Value: formattedValue,
        TabCheckListId: TabCheckListId,
        TabFormId: tabFormId,
        ProjectCharterId: ProjectCharterId,
      },
    }));

    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handlePersianDateChange = (fieldId, date, tabFormId, fieldType) => {
    let dateString = '';
    if (date) {
      dateString = date.format('YYYY/MM/DD');
    }

    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...(prev[fieldId] || {}),
        Value: dateString,
        TabCheckListId: TabCheckListId,
        TabFormId: tabFormId,
        ProjectCharterId: ProjectCharterId,
      },
    }));

    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (fieldId, value, tabFormId, fieldType) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...(prev[fieldId] || {}),
        Value: value,
        TabCheckListId: TabCheckListId,
        TabFormId: tabFormId,
        ProjectCharterId: ProjectCharterId,
      },
    }));

    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const addNewRow = (tableId, columns) => {
    const currentRows = tableData[tableId] || [];
    const hasUnsavedRow = currentRows.some((row) => row.isNew === true);

    if (hasUnsavedRow) {
      toast.error('لطفاً ردیف فعلی را تایید یا حذف کنید قبل از اضافه کردن ردیف جدید.');
      return;
    }

    const currentRowCount = currentRows.length;

    const initialData = columns.map((col, index) => ({
      Value: col.Type === 'Date' ? '' : '',
      Type: col.Type,
      TabCheckListId: TabCheckListId,
      ProjectCharterId: ProjectCharterId,
      TableFormInsideId: tableId,
      Order: currentRowCount,
      TabFormId: col.Id,
    }));

    const newRow = {
      key: `${tableId}-${Date.now()}`,
      id: `${tableId}-${Date.now()}`,
      isNew: true,
      data: initialData,
    };

    setTableData((prev) => ({
      ...prev,
      [tableId]: [...(prev[tableId] || []), newRow],
    }));

    setEditingRows((prev) => ({
      ...prev,
      [`${tableId}-${newRow.id}`]: true,
    }));
  };

  const approveRow = (tableId, rowId, record) => {
    const row = (tableData[tableId] || []).find((r) => r.id === rowId);
    if (!row) return;

    const validation = validateTableRow(tableId, row);

    if (!validation.isValid) {
      const errorKey = `${tableId}-${rowId}`;
      setTableValidationErrors((prev) => ({
        ...prev,
        [errorKey]: validation.errors,
      }));
      toast.error('لطفاً تمام فیلدهای اجباری را پر کنید');
      return;
    }

    setEditingRows((prev) => {
      const newState = { ...prev };
      delete newState[`${tableId}-${rowId}`];
      return newState;
    });

    setTableData((prev) => ({
      ...prev,
      [tableId]: prev[tableId].map((row) => (row.id === rowId ? { ...row, isNew: false } : row)),
    }));

    setTableValidationErrors((prev) => {
      const newState = { ...prev };
      delete newState[`${tableId}-${rowId}`];
      return newState;
    });
  };

  const rejectRow = (tableId, rowId) => {
    setTableData((prev) => ({
      ...prev,
      [tableId]: prev[tableId].filter((row) => row.id !== rowId),
    }));

    setEditingRows((prev) => {
      const newState = { ...prev };
      delete newState[`${tableId}-${rowId}`];
      return newState;
    });

    setTableValidationErrors((prev) => {
      const newState = { ...prev };
      delete newState[`${tableId}-${rowId}`];
      return newState;
    });
  };

  const deleteRow = (tableId, rowId) => {
    setTableData((prev) => ({
      ...prev,
      [tableId]: prev[tableId].filter((row) => row.id !== rowId),
    }));
    message.success('ردیف حذف شد');
  };

  const editRow = (tableId, rowId) => {
    setEditingRows((prev) => ({
      ...prev,
      [`${tableId}-${rowId}`]: true,
    }));
  };
  const processLookupData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => ({
      value: item.key,
      label: item.title,
      children: item.children ? processLookupData(item.children) : undefined,
    }));
  };

  const handleTableCellChange = (tableId, rowId, fieldIndex, value, tabFormId, fieldType) => {
    let finalValue = value;

    if (fieldType === 'LookUp') {
      const tableField = formStructure.flatMap((subject) => subject.TabFormDtos).find((f) => f.Id === tableId);

      if (tableField) {
        const columnField = tableField.TableFormInsideDtos[fieldIndex];
        if (columnField && columnField.LookupTableId) {
          if (columnField.IsChoosen) {
            finalValue = value;
          } else {
            finalValue = value;
          }
        }
      }
    }

    setTableData((prev) => ({
      ...prev,
      [tableId]: prev[tableId].map((row) => {
        if (row.id === rowId) {
          const newData = [...(row.data || [])];
          newData[fieldIndex] = {
            ...newData[fieldIndex],
            Value: finalValue,
            Type: fieldType,
            TabFormId: tabFormId,
          };
          return { ...row, data: newData };
        }
        return row;
      }),
    }));

    const errorKey = `${tableId}-${rowId}`;
    if (tableValidationErrors[errorKey]) {
      setTableValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handlePersianTableCellChange = (tableId, rowId, fieldIndex, date, tabFormId, fieldType) => {
    let dateString = '';
    if (date) {
      dateString = date.format('YYYY/MM/DD');
    }

    setTableData((prev) => ({
      ...prev,
      [tableId]: prev[tableId].map((row) => {
        if (row.id === rowId) {
          const newData = [...(row.data || [])];
          newData[fieldIndex] = {
            ...newData[fieldIndex],
            Value: dateString,
            Type: fieldType,
            TabFormId: tabFormId,
          };
          return { ...row, data: newData };
        }
        return row;
      }),
    }));

    const errorKey = `${tableId}-${rowId}`;
    if (tableValidationErrors[errorKey]) {
      setTableValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleTableCheckboxChange = (tableId, rowId, fieldIndex, value, tabFormId, fieldType) => {
    setTableData((prev) => ({
      ...prev,
      [tableId]: prev[tableId].map((row) => {
        if (row.id === rowId) {
          const newData = [...(row.data || [])];
          newData[fieldIndex] = {
            ...newData[fieldIndex],
            Value: value,
            Type: fieldType,
            TabFormId: tabFormId,
          };
          return { ...row, data: newData };
        }
        return row;
      }),
    }));

    const errorKey = `${tableId}-${rowId}`;
    if (tableValidationErrors[errorKey]) {
      setTableValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateTableRow = useCallback(
    (tableId, rowData) => {
      const field = formStructure.flatMap((subject) => subject.TabFormDtos).find((f) => f.Id === tableId);

      if (!field) return { isValid: true, errors: {} };

      const errors = {};

      if (rowData.data) {
        rowData.data.forEach((cellData, index) => {
          const column = field.TableFormInsideDtos[index];
          if (column && column.IsRequired) {
            const value = cellData.Value;
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              errors[`field-${index}`] = `${column.Title} اجباری است`;
            }
          }
        });
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [formStructure],
  );

  const transformFormDataToArray = () => {
    console.log('formData : ', formData);
    const result = [];

    formStructure.forEach((subject) => {
      subject.TabFormDtos.forEach((field) => {
        if (field.Type !== 'Table') {
          const existingData = formData[field.Id];
          let valueToSave = '';

          if (field.Type === 'Checkbox') {
            valueToSave = (existingData?.Value === 'true' || existingData?.Value === true).toString();
          } else {
            valueToSave = existingData?.Value || '';
          }

          result.push({
            Id: existingData?.Id,
            Value: valueToSave,
            TabCheckListId: existingData?.TabCheckListId || TabCheckListId,
            TabFormId: existingData?.TabFormId || field.Id,
            ProjectCharterId: existingData?.ProjectCharterId || ProjectCharterId,
            Type: field.Type,
          });
        }
      });
    });

    return result;
  };

  const transformTableDataToArray = () => {
    const result = [];

    formStructure.forEach((subject) => {
      subject.TabFormDtos.forEach((field) => {
        if (field.Type === 'Table') {
          const tableId = field.Id;
          const tableRows = tableData[tableId] || [];
          const tableColumns = field.TableFormInsideDtos.sort((a, b) => a.Order - b.Order);

          tableRows.forEach((row, rowIndex) => {
            tableColumns.forEach((column, colIndex) => {
              const cellData = row.data[colIndex];
              let valueToSave = '';

              if (column.Type === 'Checkbox') {
                valueToSave = (cellData?.Value === 'true' || cellData?.Value === true).toString();
              } else {
                valueToSave = cellData?.Value || '';
              }

              result.push({
                Id: cellData?.Id,
                Value: valueToSave,
                Type: cellData?.Type || column.Type,
                TabCheckListId: cellData?.TabCheckListId || TabCheckListId,
                ProjectCharterId: cellData?.ProjectCharterId || ProjectCharterId,
                TableFormInsideId: cellData?.TableFormInsideId || tableId,
                Order: cellData?.Order !== undefined ? cellData.Order : rowIndex,
                TabFormId: cellData?.TabFormId || column.Id,
              });
            });
          });
        }
      });
    });

    return result;
  };

  const registerInformation = async () => {
    const { errors: fieldErrors, fieldErrors: validationErrorsObj } = validateFormFields();
    const tableErrors = validateRequiredTables();

    setValidationErrors(validationErrorsObj);
    setShowValidationSummary(true);

    if (fieldErrors.length > 0 || tableErrors.length > 0) {
      showValidationToasts(fieldErrors, tableErrors);
      return;
    }

    try {
      const formDataArray = transformFormDataToArray();
      const tableDataArray = transformTableDataToArray();

      if (onsubmiting !== undefined) {
        onsubmiting({
          dynamicFormData: formDataArray,
          dynamicTableData: tableDataArray,
        });

        return;
      }

      const TableFormDataEdit = tableDataArray.filter((item) => item.Id);
      const TableFormDataAdd = tableDataArray.filter((item) => !item.Id);

      if (IsEdit) {
        EditTabFormValue(formDataArray, {
          onSuccess: () => {
            EditTableFormInsideValue(TableFormDataEdit, {
              onSuccess: () => {
                AddListTableFormInside(TableFormDataAdd, {
                  onSuccess: () => {
                    message.success('اطلاعات با موفقیت بروزرسانی شد');
                    refetchGetTabFormValue();
                  },
                });
              },
            });
          },
        });
      } else {
        AddListTabFormValue(formDataArray, {
          onSuccess: () => {
            message.success('اطلاعات با موفقیت ثبت شد');
            refetchGetTabFormValue();
          },
        });
        AddListTableFormInside(tableDataArray, {
          onSuccess: () => {
            refetchGetTableFormInsideValue();
          },
        });
      }
    } catch (error) {
      console.error('Error registering information:', error);
      message.error('خطا در ثبت اطلاعات');
    }
  };

  const getInputStatus = (fieldId) => {
    return validationErrors[fieldId] ? 'error' : '';
  };

  const getTableCellStatus = (tableId, rowId, fieldIndex) => {
    const errorKey = `${tableId}-${rowId}`;
    const rowErrors = tableValidationErrors[errorKey];

    if (!rowErrors) return '';

    const fieldErrorKey = `field-${fieldIndex}`;
    return rowErrors[fieldErrorKey] ? 'error' : '';
  };

  const renderInput = (field) => {
    const isRequired = field.IsRequired;
    const fieldId = field.Id;
    const hasError = validationErrors[fieldId];

    if (!fieldRefs.current[fieldId]) {
      fieldRefs.current[fieldId] = React.createRef();
    }

    switch (field.Type) {
      case 'Text':
        return (
          <div ref={fieldRefs.current[fieldId]}>
            <Input
              value={formData[fieldId]?.Value || ''}
              onChange={(e) => handleInputChange(fieldId, e.target.value, field.Id, field.Type)}
              placeholder={`${field.Title} را وارد کنید...`}
              status={getInputStatus(fieldId)}
            />
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'LongText':
        return (
          <div ref={fieldRefs.current[fieldId]}>
            <TextArea
              value={formData[fieldId]?.Value || ''}
              onChange={(e) => handleInputChange(fieldId, e.target.value, field.Id, field.Type)}
              placeholder={`${field.Title} را وارد کنید...`}
              rows={4}
              status={getInputStatus(fieldId)}
            />
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'Cost':
        return (
          <div ref={fieldRefs.current[fieldId]}>
            <Input
              value={formData[fieldId]?.Value || ''}
              onChange={(e) => handleCostChange(fieldId, e.target.value, field.Id, field.Type)}
              placeholder='100,000'
              status={getInputStatus(fieldId)}
            />
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'Checkbox':
        return (
          <div ref={fieldRefs.current[fieldId]}>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px', gap: 10 }}>
              <input
                type='checkbox'
                checked={formData[fieldId]?.Value === 'true' || formData[fieldId]?.Value === true}
                onChange={(e) => handleCheckboxChange(fieldId, e.target.checked.toString(), field.Id, field.Type)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginRight: '8px',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{ userSelect: 'none', cursor: 'pointer' }}
                onClick={() => {
                  const currentValue = formData[fieldId]?.Value === 'true' || formData[fieldId]?.Value === true;
                  handleCheckboxChange(fieldId, (!currentValue).toString(), field.Id, field.Type);
                }}
              >
                {field.Title}
              </span>
            </div>
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'Number':
        return (
          <div ref={fieldRefs.current[fieldId]}>
            <InputNumber
              style={{ width: '100%' }}
              value={formData[fieldId]?.Value || undefined}
              onChange={(value) => handleInputChange(fieldId, value?.toString(), field.Id, field.Type)}
              placeholder={`${field.Title} را وارد کنید...`}
              status={getInputStatus(fieldId)}
            />
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'Userlist':
        const userListOptions = users[fieldId] || [];

        return (
          <div ref={fieldRefs.current[fieldId]}>
            <Select
              showSearch
              placeholder={`انتخاب ${field.Title}...`}
              optionFilterProp='children'
              value={formData[fieldId]?.Value || undefined}
              onChange={(value) => handleInputChange(fieldId, value, field.Id, field.Type)}
              status={getInputStatus(fieldId)}
              style={{ width: '100%' }}
              allowClear
            >
              {userListOptions.map((user) => (
                <Select.Option key={user.value} value={user.value}>
                  {user.label}
                </Select.Option>
              ))}
            </Select>
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'Date':
        return (
          <div ref={fieldRefs.current[fieldId]}>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              format='YYYY/MM/DD'
              value={formData[fieldId]?.Value || ''}
              onChange={(date) => handlePersianDateChange(fieldId, date, field.Id, field.Type)}
              placeholder={`${field.Title} را انتخاب کنید...`}
              style={{
                width: '100%',
                height: '32px',
              }}
              containerStyle={{
                width: '100%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '18px',
                top: '60%',

                pointerEvents: 'none',
                color: '#bfbfbf',
              }}
            >
              <CalendarOutlined />
            </div>
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'LookUp':
        if (field.LookupTableId && !lookupOptions[field.LookupTableId]) {
          fetchLookupOptions(field.LookupTableId);
        }

        const lookupData = lookupOptions[field.LookupTableId] || [];

        const treeSelectValue = formData[fieldId]?.Value ? formData[fieldId].Value : field.IsChoosen ? [] : undefined;

        return (
          <div ref={fieldRefs.current[fieldId]}>
            <TreeSelect
              style={{ width: '100%' }}
              value={treeSelectValue}
              onChange={(value) => handleInputChange(fieldId, value, field.Id, field.Type)}
              placeholder={`${field.Title} را انتخاب کنید...`}
              status={getInputStatus(fieldId)}
              treeDefaultExpandAll
              allowClear
              multiple={field.IsChoosen}
              showSearch
              treeNodeFilterProp='title'
            >
              {renderTreeNodes(lookupData)}
            </TreeSelect>
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );

      case 'Table':
        return <div ref={fieldRefs.current[fieldId]}>{renderTable(field)}</div>;

      default:
        return null;
    }
  };

  const renderTableCellInput = (field, tableId, rowId, value, fieldIndex) => {
    const hasError = getTableCellStatus(tableId, rowId, fieldIndex);

    switch (field.Type) {
      case 'LongText':
        return (
          <div>
            <TextArea
              value={value?.Value || ''}
              onChange={(e) => handleTableCellChange(tableId, rowId, fieldIndex, e.target.value, field.Id, field.Type)}
              placeholder={`${field.Title} را وارد کنید...`}
              rows={4}
              status={hasError}
            />
            {hasError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{hasError}</div>}
          </div>
        );
      case 'Text':
        return (
          <div>
            <Input
              size='small'
              value={value?.Value || ''}
              onChange={(e) => handleTableCellChange(tableId, rowId, fieldIndex, e.target.value, field.Id, field.Type)}
              placeholder={field.Title}
              status={hasError}
            />
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      case 'Cost':
        return (
          <div>
            <Input
              size='small'
              value={value?.Value || ''}
              onChange={(e) => handleTableCellChange(tableId, rowId, fieldIndex, formatCost(e.target.value), field.Id, field.Type)}
              placeholder='0,000'
              status={hasError}
            />
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      case 'Checkbox':
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '24px' }}>
              <input
                type='checkbox'
                checked={value?.Value === 'true' || value?.Value === true}
                onChange={(e) => handleTableCheckboxChange(tableId, rowId, fieldIndex, e.target.checked.toString(), field.Id, field.Type)}
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '6px',
                  cursor: 'pointer',
                }}
                size='small'
              />
            </div>
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      case 'Number':
        return (
          <div>
            <InputNumber
              size='small'
              style={{ width: '100%' }}
              value={value?.Value || undefined}
              onChange={(val) => handleTableCellChange(tableId, rowId, fieldIndex, val?.toString(), field.Id, field.Type)}
              placeholder={field.Title}
              status={hasError}
            />
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      case 'Date':
        return (
          <div>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              format='YYYY/MM/DD'
              value={value?.Value || ''}
              onChange={(date) => handlePersianTableCellChange(tableId, rowId, fieldIndex, date, field.Id, field.Type)}
              placeholder={field.Title}
              style={{
                width: '100%',
                height: '32px',
              }}
              containerStyle={{
                width: '100%',
              }}
              size='small'
            />
            <div
              style={{
                position: 'absolute',
                left: '18px',
                top: '60%',
                pointerEvents: 'none',
                color: '#bfbfbf',
              }}
            >
              <CalendarOutlined />
            </div>
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      case 'Userlist':
        const tableUserOptions = users[`table-${field.Id}`] || [];
        const isTableLoadingUsers = loadingUsers[`table-${field.Id}`] || false;

        return (
          <div>
            <Select
              size='small'
              showSearch
              placeholder='انتخاب کاربر'
              optionFilterProp='children'
              value={value?.Value || undefined}
              onChange={(val) => handleTableCellChange(tableId, rowId, fieldIndex, val, field.Id, field.Type)}
              status={hasError}
              style={{ width: '100%' }}
              allowClear
              loading={isTableLoadingUsers}
              notFoundContent={isTableLoadingUsers ? 'در حال بارگذاری...' : 'کاربری یافت نشد'}
            >
              {tableUserOptions.map((user) => (
                <Select.Option key={user.value} value={user.value}>
                  {user.label}
                </Select.Option>
              ))}
            </Select>
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      case 'LookUp':
        if (field.LookupTableId && !lookupOptions[field.LookupTableId]) {
          fetchLookupOptions(field.LookupTableId);
        }

        const tableLookupData = lookupOptions[field.LookupTableId] || [];

        // Check if this field supports multiple options
        const IsChoosen = field.IsChoosen || false;

        // Parse stored IDs and return them for TreeSelect value
        const parseStoredIds = (storedValue) => {
          if (!storedValue) return IsChoosen ? [] : undefined;

          if (IsChoosen) {
            // For multiple: "id1|id2|id3" -> ["id1", "id2", "id3"]
            return storedValue.split('|').filter((id) => id.trim());
          } else {
            // For single: just return the ID
            return storedValue;
          }
        };

        // Convert selected IDs to storage format (id|id|id for multiple, id for single)
        const formatIdsForStorage = (selectedValues) => {
          if (!selectedValues) return '';

          if (IsChoosen) {
            // For multiple: ["id1", "id2", "id3"] -> "id1|id2|id3"
            const values = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
            return values.join('|');
          } else {
            // For single: just return the ID
            return selectedValues;
          }
        };

        const cellTreeSelectValue = parseStoredIds(value?.Value);
        console.log('tableLookupData : ', tableLookupData);
        console.log('cellTreeSelectValue : ', cellTreeSelectValue);
        console.log('value?.Value : ', value?.Value);

        return (
          <div>
            <TreeSelect
              size='small'
              style={{ width: '100%' }}
              value={cellTreeSelectValue}
              onChange={(val) => {
                const formattedValue = formatIdsForStorage(val);
                debugger;

                handleTableCellChange(tableId, rowId, fieldIndex, formattedValue, field.Id, field.Type);
              }}
              placeholder='انتخاب'
              status={hasError}
              treeDefaultExpandAll
              multiple={IsChoosen}
              allowClear
              showSearch
              treeNodeFilterProp='title'
            >
              {renderTreeNodes(tableLookupData)}
            </TreeSelect>
            {hasError && <div style={{ color: 'red', fontSize: '10px', marginTop: '2px' }}>اجباری</div>}
          </div>
        );

      default:
        return <span>{value?.Value || ''}</span>;
    }
  };
  const findLookupTitleByValueRecursive = (value, options) => {
    if (!value || !options || options.length === 0) return value;

    // Recursive function to search through nested structure
    const searchRecursive = (items) => {
      for (const item of items) {
        // Check current item
        if (item.value == value) {
          return item.label;
        }

        // If item has children, search recursively
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          const found = searchRecursive(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const result = searchRecursive(options);
    return result || value; // Return original value if not found
  };

  // Render table
  const renderTable = (field) => {
    const tableId = field.Id;
    const columns = field.TableFormInsideDtos.sort((a, b) => a.Order - b.Order);
    const rows = tableData[tableId] || [];
    const isTableRequired = field.IsRequired;

    // Check if table has validation errors
    const tableErrors = validateRequiredTables();
    const tableError = tableErrors.find((error) => error.fieldId === tableId);
    const hasTableError = tableError && showValidationSummary;

    const tableColumns = [
      ...columns.map((column, index) => ({
        title: (
          <span>
            {column.Title}
            {column.IsRequired && <span style={{ color: 'red' }}> *</span>}
          </span>
        ),
        dataIndex: column.Id,
        key: column.Id,
        render: (text, record) => {
          const isEditing = editingRows[`${tableId}-${record.id}`];
          const cellValue = (record.data && record.data[index]) || {};
          if (isEditing) {
            return renderTableCellInput(column, tableId, record.id, cellValue, index);
          } else {
            // Handle display for different field types
            if (column.Type === 'LookUp' && cellValue.Value) {
              const options = lookupOptions[column.LookupTableId] || [];

              if (column.IsChoosen) {
                // Handle multiple selection display: "id1|id2|id3" -> "Title1, Title2, Title3"
                const ids = cellValue.Value.split('|').filter((id) => id.trim());
                const titles = ids
                  .map((id) => {
                    return findLookupTitleByValueRecursive(id, options);
                  })
                  .filter((title) => title && title !== ''); // Remove empty titles

                return <span>{titles.length > 0 ? titles.join(', ') : '-'}</span>;
              } else {
                // Handle single selection display: "id" -> "Title"
                const displayTitle = findLookupTitleByValueRecursive(cellValue.Value, options);
                return <span>{displayTitle || '-'}</span>;
              }
            } else if (column.Type === 'Userlist' && cellValue.Value) {
              // Handle user display
              const userOptions = users[`table-${column.Id}`] || [];
              const foundUser = userOptions.find((user) => user.value == cellValue.Value);
              const displayName = foundUser ? foundUser.label : cellValue.Value;
              return <span>{displayName || '-'}</span>;
            } else if (column.Type === 'Checkbox') {
              // Handle checkbox display
              const isChecked = cellValue.Value === 'true' || cellValue.Value === true;
              return <span>{isChecked ? '✓ بله' : '✗ خیر'}</span>;
            } else {
              // Default display for other types
              return <span>{cellValue.Value || '-'}</span>;
            }
          }
        },
      })),
      {
        title: 'عملیات',
        key: 'operations',
        width: 150,
        render: (_, record) => {
          const isEditing = editingRows[`${tableId}-${record.id}`];
          return (
            <Space>
              {isEditing ? (
                <>
                  <Button type='primary' size='small' icon={<EditOutlined />} onClick={() => approveRow(tableId, record.id, record)}>
                    تایید
                  </Button>
                  <Button danger size='small' onClick={() => rejectRow(tableId, record.id)}>
                    انصراف
                  </Button>
                </>
              ) : (
                <>
                  <Button type='primary' size='small' icon={<EditOutlined />} onClick={() => editRow(tableId, record.id)}>
                    ویرایش
                  </Button>
                  <Popconfirm title='آیا از حذف این ردیف اطمینان دارید؟' onConfirm={() => deleteRow(tableId, record.id)} okText='بله' cancelText='خیر'>
                    <Button danger size='small' icon={<DeleteOutlined />}>
                      حذف
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          );
        },
      },
    ];

    return (
      <div>
        <Collapse>
          <Panel header={<span>{field.IsRequired && field.Type === 'Table' ? `* ${field.Title} ` : field.Title}</span>} key={tableId}>
            <Space direction='vertical' style={{ width: '100%' }}>
              <Button type='text' icon={<PlusOutlined className=' bg-blue-500 rounded-full p-1.5 !text-white' />} onClick={() => addNewRow(tableId, columns)}>
                افزودن ردیف جدید
              </Button>

              <Table columns={tableColumns} dataSource={rows} pagination={false} size='small' bordered rowClassName={(record) => (record.isNew ? 'new-row' : '')} />

              <Button className='invisible' type='primary' onClick={() => registerTable(tableId)}>
                ثبت جدول
              </Button>
            </Space>
          </Panel>
        </Collapse>
        {hasTableError && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{tableError.message}</div>}
      </div>
    );
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <Card className={`${onsubmiting !== undefined ? ' !border-none !px-0 !mx-0' : ''}`}>
      <Toaster
        position='top-center'
        toastOptions={{
          duration: 4000,
        }}
      />

      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        {formStructure
          .sort((a, b) => a.Order - b.Order)
          .filter((subject) => subject.Visible)
          .map((subject) => (
            <div key={subject.Id} className='mb-10 relative'>
              <Title level={5} style={{ borderBottom: '2px solid #E9E9E9', paddingBottom: 20, marginBottom: 30, marginTop: 10 }} className='!text-blue-600'>
                {subject.Title}
              </Title>

              {/* --- Single Grid Block: All Fields in Order --- */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {subject.TabFormDtos.sort((a, b) => a.Order - b.Order) // Sort ALL visible fields by Order
                  .filter((field) => field.Visible) // Filter ALL visible fields
                  .map((field) => {
                    // Determine column span based on field type
                    let colProps = { xs: 24, sm: 12, md: 8 }; // Default for most fields

                    if (field.Type === 'LongText') {
                      // Make LongText full width
                      colProps = { xs: 24, sm: 24, md: 24 };
                    } else if (field.Type === 'Table') {
                      // Make Table full width
                      colProps = { xs: 24, sm: 24, md: 24 };
                    }
                    // You can adjust colProps for other types if needed (e.g., Checkbox wider/smaller)

                    return (
                      <Col {...colProps} key={field.Id}>
                        <Space direction='vertical' style={{ width: '100%' }}>
                          {/* Show title for all field types */}
                          <label
                            style={{
                              fontWeight: 500,
                              // Add display: 'block' for consistency if needed, but usually Space handles layout
                              // display: 'block',
                              // marginBottom: 8, // Adjust margin if needed
                            }}
                          >
                            {field.Type === 'Checkbox' || field.Type === 'Table' ? '' : field.Title}
                            {field.IsRequired && field.Type !== 'Table' && <span style={{ color: 'red' }}> *</span>}
                          </label>
                          {renderInput(field)}
                        </Space>
                      </Col>
                    );
                  })}
              </Row>
            </div>
          ))}
        {formStructure.length !== 0 || onsubmiting ? (
          <div className=' w-full flex items-center justify-center'>
            <Button type='primary' size='large' className={'w-70'} onClick={registerInformation} hidden={!IsEdit && IsEdit !== undefined}>
              {IsEdit ? 'ویرایش اطلاعات' : 'ثبت اطلاعات'}
            </Button>
          </div>
        ) : (
          ''
        )}
      </Space>

      <style jsx>{`
        .new-row {
          background-color: #f6ffed;
          border: 1px solid #b7eb8f;
        }
        .field-highlight {
          animation: highlight 2s ease;
        }
        @keyframes highlight {
          0% {
            background-color: yellow;
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
    </Card>
  );
};

export default DynamicFormComponent;
