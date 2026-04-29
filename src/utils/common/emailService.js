// Password Reset Service — generates a reset link shown on screen

// Generate a unique reset token
const generateToken = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

// Store token in localStorage (valid for 15 minutes)
const storeResetToken = (email, token) => {
  const resetData = { email: email.toLowerCase(), token, expiresAt: Date.now() + 15 * 60 * 1000 };
  const allResets = JSON.parse(localStorage.getItem('resetTokens') || '[]');
  const filtered = allResets.filter(t => t.expiresAt > Date.now() && t.email !== email.toLowerCase());
  filtered.push(resetData);
  localStorage.setItem('resetTokens', JSON.stringify(filtered));
};

// Verify a reset token (from link)
export const verifyResetToken = (token, email) => {
  const allResets = JSON.parse(localStorage.getItem('resetTokens') || '[]');
  return !!allResets.find(t => t.token === token && t.email === email.toLowerCase() && t.expiresAt > Date.now());
};

// Invalidate token after use
export const invalidateToken = (tokenOrEmail) => {
  const allResets = JSON.parse(localStorage.getItem('resetTokens') || '[]');
  const filtered = allResets.filter(t => t.token !== tokenOrEmail && t.email !== tokenOrEmail.toLowerCase());
  localStorage.setItem('resetTokens', JSON.stringify(filtered));
};

// Generate reset link
export const generateResetLink = (email) => {
  const token = generateToken();
  storeResetToken(email, token);
  const resetLink = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  return { success: true, resetLink };
};
