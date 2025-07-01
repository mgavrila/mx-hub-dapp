import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from 'config';

const fetchHubCategories = async () => {
  const response = await axios.get(
    `${API_URL}/xportal-common-api/api/v1/dapps/categories`,
    { baseURL: API_URL }
  );
  return response.data ?? [];
};

export const useGetHubCategories = () => {
  return useQuery({
    queryKey: ['hubCategories'],
    queryFn: fetchHubCategories
  });
};
