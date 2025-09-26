import React from 'react';

interface UserDetailPanelProps {
  userId: string;
  tenantId: string;
  onClose: () => void;
  userDetail: any;
  loading: boolean;
  isHostAdmin: boolean;
  isAdmin: boolean;
}

export const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ onClose }) => {
  return (
    <div className="p-4 border-l bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">User Details</h2>
      <p>This is a placeholder for User Details.</p>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
    </div>
  );
};

