import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { PageNotFound } from 'pages/PageNotFound/PageNotFound';
import { routes } from 'routes';
import { AxiosInterceptors, BatchTransactionsContextProvider } from 'wrappers';
import { Layout } from './components';

const queryClient = new QueryClient();

export const App = () => {
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
