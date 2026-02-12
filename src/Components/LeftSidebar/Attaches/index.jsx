import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment-jalaali';
import { toast } from 'react-hot-toast';
import { Upload, Modal, Input, Button, Form } from 'antd';
import uploadManager from '../../../utils/uploadManager';
const { Dragger } = Upload;
const { TextArea } = Input;
import { useCreateAttach, useDeleteAttachById, useEditAttach, useGetAttach } from '../../../ApiHooks/CommonHooks/Attaches';
import { InboxOutlined, DownloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const Attaches = ({ charterId }) => {
  //#region states
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const PRPURL = useSelector((state) => state.Auth.PRPURL);

  //#endregion
  //#region features
  const loginUser = useSelector((state) => state.Auth.userInformation);
  const api = useSelector((state) => state.Auth);
  //#endregion
  //#region hooks
  const { mutateAsync: Create } = useCreateAttach();
  const { mutateAsync: Update } = useEditAttach();
  const { mutateAsync: Delete } = useDeleteAttachById();
  const { data: AttachList, refetch: refetchList } = useGetAttach(charterId);
  //#endregion
  //#region functions

  const handelUpload = (options) => {
    const { file, onProgress, onSuccess, onError } = options;

    uploadManager
      .uploadFile({
        file,
        apiURL: `${import.meta.env.DEV ? 'http://epmserver43' : PRPURL}/_vti_bin/ProposalSharePoint/ProposalWebService.asmx/UploadFile`,
        onProgress: (percent) => {
          onProgress({ percent }, file);
        },
      })
      .then((res) => {
        try {
          const jsonObject = JSON.parse(res);
          const extention = file.name.split('.').pop();

          let ForOffice = false;
          let URL = '';
          if (['doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx'].includes(extention)) {
            ForOffice = true;
            URL = `${api?.PRPURL}/_layouts/15/WopiFrame2.aspx?sourcedoc=%7B${jsonObject.d?.Item2}%7D`;
          }

          const fileData = {
            uid: jsonObject.d?.Item1,
            name: file.name,
            sharePointId: jsonObject.d?.Item2,
            extension: extention,
          };

          setCurrentFile(fileData);
          setIsModalVisible(true);

          onSuccess(res, file);

          toast.success(`آپلود فایل "${file.name}" با موفقیت انجام شد ✅`);
        } catch (err) {
          onError(err, file);
        }
      })
      .catch((error) => {
        console.error(error);

        onError(error, file);
      });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData = {
        Id: currentFile.uid,
        SharePointId: currentFile.sharePointId,
        UserUploader: loginUser?.FullQualifyName,
        UserUploaderName: loginUser?.UserName,
        FileName: currentFile.name,
        FileExtention: currentFile.extension,
        UploadeDate: moment(Date.now()).toISOString(),
        ProjectCharterId: charterId,
        IsDeleted: false,
        Description: values.description,
      };

      if (isEditing) {
        await Update(newData);
      } else {
        await Create(newData);
      }

      form.resetFields();
      setIsModalVisible(false);
      setCurrentFile(null);
      setIsEditing(false);
      refetchList();
    } catch (error) {
      console.log(error);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setCurrentFile(null);
    setIsEditing(false);
  };

  const handleEditDescription = (file) => {
    const attachData = AttachList?.data?.find((item) => item.Id === file.uid);
    setCurrentFile({
      uid: file.uid,
      name: file.name,
      sharePointId: attachData?.SharePointId,
      extension: attachData?.FileExtention,
      description: attachData?.Description || '',
    });
    setIsEditing(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      description: attachData?.Description || '',
    });
  };

  const deleteAttach = async (record) => {
    try {
      await Delete(record.uid);
      refetchList();
    } catch (error) {
      console.log(error);
    }
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };
  //#endregion
  //#region useEffects
  useEffect(() => {
    if (AttachList?.data?.length > 0) {
      const newFileList = AttachList?.data?.map((item) => ({
        uid: item.Id,
        name: item.FileName,
        status: 'done',
        url: `${api?.PRPURL}/${api?.PRPLibraryName}/${item.Id}(${item.FileName}`,
        userUploaderName: item.UserUploaderName,
        uploadeDate: moment(item.UploadeDate).format('jYYYY/jMM/jDD'),
        description: item.Description,
      }));
      setFileList(newFileList);
    } else {
      setFileList([]);
    }
  }, [AttachList]);
  //#endregion

  const props = {
    customRequest: handelUpload,
  };

  return (
    <>
      <Dragger
        {...props}
        listType='picture'
        fileList={fileList}
        showUploadList={{
          showRemoveIcon: true,
          showDownloadIcon: true,
          removeIcon: <DeleteOutlined twoToneColor='#f93e3e' />,
          downloadIcon: <DownloadOutlined twoToneColor='#1677ff' />,
        }}
        progress={{
          strokeColor: {
            '0%': '#108ee9',
            '100%': '#87d068',
          },
          strokeWidth: 3,
          format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
        }}
        onRemove={deleteAttach}
        itemRender={(originNode, file) => (
          <div>
            {originNode}
            <div className='row px-3' dir='rtl' style={{ marginTop: 8, color: '#878686' }}>
              <div className='col text-start'>
                <span> {file.userUploaderName}</span>
              </div>
              <div className='col text-end'>
                <span> {file.uploadeDate}</span>
              </div>
            </div>
            <div className='row px-3' dir='rtl'>
              <div className='col text-start'>
                <Button
                  type='link'
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDescription(file);
                  }}
                >
                  ویرایش توضیحات
                </Button>
              </div>
            </div>
            {file.description && (
              <div className='row px-3' dir='rtl' style={{ marginTop: 8 }}>
                <div className='col'>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    <strong>توضیحات:</strong> {file.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>برای انتخاب فایل کلیک کنید یا آن را بکشید و رها کنید</p>
      </Dragger>

      <Modal
        title={isEditing ? 'ویرایش توضیحات فایل' : 'افزودن توضیحات فایل'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key='cancel' onClick={handleModalCancel}>
            انصراف
          </Button>,
          <Button key='submit' type='primary' onClick={handleModalOk}>
            {isEditing ? 'بروزرسانی' : 'ثبت'}
          </Button>,
        ]}
        maskClosable={false} // Prevent closing when clicking on mask
      >
        {/* Add onClick handler to prevent propagation */}
        <div onClick={handleModalContentClick}>
          <Form form={form} layout='vertical'>
            <Form.Item name='description' label='توضیحات' rules={[{ required: true, message: 'لطفاً توضیحات را وارد کنید' }]}>
              <TextArea
                rows={4}
                placeholder='توضیحات مربوط به فایل را وارد کنید...'
                onClick={(e) => e.stopPropagation()} // Additional protection
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default Attaches;
