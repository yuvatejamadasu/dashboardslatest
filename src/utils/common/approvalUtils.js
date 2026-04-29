import { sendApprovalEmail, sendRejectionEmail, sendStoreApprovedEmail } from './emailMock';

/**
 * Utility to process hierarchical approvals.
 * Moves a request to the next role in the chain or finalizes it.
 */
export const processApproval = (requestId) => {
  const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
  const reqIdx = pendingRequests.findIndex(r => r.id === requestId);
  
  if (reqIdx === -1) return { success: false, message: 'Request not found' };
  
  const request = { ...pendingRequests[reqIdx] };
  
  // If there's an approval chain, move to the next level
  if (request.approvalChain && request.approvalChain.length > 0) {
    const nextRole = request.approvalChain.shift();
    const prevTarget = request.targetRole;
    request.targetRole = nextRole;
    
    if (request._isRegionBypass) {
      request.status = "FORWARDED_TO_SUPER_ADMIN";
      request.currentLevel = "SUPER_ADMIN";
    } else if (request._isBranchBypass) {
      if (nextRole === 'state-admin') {
        request.status = "FORWARDED_TO_STATE_ADMIN";
        request.currentLevel = "STATE_ADMIN";
      } else if (nextRole === 'super-admin') {
        request.status = "FORWARDED_TO_SUPER_ADMIN";
        request.currentLevel = "SUPER_ADMIN";
      }
    } else {
      request.status = `Approved by ${prevTarget.replace('-', ' ')}, Pending ${nextRole.replace('-', ' ')}`;
    }
    
    pendingRequests[reqIdx] = request;
    localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
    return { success: true, isFinal: false, nextRole };
  } else {
    // Final approval
    request.status = 'Approved';
    request.approvedAt = new Date().toISOString();
    
    // Move to final storage
    const storageKey = request.storageKey;
    if (storageKey) {
        const existingAccounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([...existingAccounts, request]));
    }
    
    // Also add to approvedUsers for login purposes if it's the main account record source
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    if (!approvedUsers.some(u => u.email === request.email)) {
        localStorage.setItem('approvedUsers', JSON.stringify([...approvedUsers, request]));
    }

    // Remove from pending
    const updatedPending = pendingRequests.filter(r => r.id !== requestId);
    localStorage.setItem('pendingRequests', JSON.stringify(updatedPending));
    
    // Send success email
    if (request.type === 'STORE') {
      sendStoreApprovedEmail(request);
    } else {
      sendApprovalEmail(request);
    }
    
    return { success: true, isFinal: true };
  }
};

/**
 * Utility to reject a request, stopping the chain immediately.
 */
export const processRejection = (requestId) => {
  const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
  const reqToReject = pendingRequests.find(r => r.id === requestId);
  
  if (!reqToReject) return { success: false };
  
  // Remove from pending immediately (rejection stops everything)
  const updatedPending = pendingRequests.filter(r => r.id !== requestId);
  localStorage.setItem('pendingRequests', JSON.stringify(updatedPending));
  
  // Add to rejected log
  const rejectedRequests = JSON.parse(localStorage.getItem('rejectedRequests') || '[]');
  localStorage.setItem('rejectedRequests', JSON.stringify([...rejectedRequests, { ...reqToReject, rejectedAt: new Date().toISOString() }]));
  
  // Send rejection email
  sendRejectionEmail(reqToReject);
  
  return { success: true };
};
