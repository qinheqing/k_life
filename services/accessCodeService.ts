const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3004';

interface VerifyResponse {
  valid: boolean;
  used?: boolean;
  message: string;
}

interface UseCodeResponse {
  success: boolean;
  message: string;
}

export async function verifyAccessCode(code: string): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error verifying access code:', error);
    return { valid: false, message: 'Network error. Please try again.' };
  }
}

export async function markCodeAsUsed(code: string, userName: string): Promise<UseCodeResponse> {
  try {
    const userIp = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => 'unknown');

    const response = await fetch(`${BACKEND_URL}/api/use-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, userName, userIp }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error marking code as used:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}
