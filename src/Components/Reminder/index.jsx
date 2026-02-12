export default function Reminder(open) {
  return (
    <div className={`fixed top-12 left-0 w-full bg-white shadow-md z-50 transition-all duration-300 ease-in-out overflow-hidden  ${open ? 'h-[35rem]' : 'h-0'}`}>
      <iframe
        src={`${import.meta.env.DEV ? 'http://test.sazmanyar.org' : window.location.origin}/_layouts/15/Reminder.Sharepoint/dist/index.aspx/`}
        className='w-full h-full rounded-lg border'
      />
    </div>
  );
}
