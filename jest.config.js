// jest.config.js
module.exports = {
  testEnvironment: 'jsdom', // ← สำคัญ
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // เพื่อเตรียม environment
  moduleNameMapper: {
    // สำหรับ import CSS/ภาพ (optional)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
