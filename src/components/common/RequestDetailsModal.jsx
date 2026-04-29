import React from 'react';

const RequestDetailsModal = ({ request, onClose }) => {
  if (!request) return null;

  // Filter out internal keys we don't need to display
  const excludeKeys = ['id', 'key', 'password', 'status', 'type', 'storageKey'];
  
  const entries = Object.entries(request).filter(([key]) => !excludeKeys.includes(key));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {request.type ? `${request.type} Request Details` : 'Request Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <dl className="space-y-4">
            {entries.map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-50 last:border-0">
                <dt className="text-sm font-semibold text-gray-500 capitalize tracking-wide">{key.replace(/([A-Z])/g, ' KES 1').trim()}</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:ml-4 sm:text-right">
                  {value || '-'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
