import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Final_scripts',
  timeout: 30000,
  use: {
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
 // reporter: [['html', { open: 'on-failure' }]],

});


