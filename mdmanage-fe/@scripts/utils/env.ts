export const getBaseUrl = (): string => process.env.BASE_URL || 'http://mdmw.unisoftllc.com';

export const getApiToken = (): string | undefined => process.env.API_TOKEN || process.env.PLAYWRIGHT_API_TOKEN;

export const getTestUser = () => ({
  email: process.env.TEST_USER_EMAIL || 'kumar',
  password: process.env.TEST_USER_PASSWORD || 'Test@123',
});

export const getResetTokenFile = (): string | undefined => process.env.RESET_TOKEN_FILE;

export const getProvidedResetToken = (): string | undefined => process.env.RESET_TOKEN;



