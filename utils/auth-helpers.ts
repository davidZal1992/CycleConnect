import { ProfileCreationData } from '@/types/profile';

/**
 * Decode JWT token to extract user information
 * In a real app, you'd use a proper JWT library
 */
export function decodeToken(token: string): any {
  try {
    // First, let's log the token format for debugging
    console.log('Attempting to decode token:', token.substring(0, 50) + '...');
    
    // URL decode the token first in case it's encoded
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
    } catch (e) {
      // If decoding fails, use original token
      decodedToken = token;
    }
    
    // Check if token has the right format (3 parts separated by dots)
    const parts = decodedToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format - not a JWT. Parts:', parts.length);
      console.error('Token preview:', decodedToken.substring(0, 100));
      return null;
    }

    const base64Url = parts[1];
    if (!base64Url) {
      console.error('Invalid token - missing payload');
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    console.log('Successfully decoded token payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    console.error('Token that failed:', token.substring(0, 100) + '...');
    return null;
  }
}

/**
 * Extract email from Auth0 token
 */
export function getEmailFromToken(token: string): string {
  try {
    const decoded = decodeToken(token);
    if (decoded) {
      // Try different possible email fields
      const email = decoded.email || decoded.sub || decoded.preferred_username || '';
      console.log('Extracted email from token:', email);
      return email;
    }
    console.log('Could not decode token to extract email');
    return '';
  } catch (error) {
    console.error('Error extracting email from token:', error);
    return '';
  }
}

/**
 * Check if user has completed their profile
 * In a real app, this would make an API call to your backend
 */
export async function hasCompletedProfile(token: string): Promise<boolean> {
  try {
    // TODO: Replace with actual API call to your backend
    // const response = await fetch(`${API_BASE_URL}/user/profile`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.ok;
    
    // For now, always return false to force profile creation
    return false;
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

/**
 * Submit profile data to backend
 */
export async function submitProfile(profileData: ProfileCreationData, token: string): Promise<boolean> {
  try {
    // TODO: Replace with actual API call to your backend
    // const response = await fetch(`${API_BASE_URL}/user/profile`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`
    //   },
    //   body: JSON.stringify(profileData)
    // });
    // return response.ok;
    
    console.log('Profile data to submit:', profileData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error submitting profile:', error);
    return false;
  }
} 