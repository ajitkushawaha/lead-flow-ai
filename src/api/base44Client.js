import * as Base44 from "@base44/sdk";

// Initialize the Base44 client
export const base44Client = new Base44({
  appId: '68a34f59ba6831bb25112d13',
  // Add any other required configuration
});

// Handle authentication state
let isInitialized = false;

export const initializeClient = async () => {
  if (isInitialized) return base44Client;
  
  try {
    // Check if user is already authenticated
    const isAuth = await base44Client.auth.isAuthenticated();
    if (!isAuth) {
      console.log('User not authenticated - authentication required');
      // You may want to redirect to login or show login form here
    }
    isInitialized = true;
    return base44Client;
  } catch (error) {
    console.error('Failed to initialize Base44 client:', error);
    // Handle authentication error gracefully
    return base44Client;
  }
};

// Initialize on module load
initializeClient().catch(console.error);