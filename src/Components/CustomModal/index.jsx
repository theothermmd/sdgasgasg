import React, { useRef, useState } from 'react';
import { Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { handleShowModal } from '../../features/Modal/ModalSlice';
import Draggable from 'react-draggable';
// import {  handleAddId, handleEntityType, handleShowModal } from "../../features/Modal";

const CustomModal = ({ Component, width, title }) => {
  const customModal = useSelector((state) => state.Modal.statusModal);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });

  const draggleRef = useRef(null);
  const dispatch = useDispatch();

  const handleOk = (e) => {
    dispatch(handleShowModal(false));
    dispatch(handleEntityType(false));
    dispatch(handleAddId(false));
  };

  const handleCancel = (e) => {
    dispatch(handleShowModal(false));
    dispatch(handleEntityType(false));
    dispatch(handleAddId(false));
  };

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <Modal
      width={width}
      title={
        <div
          style={{
            width: '100%',

            cursor: 'move',

            direction: 'rtl',
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          {title}
        </div>
      }
      footer={null}
      open={customModal ? true : false}
      onOk={handleOk}
      onCancel={handleCancel}
      modalRender={(modal) => (
        <Draggable disabled={disabled} bounds={bounds} nodeRef={draggleRef} onStart={(event, uiData) => onStart(event, uiData)}>
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      {Component}
      {/* <Share /> */}
    </Modal>
  );
};

export default CustomModal;
