import { useSelector } from 'react-redux';
import ProjectInformation from './ProjectInformation';
import DynamicFormComponent from './DynamicFormComponent';
import { useGetAllCategoriesWithChildren } from '../ApiHooks/OtherSetting/TabCheckList';
import { useEffect, useState } from 'react';
import ProjectInfoForm from '../Components/CreateProposal/ProjectInfo';
import StakeholdersTab from '../Components/CreateProposal/Stakeholders/Stackholders';
import ProjectGoalsTab from '../Components/CreateProposal/projectGoalsTab/ProjectGolas';
import ScheduleManagementTab from '../Components/CreateProposal/scheduleManagementTabCustom/index';
import BudgetManagerTab from '../Components/CreateProposal/BudgetManagerTabCustom/index';
import DeliverablesStructureTab from '../Components/CreateProposal/DeliverablesStructureTabCustom/index';
import RisksConstraintsTab from '../Components/CreateProposal/RisksConstraintsTabCustom/index';

// ... imports ...

export default function Form() {
  const TabCheckListId = useSelector((state) => state.Form.TabCheckListId);
  const TabCategorieId = useSelector((state) => state.Form.TabCategorieId);

  const { data: GetAllCategoriesWithChildren } = useGetAllCategoriesWithChildren(TabCategorieId);

  const [tabid, settabid] = useState([]);
  const [Tabname, setTabname] = useState([]);

  useEffect(() => {
    if (!GetAllCategoriesWithChildren?.data) {
      settabid([]);
      return;
    }

    const matchedCategory = GetAllCategoriesWithChildren.data.find((value) => value.Id === TabCheckListId);

    if (!matchedCategory) {
      settabid([]);
      return;
    }

    settabid(matchedCategory.TabFormSubjects || []);
    setTabname(matchedCategory.Title);
  }, [GetAllCategoriesWithChildren, TabCheckListId, TabCategorieId]); // Dependencies are correct

  if (!GetAllCategoriesWithChildren || !TabCheckListId) {
    return <></>;
  }

  // --- KEY CHANGE HERE ---
  // Add a key prop based on TabCheckListId to force remount
  if (TabCheckListId === '0E247A7F-3E54-490A-91F9-8F83816A504C') {
    return <ProjectInformation key={TabCheckListId} serverConfigs={GetAllCategoriesWithChildren?.data?.at(0)} />;
  } else if (TabCheckListId === '81b2b29f-d81e-4540-5fbb-08de6488578c') {
    return <ProjectInfoForm key={TabCheckListId} serverConfigs={tabid} />;
  } else if (TabCheckListId === 'cdb8fae4-e979-4a1e-6e62-08dde5a6bb38') {
    return <StakeholdersTab key={TabCheckListId} serverConfigs={tabid} />;
  } else if (TabCheckListId === '1b3c0be7-cc24-41c6-8534-08dde60e304e') {
    return <ProjectGoalsTab key={TabCheckListId} serverConfigs={tabid} />;
  } else if (TabCheckListId === '342ff61f-bf83-4e2f-8535-08dde60e304e') {
    return <ScheduleManagementTab key={TabCheckListId} serverConfigs={tabid} />;
  } else if (TabCheckListId === 'f9430f3c-dc7f-4d24-8536-08dde60e304e') {
    return <BudgetManagerTab key={TabCheckListId} serverConfigs={tabid} />;
  } else if (TabCheckListId === '3dca9606-4b48-48e6-8537-08dde60e304e') {
    return <DeliverablesStructureTab key={TabCheckListId} serverConfigs={tabid} />;
  } else if (TabCheckListId === '93d401da-270b-4c9c-8538-08dde60e304e') {
    return <RisksConstraintsTab key={TabCheckListId} serverConfigs={tabid} />;
  } else {
    return <DynamicFormComponent key={TabCheckListId} formStructure={tabid} Tabname={Tabname} />;
  }
}
