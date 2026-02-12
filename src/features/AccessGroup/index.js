import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  Id: null,
  open: false,
  Title: null,
  Description: '',
  AccessGroupProjectPortfolioDto: [],
  AccessGroupUnitDto: [],
  AccessGroupTypeProjectDto: [],
  AccessGroupOtherDto: {
    Id: null,
    charterChanges: false,
    Approved: false,
    Settings: false,
  },
  AccessGroupPropertiesDto: {
    Id: null,
    TypeProjectSubmit: false,
    TypeProjectEdit: false,
    TypeProjectView: false,
    TypeProjectDelete: false,
    UnitSubmit: false,
    UnitView: false,
    UnitEdit: false,
    UnitDelete: false,
    projectPortfolioSubmit: false,
    projectPortfolioView: false,
    projectPortfolioEdit: false,
    projectPortfolioDelete: false,
  },
  AccessGroupUsersDto: [],
  AddAccessGroupGroupsDto: [],
  // EditAccessGroupDataById: false,
  AccessGroupAllAndNullDto: {
    IsAllprojectPortfolio: false,
    IsAllUnit: false,
    IsAllTypeProject: false,
    IsNullprojectPortfolio: false,
    IsNullUnit: false,
    IsNullTypeProject: false,
  },
  inEditMode: false,
};
const AccessGroupSlice = createSlice({
  name: 'AccessGroup',
  initialState,
  reducers: {
    handleSwitchAccessGroup: (state, action) => {
      if (action.payload === false) {
        return { ...initialState }; // بازگشت مستقیم به حالت اولیه
      } else {
        state.open = action.payload;
      }
    },
    handleTitleAccessGroup: (state, action) => {
      state.Title = action.payload;
    },
    handleDescriptionAccessGroup: (state, action) => {
      state.Description = action.payload;
    },
    handleEditAccessGroupData: (state, action) => {
      state.EditAccessGroupDataById = action.payload;
    },
    // handleAccessGroupTypeProject: (state, action) => {
    //   state.AccessGroupTypeProjectDto = action.payload;
    // },
    handleAddMembers: (state, action) => {
      state.AccessGroupUsersDto = action.payload;
    },
    handleAddGroups: (state, action) => {
      state.AddAccessGroupGroupsDto = action.payload;
    },
    handleAccessGroupOthers: (state, action) => {
      switch (action.payload.action) {
        case '1':
          state.AccessGroupOtherDto.charterChanges = action.payload.status;
          break;
        case '2':
          state.AccessGroupOtherDto.Approved = action.payload.status;
          break;
        case '3':
          state.AccessGroupOtherDto.Settings = action.payload.status;
          break;
        default:
          break;
      }
    },
    handleprojectPortfolioIds: (state, action) => {
      state.AccessGroupProjectPortfolioDto = action.payload;
    },
    handleTypeProjectIds: (state, action) => {
      state.AccessGroupTypeProjectDto = action.payload;
    },
    handleUnitIds: (state, action) => {
      state.AccessGroupUnitDto = action.payload;
    },
    handlePermissions: (state, action) => {
      switch (action.payload.action) {
        case '1':
          state.AccessGroupPropertiesDto.TypeProjectSubmit = action.payload.status;
          break;

        case '2':
          state.AccessGroupPropertiesDto.TypeProjectView = action.payload.status;
          break;

        case '3':
          state.AccessGroupPropertiesDto.TypeProjectEdit = action.payload.status;

          break;

        case '4':
          state.AccessGroupPropertiesDto.TypeProjectDelete = action.payload.status;

          break;
        case '5':
          state.AccessGroupPropertiesDto.UnitSubmit = action.payload.status;

          break;

        case '6':
          state.AccessGroupPropertiesDto.UnitView = action.payload.status;

          break;

        case '7':
          state.AccessGroupPropertiesDto.UnitEdit = action.payload.status;

          break;

        case '8':
          state.AccessGroupPropertiesDto.UnitDelete = action.payload.status;

          break;
        case '9':
          state.AccessGroupPropertiesDto.projectPortfolioSubmit = action.payload.status;

          break;
        case '10':
          state.AccessGroupPropertiesDto.projectPortfolioView = action.payload.status;

          break;

        case '11':
          state.AccessGroupPropertiesDto.projectPortfolioEdit = action.payload.status;

          break;

        case '12':
          state.AccessGroupPropertiesDto.projectPortfolioDelete = action.payload.status;

          break;

        default:
          break;
      }
    },
    handleAccessGroupAllAndNullDto: (state, action) => {
      switch (action.payload.action) {
        case 'TypeProject':
          state.AccessGroupAllAndNullDto.IsNullTypeProject = action.payload.status;
          break;

        case 'Unit':
          state.AccessGroupAllAndNullDto.IsNullUnit = action.payload.status;
          break;

        case 'projectPortfolio':
          state.AccessGroupAllAndNullDto.IsNullprojectPortfolio = action.payload.status;
          break;
      }
    },
    handleEditAccessGroup: (state, action) => {
      return action.payload;
    },
    handleEditModel: (state, action) => {
      state.inEditMode = action.payload;
    },
  },
});

export const {
  handleEditAccessGroup,
  handleSwitchAccessGroup,
  handlePermissions,
  handleprojectPortfolioIds,
  handleTypeProjectIds,
  handleUnitIds,
  handleTitleAccessGroup,
  handleDescriptionAccessGroup,
  handleAccessGroupTypeProject,
  handleAccessGroupOthers,
  handleAddMembers,
  handleAddGroups,
  handleEditAccessGroupData,
  handleAccessGroupAllAndNullDto,
  handleEditModel,
} = AccessGroupSlice.actions;

export default AccessGroupSlice.reducer;

// واحد متولی
// نوع پروژه
// سبد طراحی/ پروژه
