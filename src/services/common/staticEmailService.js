// src/services/staticEmailService.js

/**
 * Static Email Service - Simulates sending emails by logging to console.
 * @param {'approval' | 'rejection' | 'welcome' | 'passwordReset' | 'otp'} type 
 * @param {string} recipientName 
 * @param {string} recipientEmail 
 * @param {Object} extraData - Optional data like OTP codes
 */
export const sendStaticEmail = (type, recipientName, recipientEmail, extraData = {}) => {
  const templates = {
    approval: {
      subject: "Request Approved",
      message: `Dear ${recipientName}, your request has been approved successfully.`,
    },
    rejection: {
      subject: "Request Rejected",
      message: `Dear ${recipientName}, we regret to inform you that your request has been rejected.`,
    },
    welcome: {
      subject: "Welcome to PrimeBasket",
      message: `Dear ${recipientName}, welcome to PrimeBasket! We're excited to have you onboard.`,
    },
    passwordReset: {
      subject: "Password Reset Notification",
      message: `Dear ${recipientName}, your password has been reset successfully.`,
    },
    otp: {
      subject: "Your Verification Code",
      message: `Dear User, your 6-digit verification code is: ${extraData.otp}. This code is valid for 5 minutes.`,
    }
  };

  const template = templates[type] || { subject: "No Subject", message: "No Content" };

  return new Promise((resolve) => {
    console.log("%c📧 STATIC EMAIL SIMULATION", "color: #3BB77E; font-weight: bold; font-size: 14px;");
    console.log("%cTo:", "color: #1a2c42; font-weight: bold;", recipientEmail);
    console.log("%cRecipient Name:", "color: #1a2c42; font-weight: bold;", recipientName || "User");
    console.log("%cSubject:", "color: #1a2c42; font-weight: bold;", template.subject);
    console.log("%cMessage:", "color: #1a2c42; font-weight: bold;", template.message);
    console.log("------------------------------------------");

    setTimeout(() => {
      resolve({
        success: true,
        ...template,
      });
    }, 500);
  });
};
