import { useState } from 'react';
import { DappType, useGetHubDapps } from 'api';
import { getLoginToken } from 'helpers';
import {
  Address,
  getAccountProvider,
  Message,
  nativeAuth,
  useGetAccount
} from 'lib';

export const Dashboard = () => {
  const { categories, categoryData, categoriesLoading, isCategoryDataLoading } =
    useGetHubDapps();

  const { address } = useGetAccount();
  const provider = getAccountProvider();

  const [app, setApp] = useState<{ url: string; token: string } | null>(null);

  const onAppClick = async (dapp: DappType) => {
    const origin = new URL(dapp.url).origin;

    const loginToken = await getLoginToken(origin);

    const messageToSign = new Message({
      address: new Address(address),
      data: new Uint8Array(Buffer.from(`${loginToken}`))
    });

    const signedMessageResult = await provider.signMessage(messageToSign);

    const nativeAuthClient = nativeAuth({
      origin,
      expirySeconds: 3600
    });

    const nativeAuthToken = nativeAuthClient.getToken({
      address,
      token: loginToken,
      signature: Buffer.from(signedMessageResult?.signature ?? '').toString(
        'hex'
      )
    });

    setApp({ token: nativeAuthToken, url: origin });
  };

  if (!categories || categoriesLoading || isCategoryDataLoading) {
    return (
      <div className='p-4 text-gray-600'>Loading categories and dapps...</div>
    );
  }

  if (app?.token && app.url) {
    const iframeSourceURL = new URL(app.url);
    iframeSourceURL.searchParams.set('accessToken', app.token);

    const iframeSource = iframeSourceURL.toString();

    const handleClose = () => {
      setApp(null);
    };

    return (
      <div className='flex flex-col h-screen w-full'>
        <div className='flex items-center justify-between bg-gray-100 p-4 shadow-md'>
          <h1 className='text-lg font-semibold text-gray-800'>Dapp Viewer</h1>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-sm font-medium bg-red-500 text-white rounded hover:bg-red-600 transition'
          >
            Close
          </button>
        </div>

        <iframe
          className='flex-1 w-full'
          title={app.url}
          allowFullScreen
          id={app.url}
          name={`${Date.now()}`}
          sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation'
          src={iframeSource}
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-10 max-w-5xl w-full mx-auto p-4'>
      {categories.map((cat, index) => {
        const dapps = categoryData[index];

        return (
          <div key={cat.id} className='flex flex-col gap-4'>
            <h2 className='text-2xl font-semibold capitalize'>{cat.name}</h2>

            {dapps && dapps.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {dapps.map((dapp) => (
                  <button
                    key={dapp.id}
                    onClick={() => onAppClick(dapp)}
                    className='block p-4 border rounded-xl shadow-sm hover:shadow-md transition hover:bg-gray-50'
                  >
                    <div className='flex items-center gap-4'>
                      {dapp.iconUrl && (
                        <img
                          src={dapp.iconUrl}
                          alt={dapp.name}
                          className='w-10 h-10 object-contain'
                        />
                      )}
                      <h3 className='text-lg font-bold'>{dapp.name}</h3>
                    </div>
                    <p className='text-sm text-gray-600 mt-2'>
                      {dapp.description}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-500'>
                No dapps found in this category.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
