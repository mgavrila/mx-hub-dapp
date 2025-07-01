import { nativeAuth } from 'lib';

export const getLoginToken = async (origin?: string) => {
  const auth = nativeAuth({ origin });

  const loginToken = await auth.initialize({
    noCache: true
  });

  return loginToken;
};
