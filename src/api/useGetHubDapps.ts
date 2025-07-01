import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from 'config';

export type DappType = {
  id: number;
  name: string;
  description: string;
  order: number;
  iconUrl: string;
  url: string;
  categoryId: number;
  categoryName: string;
  termsAndConditions: string;
  chainIds: number[];
  providers: string[];
  providersInfo: {
    type: string;
  }[];
};

type Category = {
  id: number;
  name: string;
  order: number;
};

const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get(
    `${API_URL}/xportal-common-api/api/v1/dapps/categories`,
    {
      baseURL: API_URL
    }
  );
  return res.data ?? [];
};

const fetchCategoryData = async (id: number): Promise<DappType[]> => {
  const res = await axios.get(
    `${API_URL}/xportal-common-api/api/v1/dapps/category/${id}`,
    {
      baseURL: API_URL
    }
  );
  return res.data ?? [];
};

export const useGetHubDapps = () => {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj
  } = useQuery<Category[], Error>({
    queryKey: ['hubCategories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5
  });

  const categoryDataQueries = useQueries<UseQueryResult<DappType[]>[]>({
    queries:
      categories?.map((category) => ({
        queryKey: ['categoryData', category.id],
        queryFn: () => fetchCategoryData(category.id),
        staleTime: 1000 * 60 * 5,
        enabled: !!categories
      })) || []
  });

  const isCategoryDataLoading = categoryDataQueries.some((q) => q.isLoading);
  const isCategoryDataError = categoryDataQueries.some((q) => q.isError);
  const categoryDataErrors = categoryDataQueries
    .filter((q) => q.isError)
    .map((q) => q.error);

  return {
    categories,
    categoriesLoading,
    categoriesError,
    categoriesErrorObj,
    categoryData: categoryDataQueries.map((q) => q.data),
    isCategoryDataLoading,
    isCategoryDataError,
    categoryDataErrors
  };
};
