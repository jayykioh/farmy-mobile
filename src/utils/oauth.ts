import * as Linking from 'expo-linking';

type QueryValue = string | string[] | undefined | null;

const firstString = (value: QueryValue) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export const getAccessTokenFromUrl = (url: string) => {
  const { queryParams } = Linking.parse(url);
  const queryToken =
    firstString(queryParams?.accessToken) ??
    firstString(queryParams?.access_token) ??
    firstString(queryParams?.token);

  if (queryToken) return queryToken;

  const hash = url.split('#')[1];
  if (!hash) return null;

  const hashParams = new URLSearchParams(hash);
  return (
    hashParams.get('accessToken') ??
    hashParams.get('access_token') ??
    hashParams.get('token')
  );
};
