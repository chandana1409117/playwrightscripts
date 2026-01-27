import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Final_scripts',
  testMatch: /.*\.(spec|test|setup)\.(ts|js)/,
  timeout: 30000,
  use: {
    screenshot: 'on',
    trace: 'retain-on-failure',
    storageState: ''
  },
  
});


