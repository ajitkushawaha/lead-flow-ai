import { base44Client } from './base44Client.js';

// Export sendSMS function from the client
export const sendSMS = base44Client.functions?.sendSMS || (() => {
  console.warn('sendSMS function not available - client may not be authenticated');
  return Promise.reject(new Error('SMS function not available'));
});

// Export other functions as needed
export const functions = base44Client.functions || {};