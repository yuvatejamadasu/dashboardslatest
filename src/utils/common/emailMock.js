import { sendStaticEmail } from '@/services/common/staticEmailService';

/**
 * CLIENT-SIDE OTP STORE
 * Simulates the backend in-memory storage for OTPs.
 */
const clientOtpStore = {};

/**
 * Sends a static approval email.
 * Called by handleApprove() in Home.jsx — signature unchanged.
 */
export const sendApprovalEmail = async (user) => {
  console.log("🛠️ [SIMULATION] sendApprovalEmail called for:", user.email);
  return await sendStaticEmail('approval', user.fullName || user.adminName || user.name || "Admin", user.email);
};

/**
 * Sends a static rejection email.
 * Called by handleReject() in Home.jsx — signature unchanged.
 */
export const sendRejectionEmail = async (user) => {
  console.log("🛠️ [SIMULATION] sendRejectionEmail called for:", user.email);
  return await sendStaticEmail('rejection', user.fullName || user.adminName || user.name || "Applicant", user.email);
};

/**
 * Sends a direct account creation email for Super Admin actions.
 */
export const sendDirectCreationEmail = async (user) => {
  console.log("🛠️ [SIMULATION] sendDirectCreationEmail called for:", user.email);
  return await sendStaticEmail('welcome', user.fullName || user.hubName || user.name || "Admin", user.email);
};

/**
 * Notifies Super Admin about a new Store Account request created by Hub Admin.
 */
export const sendStoreRequestToSuperEmail = async (user) => {
  console.log("🛠️ [SIMULATION] sendStoreRequestToSuperEmail called for Store:", user.storeName);
  // Simulating an admin notification
  return await sendStaticEmail('approval', 'Super Admin', 'admin@primebasket.com', {
    message: `New store request from ${user.storeName} (${user.email || 'N/A'}) needs review.`
  });
};

/**
 * Notifies Store user that their account has been approved by Super Admin.
 */
export const sendStoreApprovedEmail = async (user) => {
  console.log("🛠️ [SIMULATION] sendStoreApprovedEmail called for:", user.email);
  return await sendStaticEmail('approval', user.fullName || user.storeName || "Store Admin", user.email);
};

/**
 * Request backend to generate and send an OTP (NOW SIMULATED ON CLIENT)
 */
export const sendOTPEmail = async (email) => {
  console.log("🛠️ [SIMULATION] sendOTPEmail called for:", email);
  
  // Using a fixed OTP '123456' for simulation ease, or can be random.
  const otp = "123456"; 
  
  clientOtpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  console.log(`%c[DEV SIMULATION] OTP for ${email}: ${otp}`, "color: #ff9800; font-weight: bold; border: 1px solid #ff9800; padding: 2px 4px; border-radius: 4px;");

  return await sendStaticEmail('otp', 'User', email, { otp });
};

/**
 * Verify an OTP with the backend (NOW SIMULATED ON CLIENT)
 */
export const verifyOTP = async (email, otp) => {
  console.log("🛠️ [SIMULATION] verifyOTP called for:", email, "with code:", otp);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedData = clientOtpStore[email];

      if (!storedData) {
        resolve({ success: false, message: "No OTP sent for this email (Simulation)." });
        return;
      }

      if (Date.now() > storedData.expires) {
        delete clientOtpStore[email];
        resolve({ success: false, message: "OTP has expired (Simulation)." });
        return;
      }

      if (storedData.otp === otp) {
        // delete clientOtpStore[email]; // Optional: consume OTP
        resolve({ success: true, message: "OTP verified successfully (Simulation)." });
      } else {
        resolve({ success: false, message: "Invalid OTP code (Simulation: Use 123456)." });
      }
    }, 800);
  });
};
