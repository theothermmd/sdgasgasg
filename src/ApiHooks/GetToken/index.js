import axios from 'axios';

import { useQuery, useMutation } from '@tanstack/react-query';

export const GetTokenUser = (userName, moduleName, tokenAuth) =>
  useQuery({
    enabled: !Boolean(tokenAuth),
    queryKey: ['TokenUser_key'],
    queryFn: async () =>
      await axios.get(
        `http://192.168.100.171:85/api/Generic/Token/GetToken?UserName=${userName}&Module=${moduleName} `,
        //`http://192.168.100.171:85/api/Generic/Token/GetToken?UserName=${userName}&Module=${moduleName} `
      ),
  });
