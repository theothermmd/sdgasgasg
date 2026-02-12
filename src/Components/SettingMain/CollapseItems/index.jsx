import React from 'react';
import ProjectType from '../OtherSetting/ProjectType';
import ProjectPortfolio from '../OtherSetting/ProjectPortfolio';
import LocationType from '../OtherSetting/LocationType';
import ProposedImplementation from '../OtherSetting/ProposedImplementation';
import ProjectRevenueForecast from '../OtherSetting/ProjectRevenueForecast';
import ProjectSponsor from '../OtherSetting/ProjectSponsor';
import Province from '../OtherSetting/Province';
import CurrencySelector from '../OtherSetting/Currency';
import ProjectGoalUnit from '../OtherSetting/ProjectGoalUnit';
import ConnectionType from '../OtherSetting/ConnectionType';
import StakeholderType from '../OtherSetting/StakeholderType';
import ProjectExitType from '../OtherSetting/ProjectExitType';
import StrategicImportance from '../OtherSetting/StrategicImportance';
import ProductUnit from '../OtherSetting/ProductUnit';
import ResponsibleCompanies from '../OtherSetting/ExternalCompanies';
import RequiredFields from '../OtherSetting/EssentialFields';
import DocumentType from '../OtherSetting/DocumentType';
import InfluenceScale from '../OtherSetting/InfluenceScale';
import InterestScale from '../OtherSetting/InterestScale';
import RiskCategory from '../OtherSetting/RiskCategory';
import RiskImpactSeverity from '../OtherSetting/RiskImpactSeverity/idex';
import LookUpTable from '../OtherSetting/LookUpTable';
import TrusteeUnit from '../OtherSetting/TrusteeUnit';

export const OtherSettingsOption = () => [
  {
    key: '1',
    label: <span className='text-blue-600'>نوع پروژه</span>,
    children: <ProjectType />,
  },
  {
    key: '2',
    label: <span className='text-blue-600'> سبد طراحی/پروژه</span>,
    children: <ProjectPortfolio />,
  },
  // {
  //   key: "3",
  //   label: <span className="text-blue-600">حامی پروژه</span> ,
  //   children: <ProjectManager />,
  // },
  // {
  //   key: "4",
  //   label:  <span className="text-blue-600">کارشناس مسئول پروژه </span>,
  //   children: <ProjectSpecialist />,
  // },
  {
    key: '5',
    label: <span className='text-blue-600'>نوع مکان</span>,
    children: <LocationType />,
  },
  {
    key: '6',
    label: <span className='text-blue-600'>روش اجرای پیشنهادی</span>,
    children: <ProposedImplementation />,
  },
  {
    key: '7',
    label: <span className='text-blue-600'>پیش بینی و برآورد درآمد پروژه ها</span>,
    children: <ProjectRevenueForecast />,
  },
  {
    key: '8',
    label: <span className='text-blue-600'> استان </span>,
    children: <Province />,
  },
  {
    key: '9',
    label: <span className='text-blue-600'>واحد پولی</span>,
    children: <CurrencySelector />,
  },
  {
    key: '10',
    label: <span className='text-blue-600'>واحد اهداف پروژه</span>,
    children: <ProjectGoalUnit />,
  },
  {
    key: '11',
    label: <span className='text-blue-600'>نوع ارتباط</span>,
    children: <ConnectionType />,
  },
  {
    key: '12',
    label: <span className='text-blue-600'>نوع ذینفع</span>,
    children: <StakeholderType />,
  },
  {
    key: '13',
    label: <span className='text-blue-600'>نوع خروج پروژه</span>,
    children: <ProjectExitType />,
  },
  {
    key: '14',
    label: <span className='text-blue-600'>میزان تاثیر گذاری</span>,
    children: <InfluenceScale />,
  },
  {
    key: '15',
    label: <span className='text-blue-600'>میزان علاقه‌مندی </span>,
    children: <InterestScale />,
  },
  {
    key: '16',
    label: <span className='text-blue-600'>حامی پروژه</span>,
    children: <ProjectSponsor />,
  },
  {
    key: '17',
    label: <span className='text-blue-600'> طبقه‌بندی ریسک</span>,
    children: <RiskCategory />,
  },
  // {
  //   key: "17",
  //   label: <span className="text-blue-600">روش تامین مالی</span> ,
  //   children: <FinanceMethod />,
  // },
  {
    key: '18',
    label: <span className='text-blue-600'>پیش بینی شدت اثر </span>,
    children: <RiskImpactSeverity />,
  },
  {
    key: '19',
    label: <span className='text-blue-600'>شرکت ها خارج سازمان</span>,
    children: <ResponsibleCompanies />,
  },
  {
    key: '20',
    label: <span className='text-blue-600'>فیلد های ضروری</span>,
    children: <RequiredFields />,
  },
  {
    key: '21',
    label: <span className='text-blue-600'> جدول مراجعه ای </span>,
    children: <LookUpTable />,
  },
  {
    key: '22',
    label: <span className='text-blue-600'>واحد سازمانی</span>,
    children: <TrusteeUnit />,
  },
];
