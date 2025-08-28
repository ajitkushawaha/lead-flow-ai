import { base44Client } from './base44Client.js';

// Export sendSMS function from the client
export const sendSMS = base44Client.functions?.sendSMS || (() => {
  console.warn('sendSMS function not available - client may not be authenticated');
  return Promise.reject(new Error('SMS function not available'));
});

// Export sendWhatsAppMessage function from the client
export const sendWhatsAppMessage = base44Client.functions?.sendWhatsAppMessage || (() => {
  console.warn('sendWhatsAppMessage function not available - client may not be authenticated');
  return Promise.reject(new Error('WhatsApp function not available'));
});

// Export testSMS function from the client
export const testSMS = base44Client.functions?.testSMS || (() => {
  console.warn('testSMS function not available - client may not be authenticated');
  return Promise.reject(new Error('Test SMS function not available'));
});

// Export other functions as needed
export const functions = base44Client.functions || {};