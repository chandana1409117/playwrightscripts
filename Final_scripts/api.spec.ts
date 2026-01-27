import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Read auth state to extract token
const authStatePath = path.join(__dirname, '..', 'authState.json');
const authState = JSON.parse(fs.readFileSync(authStatePath, 'utf-8'));

// Extract ACCESS_TOKEN from localStorage
const accessToken = authState.origins?.[0]?.localStorage?.find(
  (item: { name: string }) => item.name === 'ACCESS_TOKEN'
)?.value;

test('GET patients API', async ({ request }) => {
  const response = await request.get(
    'https://arbmdmmanage-ui.azurewebsites.net/mdm-patient-service/patients/search-patients-prac-ins?page=0&size=50',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  expect(response.status()).toBe(200);

  const data = await response.json();
  console.log(data);
});

