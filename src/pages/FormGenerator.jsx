import FormGeneratorFormsother from '../Components/SettingMain/OtherSetting/FormGenerator/FormGeneratorFormsother';
import FormGeneratorFormssazmanyar from '../Components/SettingMain/OtherSetting/FormGenerator/FormGeneratorFormssazmanyar';

import { useLocation } from 'react-router-dom';

export default function FormGenerator() {
  const { pathname } = useLocation();
  if (pathname === '/FormGenerator') {
    return <FormGeneratorFormsother />;
  } else {
    return <FormGeneratorFormssazmanyar />;
  }
}
