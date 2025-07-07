import { WebviewClient } from '@multiversx/sdk-dapp/out/providers/strategies/WebviewProviderStrategy/WebviewClient';
import { useEffect, useState } from 'react';
import { DappType, useGetHubDapps } from 'api';

const isIframe = window.self !== window.top;

type HubDataType = {
  groupedCategoryData: any[];
};

export const Dashboard = () => {
  const { groupedCategoryData } = useGetHubDapps({ enabled: !isIframe });

  const [app, setApp] = useState<{ url: string } | null>(null);
  const [exploreURL, setExploreURL] = useState('');

  const [hubData, setHubData] = useState<HubDataType | null>(null);

  useEffect(() => {
    if (isIframe) {
      window.parent.postMessage(
        { type: 'HUB_DATA_REQUEST' },
        'https://localhost:3002'
      );
    }

    const webviewClient = new WebviewClient({
      onLoginCancelled: async () => {
        setApp(null);
      }
    });
    webviewClient.registerEvent('HUB_DATA_RESPONSE', (event) => {
      const { groupedHubApplications } = event.data.payload;
      setHubData({ groupedCategoryData: groupedHubApplications });
    });

    webviewClient.startListening();

    return () => {
      webviewClient.stopListening();
    };
  }, []);

  const onAppClick = async (dapp: DappType) => {
    signToken(dapp.url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExploreURL(e.target.value);
  };

  const signToken = async (url: string) => {
    const origin = new URL(url).origin;

    setApp({ url: origin });
  };

  const onExplore = async () => {
    signToken(exploreURL);
  };

  const dappData = isIframe
    ? hubData?.groupedCategoryData ?? []
    : groupedCategoryData ?? [];

  if (!dappData) {
    return (
      <div className='p-4 text-gray-600'>Loading categories and dapps...</div>
    );
  }

  if (app?.url) {
    const iframeSourceURL = new URL(app.url);

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
      <div className='flex gap-2 items-center'>
        <input
          type='text'
          placeholder='Enter the URL of any dApp'
          onChange={handleInputChange}
          value={exploreURL}
          className='w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          className='px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors'
          onClick={onExplore}
        >
          Explore
        </button>
      </div>
      {Object.entries(dappData).map(([categoryKey, dapps]) => {
        // categoryKey is like "1_multiversx"
        // split it if you want to show category name separately
        const categoryName = categoryKey.split('_').slice(1).join('_');

        return (
          <div key={categoryKey} className='flex flex-col gap-4'>
            <h2 className='text-2xl font-semibold capitalize'>
              {categoryName}
            </h2>

            {dapps && dapps.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {dapps.map((dapp: DappType) => (
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
