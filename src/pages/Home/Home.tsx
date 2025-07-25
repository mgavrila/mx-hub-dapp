import { Outlet } from 'react-router-dom';
import { PageWrapper } from 'wrappers';

export const Home = () => {
  return (
    <PageWrapper>
      <div className='flex flex-col-reverse sm:flex-row items-center h-full w-full'>
        <div className='flex items-start sm:items-center h-full sm:w-1/2 sm:bg-center'>
          <div className='flex flex-col gap-2 max-w-[70sch] text-center sm:text-left text-xl font-medium md:text-2xl lg:text-3xl'>
            <div>
              <h1>Hub dApp</h1>
            </div>
          </div>
        </div>
        <div className='h-4/6 bg-mvx-white bg-contain bg-no-repeat w-1/2 bg-center' />
        <Outlet />
      </div>
    </PageWrapper>
  );
};
