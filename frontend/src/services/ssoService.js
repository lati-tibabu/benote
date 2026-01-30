import { useSSO } from '@benote/sso-frontend';

/**
 * Trigger SSO redirect to a target application.
 *
 * @param {string} apiEndpoint - Your backend SSO API endpoint
 * @param {string} targetBaseUrl - The target application's base URL
 * @param {string} authToken - JWT or session token
 */
export const triggerOdooSSO = async (apiEndpoint, targetBaseUrl, authToken) => {
  const { triggerSSO } = useSSO(); // hook provided by your package
  await triggerSSO(apiEndpoint, targetBaseUrl, authToken);
};
