import React, { useState, useEffect } from 'react';
import { useEditProposalGlobalTitle, useGetProposalGlobalTitle } from '../../../../ApiHooks/OtherSetting/ProposalGlobalTitle';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
const GlobalTitle = () => {
  const [globalTitle, setGlobalTitle] = useState('');
  const [id, setId] = useState('');
  const tokenAuth = useSelector((state) => state.Auth?.token);
  const { data: GetProposalGlobalTitle, refetch: refetchGetProposalGlobalTitle } = useGetProposalGlobalTitle(tokenAuth);
  const { mutate: EditProposalGlobalTitle } = useEditProposalGlobalTitle();

  useEffect(() => {
    if (GetProposalGlobalTitle) {
      setId(GetProposalGlobalTitle.data[0].Id);
      setGlobalTitle(GetProposalGlobalTitle.data[0].GlobalTitle);
    }
  }, [GetProposalGlobalTitle]);

  const handleSave = async () => {
    EditProposalGlobalTitle(
      {
        Id: id,
        GlobalTitle: globalTitle,
      },
      {
        onSuccess: () => {
          refetchGetProposalGlobalTitle();
          toast.success('با موفقیت بروزرسانی شد.');
        },
      },
    );
  };

  return (
    <div className='flex gap-2 items-center'>
      <Toaster
        position='top-center'
        toastOptions={{
          duration: 4000,
        }}
      />

      <label htmlFor='global-title'>عنوان عمومی وبسایت :</label>
      <input
        id='global-title'
        type='text'
        value={globalTitle}
        onChange={(e) => setGlobalTitle(e.target.value)}
        className='ring-1 ring-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      />
      <button
        onClick={handleSave}
        className='bg-blue-500 rounded-md px-4 py-1 hover:cursor-pointer hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-none text-white'
      >
        تایید
      </button>
    </div>
  );
};

export default GlobalTitle;
