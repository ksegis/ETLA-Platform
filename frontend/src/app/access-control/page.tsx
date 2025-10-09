import React from 'react';
import RBACTestPanel from '@/components/RBACTestPanel';

const AccessControlPage = () => {
  return (
    <div className="container mx-auto py-8">
      {process.env.NODE_ENV !== "production" ? <RBACTestPanel /> : null}
    </div>
  );
};

export default AccessControlPage;

