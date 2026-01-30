import React from 'react';

import { triggerOdooSSO } from '../../../services/ssoService';

const OpenERPButton = () => {
  const handleClick = async () => {
    const apiEndpoint = 'http://localhost:3060/api/auth/sso/odoo';
    const targetBaseUrl = 'http://localhost:8070'; // Odoo instance URL
    const authToken = localStorage.getItem('jwt'); // or however you store the token

    await triggerOdooSSO(apiEndpoint, targetBaseUrl, authToken);
  };

  return <button onClick={handleClick}>Go to Odoo</button>;
};

export default OpenERPButton;
