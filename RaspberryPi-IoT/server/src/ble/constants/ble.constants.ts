export const BLE_CONSTANTS = {
  SCAN_TIMEOUT_MS: 60000,
  SCAN_TIMEOUT_SECONDS: 60,
} as const;

export const BLE_MESSAGES = {
  SCANNING_STARTED: 'Scanning started for 60 seconds',
  SCANNING_ALREADY_IN_PROGRESS: 'Scanning already in progress',
  DEVICE_NOT_FOUND: 'Device not found',
  NO_DEVICE_CONNECTED: 'No device connected',
  CONNECTED_TO_DEVICE: 'Connected to device',
  FAILED_TO_CONNECT: 'Failed to connect to device',
  FAILED_TO_DISCOVER: 'Failed to discover services/characteristics',
  CHARACTERISTIC_NOT_FOUND: 'Characteristic not found',
  FAILED_TO_READ: 'Failed to read characteristic',
  BLE_POWERED_ON: 'BLE powered on. Ready to scan.',
  BLE_NOT_POWERED_ON: 'BLE not powered on. Stopping scan.',
  SCANNING_STOPPED_AUTO: 'Scanning stopped automatically after 60 seconds.',
} as const;
