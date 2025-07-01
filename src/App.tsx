import { safeWindow } from '@multiversx/sdk-dapp';
import { WindowProviderResponseEnums } from '@multiversx/sdk-web-wallet-cross-window-provider/out/enums';
import { RequestMessageType } from '@multiversx/sdk-web-wallet-cross-window-provider/out/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { PageNotFound } from 'pages/PageNotFound/PageNotFound';
import { routes } from 'routes';
import { AxiosInterceptors, BatchTransactionsContextProvider } from 'wrappers';
import { Layout } from './components';
import { replyWithPostMessage } from './helpers/replyToDapp';

const queryClient = new QueryClient();

export const App = () => {
  const messageListener = async (event: MessageEvent<RequestMessageType>) => {
    const { type, payload } = event.data;

    console.log({ payload });
    replyWithPostMessage({
      postMessageData: {
        type: WindowProviderResponseEnums.finalizeHandshakeResponse,
        payload: { data: Date.now().toString() }
      },
      target: safeWindow?.opener ?? safeWindow?.parent
    });

    switch (type) {
      default:
        break;
    }
  };

  useEffect(() => {
    console.log('adding listener');
    window.addEventListener('message', messageListener);
  }, []);

  return (
    <AxiosInterceptors>
      <QueryClientProvider client={queryClient}>
        <Router>
          <BatchTransactionsContextProvider>
            <Layout>
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={`route-key-${route.path}`}
                    path={route.path}
                    element={<route.component />}
                  >
                    {route.children?.map((child) => (
                      <Route
                        key={`route-key-${route.path}-${child.path}`}
                        path={child.path}
                        element={<child.component />}
                      />
                    ))}
                  </Route>
                ))}
                <Route path='*' element={<PageNotFound />} />
              </Routes>
            </Layout>
          </BatchTransactionsContextProvider>
        </Router>
      </QueryClientProvider>
    </AxiosInterceptors>
  );
};
