import React, { useState, useEffect } from 'react';
import { Form, Switch } from 'antd';
import { useEditRequiredFields, useGetRequiredFields } from '../../../../ApiHooks/OtherSetting/EssentialFields';

const RequiredFields = () => {
  const [form] = Form.useForm();
  const { data: requiredFields, refetch: RefetchRequiredFields } = useGetRequiredFields();
  const { mutateAsync: EditRequiredFields } = useEditRequiredFields();
  useEffect(() => {
    if (requiredFields && requiredFields.data) {
      form.setFieldsValue({
        IsRequiredProjectPlace: requiredFields?.data?.IsRequiredProjectPlace,
        IsRequiredProjectGoal: requiredFields?.data?.IsRequiredProjectGoal,
        IsRequiredProjectRequirement: requiredFields?.data?.IsRequiredProjectRequirement,
        IsRequiredProjectCost: requiredFields?.data?.IsRequiredProjectCost,
        IsRequiredSuggestedImplementationMethod: requiredFields?.data?.IsRequiredSuggestedImplementationMethod,
        IsRequiredProjectManager: requiredFields?.data?.IsRequiredProjectManager,
        IsRequiredOrgMember: requiredFields?.data?.IsRequiredOrgMember,
        IsRequiredDeliverable: requiredFields?.data?.IsRequiredDeliverable,
        IsRequiredProjectSchedule: requiredFields?.data?.IsRequiredProjectSchedule,
        IsRequiredProjectRisk: requiredFields?.data?.IsRequiredProjectRisk,
        IsRequiredProjectType: requiredFields?.data?.IsRequiredProjectType,
        IsRequiredProjectPortfolio: requiredFields?.data?.IsRequiredProjectPortfolio,
        IsRequiredGeneralDescription: requiredFields?.data?.IsRequiredGeneralDescription,
        IsRequiredMilestone: requiredFields?.data?.IsRequiredMilestone,
        IsRequiredProjectStakeholder: requiredFields?.data?.IsRequiredProjectStakeholder,
        IsRequiredTrusteeUnit: requiredFields?.data?.IsRequiredTrusteeUnit,
        IsRequiredProjectExitCriterion: requiredFields?.data?.IsRequiredProjectExitCriterion,
        IsRequiredProjectExpert: requiredFields?.data?.IsRequiredProjectExpert,
      });
    }
  }, [requiredFields, form]);

  // const fieldMapping = {
  //   IsRequiredProjectPlace: "مکان پروژه",
  //   IsRequiredProjectGoal: "اهداف پروژه",
  //   IsRequiredProjectRequirement: "الزامات کلی",
  //   IsRequiredProjectCost: "هزینه اجرا پروژه",
  //   IsRequiredSuggestedImplementationMethod: "روش اجرای پیشنهادی پروژه",
  //   IsRequiredProjectManager: "مدیر پروژه",
  //   IsRequiredOrgMember: "چارت اجرایی پروژه",
  //   IsRequiredDeliverable: " اقلام قابل تحویل",
  //   IsRequiredProjectSchedule: "زمان‌بندی کلان اجرای پروژه",
  //   IsRequiredProjectRisk: "ریسک‌های کلی",
  //   IsRequiredProjectType: "نوع پروژه",
  //   IsRequiredProjectPortfolio: "سبد پروژه",
  //   IsRequiredGeneralDescription: "شرح کلی",
  //   IsRequiredMilestone: " مایلستون‌های اصلی",
  //   IsRequiredProjectStakeholder: "ذی‌نفعان کلیدی",
  //   IsRequiredTrusteeUnit: "متولی",
  //   IsRequiredProjectExitCriterion: "معیارهای خروج",
  //   IsRequiredProjectExpert: "کارشناس مسئول پروژه",
  // };
  const handleRequiredField = async (changedValues, allValues) => {
    const formData = {
      IsRequiredProjectPlace: allValues.IsRequiredProjectPlace,
      IsRequiredProjectGoal: allValues.IsRequiredProjectGoal,
      IsRequiredProjectRequirement: allValues.IsRequiredProjectRequirement,
      IsRequiredSuggestedImplementationMethod: allValues.IsRequiredSuggestedImplementationMethod,
      IsRequiredProjectManager: allValues.IsRequiredProjectManager,
      IsRequiredOrgMember: allValues.IsRequiredOrgMember,
      IsRequiredOrgan: allValues.IsRequiredOrgan,
      IsRequiredProjectCost: allValues.IsRequiredProjectCost,
      IsRequiredDeliverable: allValues.IsRequiredDeliverable,
      IsRequiredProjectSchedule: allValues.IsRequiredProjectSchedule,
      IsRequiredProjectRisk: allValues.IsRequiredProjectRisk,
      IsRequiredProjectType: allValues.IsRequiredProjectType,
      IsRequiredProjectPortfolio: allValues.IsRequiredProjectPortfolio,
      IsRequiredGeneralDescription: allValues.IsRequiredGeneralDescription,
      IsRequiredMilestone: allValues.IsRequiredMilestone,
      IsRequiredProjectStakeholder: allValues.IsRequiredProjectStakeholder,
      IsRequiredTrusteeUnit: allValues.IsRequiredTrusteeUnit,
      IsRequiredProjectExitCriterion: allValues.IsRequiredProjectExitCriterion,
      IsRequiredProjectExpert: allValues.IsRequiredProjectExpert,
    };
    try {
      await EditRequiredFields(formData);
      await RefetchRequiredFields();
    } catch (error) {}
  };
  return (
    <Form form={form} onValuesChange={handleRequiredField}>
      <div className='grid grid-cols-3 gap-y-1 gap-x-8 mx-6'>
        {[
          ['مکان پروژه', 'IsRequiredProjectPlace'],
          ['اهداف پروژه', 'IsRequiredProjectGoal'],
          ['الزامات کلی', 'IsRequiredProjectRequirement'],
          ['هزینه اجرای پروژه', 'IsRequiredProjectCost'],
          ['روش اجرای پیشنهادی پروژه', 'IsRequiredSuggestedImplementationMethod'],
          ['مدیر پروژه', 'IsRequiredProjectManager'],
          ['چارت اجرایی پروژه', 'IsRequiredOrgMember'],
          ['اقلام قابل تحویل', 'IsRequiredDeliverable'],
          ['ریسک‌های کلی', 'IsRequiredProjectRisk'],
          ['نوع پروژه', 'IsRequiredProjectType'],
          ['مایلستون‌های اصلی', 'IsRequiredMilestone'],
          ['معیارهای خروج', 'IsRequiredProjectExitCriterion'],
          ['کارشناس مسئول پروژه', 'IsRequiredProjectExpert'],
          ['زمان‌بندی کلان اجرای پروژه', 'IsRequiredProjectSchedule'],
          ['سبد پروژه', 'IsRequiredProjectPortfolio'],
          ['شرح کلی', 'IsRequiredGeneralDescription'],
          ['متولی', 'IsRequiredTrusteeUnit'],
          ['ذی‌نفعان کلیدی', 'IsRequiredProjectStakeholder'],
        ].map(([label, name]) => (
          <div key={name} className='flex items-center'>
            <span className='w-1/2 text-right whitespace-nowrap'>{label}</span>
            <Form.Item name={name} className='mb-0 w-1/2 flex justify-center'>
              <Switch
                checkedChildren='ضروری'
                unCheckedChildren='غیر ضروری'
                //defaultChecked
              />
            </Form.Item>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default RequiredFields;
