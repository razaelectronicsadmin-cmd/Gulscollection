/**
 * Server-side Google reCAPTCHA Verification Helper
 */
export async function verifyCaptcha(
  token: string | null | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // If secret key is not set (e.g. in development), allow gracefully with warning
  if (!secretKey) {
    console.warn('[Captcha] RECAPTCHA_SECRET_KEY is not defined in environment variables. Bypassing check.');
    return { success: true };
  }

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      error: 'Please complete the security Captcha verification.',
    };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token.trim(),
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    }

    console.warn('[Captcha] Verification failed from Google API:', data);
    return {
      success: false,
      error: 'Captcha verification failed. Please check the checkbox again.',
    };
  } catch (error: any) {
    console.error('[Captcha] Verification Network Error:', error);
    return {
      success: false,
      error: 'Failed to verify Captcha due to network error.',
    };
  }
}

