import { PropsWithChildren, useEffect } from 'react';
import { sampleAuthenticatedDomains } from 'config';
import { setAxiosInterceptors, useGetLoginInfo } from 'lib';

export const AxiosInterceptors = ({ children }: PropsWithChildren) => {
  const { tokenLogin } = useGetLoginInfo();

  useEffect(() => {
    console.log('setting interceptors', tokenLogin, sampleAuthenticatedDomains);
    setAxiosInterceptors({
      authenticatedDomains: sampleAuthenticatedDomains,
      bearerToken: tokenLogin?.nativeAuthToken
    });
  }, [tokenLogin?.nativeAuthToken]);

  return <>{children}</>;
};
