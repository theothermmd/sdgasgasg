import axios from 'axios';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const useApiClient = () => {
  const { api, token } = useSelector((state) => state.Auth);

  useEffect(() => {
    apiClient.defaults.baseURL = api || '';
    apiClient.defaults.headers.Authorization = token ? `Bearer ${token}` : undefined;
  }, [api, token]);

  return apiClient;
};

export default useApiClient;
