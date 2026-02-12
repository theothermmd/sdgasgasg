import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from '../features/Auth';
import ProjectChartSlice from '../features/ProjectChart/ProjectChartSlice';
import AccessGroupSlice from '../features/AccessGroup';
import uiReducer from '../features/LeftSidebar/LeftSidebarSlice';
import WorkFlowSlice from '../features/WorkFlow/WorkFlowSlice';
import ModalSlice from '../features/Modal/ModalSlice';
import FormSlice from '../features/Form';
import GlobalSetting from '../features/GlobalSetting';
export const Store = configureStore({
  reducer: {
    Auth: AuthSlice,
    ProjectChart: ProjectChartSlice, // 1
    AccessGroup: AccessGroupSlice,
    leftSidebar: uiReducer,
    WorkFlow: WorkFlowSlice,
    Modal: ModalSlice,
    Form: FormSlice, // 1
    GlobalSetting: GlobalSetting,
  },
});
