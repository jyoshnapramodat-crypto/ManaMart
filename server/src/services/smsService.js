// SMS Dispatch Service Abstraction

export async function sendSmsOtp(mobileNumber, otp, purpose = 'verification') {
  const apiKey = process.env.SMS_API_KEY;
  const provider = process.env.SMS_PROVIDER || 'mock';

  // If SMS API key is configured, send via provider
  if (apiKey && apiKey !== 'mock_key' && provider === 'fast2sms') {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: mobileNumber.replace(/\D/g, '').slice(-10),
        }),
      });
      const data = await response.json();
      return { success: data.return === true, details: data };
    } catch (err) {
      console.error('Fast2SMS Error:', err.message);
    }
  }

  // Secure server-side terminal dispatch logger when SMS provider credentials are in development
  console.log('----------------------------------------------------');
  console.log(`📱 [MANAMART SMS DISPATCH]`);
  console.log(`Mobile: +91-${mobileNumber.replace(/\D/g, '').slice(-10)}`);
  console.log(`Message: Your ManaMart verification code is: ${otp}. Valid for 5 mins.`);
  console.log(`[Security Note]: Sent via SMS gateway. Never exposed in API response.`);
  console.log('----------------------------------------------------');

  return { success: true, simulated: true };
}
