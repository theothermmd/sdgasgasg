import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import MainLayout from './Layout/MainLayout';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ServerCrash } from 'lucide-react'
import { Collapse } from 'antd';
const Main = lazy(() => import('./Components/MainProposal'));
const OtherSettingPage = lazy(() => import('./pages/OtherSettingPage'));
const AccessGroupPage = lazy(() => import('./pages/AccessGroupPage'));
const FormGenerator = lazy(() => import('./pages/FormGenerator'));
const FormDetails = lazy(() => import('./pages/FormDetails'));
const Form = lazy(() => import('./pages/Form'));
const Forbidan = lazy(() => import('./pages/forbidan'));
const appVersion = import.meta.env.PACKAGE_VERSION;
const mainUrl = import.meta.env.VITE_MAIN_URL;

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className='fixed inset-0 bg-gradient-to-tr from-slate-50 to-neutral-200 grid place-items-center'>
    <p className=' fixed right-4 bottom-4 ring-1 ring-gray-300 shadow-md bg-gray-200 rounded-2xl px-2 py-1'>نسخه {appVersion || 'نامشخص'}</p>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex flex-col items-center gap-4 mb-10'>
        <ServerCrash color='#F63049' size={160} />
        <h1 className='text-4xl'>خطایی رخ داده است</h1>
      </div>
      <Collapse
        className='min-w-78'
        items={[{
          key: '1',
          label: 'اطلاعات بیشتر :',
          children: <p className='bg-red-500 rounded-full px-3 py-2 text-white mt-4'>{error.message}</p>,
        },]} />

      <button onClick={(resetErrorBoundary)} className='bg-gray-200 rounded-md ring-1 ring-gray-200 text-gray-800 px-2 py-1 hover:bg-gray-300 hover:scale-110 transition-all hover:cursor-pointer mt-4 text-2xl'>تلاش مجدد</button>
    </div>

  </div>
);

const LoadingFallback = () => <div style={{ padding: 20, textAlign: 'center' }}>در حال بارگذاری...</div>;

const ProtectedRoute = ({ children, hasAccess }) => {
  return hasAccess ? children : <Navigate to='/forbidan' replace />;
};

function App() {
  const Permissions = useSelector((state) => state.Auth?.permissionsections);
  const routes = [
    { path: '/', element: <Main />, protected: false },
    { path: '/main', element: <Main />, protected: false },
    {
      path: '/otherSetting',
      element: <OtherSettingPage />,
      protected: true,
      access: Permissions?.AccessToBaseSettings,
    },
    {
      path: '/accessGroup',
      element: <AccessGroupPage />,
      protected: true,
      access: Permissions?.AccessToBaseSettings,
    },
    {
      path: '/formGenerator',
      element: <FormGenerator />,
      protected: true,
      access: true,
    },
    {
      path: '/formDetails',
      element: <FormDetails />,
      protected: true,
      access: true,
    },
    { path: '/RcrSABYwQYwmdtcOTsJmxYbIhMOEnwOt', element: <FormGenerator />, protected: false },
    { path: '/create-form', element: <Form />, protected: false },
    { path: '/forbidan', element: <Forbidan />, protected: false },
  ];
  return (
    <BrowserRouter basename={mainUrl}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.protected ? <ProtectedRoute hasAccess={route.access}>{route.element}</ProtectedRoute> : route.element} />
              ))}
            </Routes>
          </Suspense>
        </MainLayout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
