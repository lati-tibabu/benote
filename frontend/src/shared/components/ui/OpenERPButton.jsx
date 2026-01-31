import React from 'react';

import { triggerOdooSSO } from '../../../services/ssoService';

const OpenERPButton = ({ collapsed }) => {
  const handleClick = async () => {
    const apiEndpoint = import.meta.env.VITE_ODOO_API_ENDPOINT;
    const targetBaseUrl = import.meta.env.VITE_ODOO_TARGET_BASE_URL;
    const authToken = localStorage.getItem('jwt'); // or however you store the token

    await triggerOdooSSO(apiEndpoint, targetBaseUrl, authToken);
  };

  return <button onClick={handleClick}>{collapsed ? "" : "ERP System"}</button>;
};

export default OpenERPButton;
