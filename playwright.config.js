const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 60000,
    use: {
        baseURL: 'http://localhost:8888',
        screenshot: 'on',
        viewport: { width: 1280, height: 720 },
    },
    webServer: {
        command: 'python3 -m http.server 8888',
        port: 8888,
        reuseExistingServer: true,
    },
    reporter: [['list'], ['html', { open: 'never' }]],
});
