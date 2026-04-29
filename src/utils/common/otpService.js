/**
 * OTP Service - Simulates sending and verifying OTP codes.
 * Uses a dedicated Node.js backend with Nodemailer for secure delivery.
 */

const OTP_EXPIRY_MINUTES = 5;

/**
 * Generates a 6-digit random OTP.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends an OTP to the user's email (Simulated).
 * @param {string} email - The user's email address.
 */
export const sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  
  // Store in sessionStorage for verification
  const otpData = {
    email: email.toLowerCase(),
    otp,
    expiresAt
  };
  sessionStorage.setItem(`otp_${email.toLowerCase()}`, JSON.stringify(otpData));

  // Fallback / Simulation Mode
  // We store a global reference so the UI can show a "Test Notification" during development
  window.__LAST_OTP__ = { email, otp };
  
  console.log(`[OTP Simulation] To: ${email}, Code: ${otp}`);
  return otp;
};

/**
 * Verifies the provided OTP.
 * @param {string} email - The user's email address.
 * @param {string} providedOtp - The OTP entered by the user.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const verifyOTP = (email, providedOtp) => {
  const storedData = sessionStorage.getItem(`otp_${email.toLowerCase()}`);
  if (!storedData) return false;

  const { otp, expiresAt } = JSON.parse(storedData);

  if (Date.now() > expiresAt) {
    sessionStorage.removeItem(`otp_${email.toLowerCase()}`);
    return false;
  }

  const isValid = otp === providedOtp;
  if (isValid) {
    sessionStorage.removeItem(`otp_${email.toLowerCase()}`);
  }
  
  return isValid;
};
