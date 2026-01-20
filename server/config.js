const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json');

let config = {
  admin: {
    password: 'admin123',
    sessionTimeout: 7200
  },
  accessCode: {
    defaultLength: 12,
    defaultBatchSize: 10
  }
};

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(data);
      console.log('Config loaded from file');
    } else {
      console.log('Config file not found, using defaults');
      saveConfig();
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Config saved to file');
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function getConfig() {
  return config;
}

function updateConfig(newConfig) {
  config = { ...config, ...newConfig };
  saveConfig();
}

loadConfig();

module.exports = { getConfig, updateConfig };
