import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  Situation: { inEdit: false, inAdd: false },
  InitData: null,
  projectChartId: null,
  userAccessOnProjectChart: {},
  projectChartValidation: null,
  getFlowSituation: null,
  Situationid: 3,
  Title: '',
  InsertBy: '',
  RefetchMainProroposalTable: false,
};
const ProjectChartSlice = createSlice({
  name: 'ProjectChart',
  initialState,
  reducers: {
    handleChangeSituation: (state, action) => {
      state.Situation = action.payload;
    },
    handleInitialazeData: (state, action) => {
      state.InitData = action.payload;
    },
    handleProjectChartId: (state, action) => {
      state.projectChartId = action.payload;
    },
    handleUserAccessOnProjectChart: (state, action) => {
      state.userAccessOnProjectChart = action.payload;
    },
    handleProjectChartValidation: (state, action) => {
      state.projectChartValidation = action.payload;
    },
    handelGetFlowSituation: (state, action) => {
      state.getFlowSituation = action.payload;
    },
    handelchangeSituationid: (state, action) => {
      state.Situationid = action.payload;
    },
    handelchangeTitle: (state, action) => {
      state.Title = action.payload;
    },
    handelchangeInsertBy: (state, action) => {
      state.InsertBy = action.payload;
    },
    handelchangeRefetchMainProroposalTable: (state, action) => {
      state.RefetchMainProroposalTable = action.payload;
    },
  },
});
export const {
  handleChangeSituation,
  handelchangeTitle,
  handelchangeInsertBy,
  handleInitialazeData,
  handelchangeSituationid,
  handleProjectChartId,
  handleUserAccessOnProjectChart,
  handleProjectChartValidation,
  handelchangeRefetchMainProroposalTable,
} = ProjectChartSlice.actions;
export default ProjectChartSlice.reducer;
