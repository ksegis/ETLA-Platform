import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f8f8',
      color: '#333'
    }}>
      <h1 style={{ fontSize: '3em', color: '#dc3545' }}>403 - Unauthorized Access</h1>
      <p style={{ fontSize: '1.2em', marginTop: '10px' }}>
        You do not have permission to view this page.
      </p>
      <p style={{ fontSize: '1em', marginTop: '5px' }}>
        Please contact your administrator if you believe this is an error.
      </p>
      <a href="/dashboard" style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease'
      }}>
        Go to Dashboard
      </a>
    </div>
  );
};

export default UnauthorizedPage;

