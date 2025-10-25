"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface Invitation {
  id: string;
  email: string;
  role: string;
  role_level: string;
  tenant_id: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  status: string;
  custom_message?: string;
}

interface InvitationsTabProps {
  selectedTenantId: string;
}

export const InvitationsTab: React.FC<InvitationsTabProps> = ({ selectedTenantId }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, [selectedTenantId]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('tenant_id', selectedTenantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        setError(error.message || 'Failed to fetch invitations');
        return;
      }
      
      setError(null);

      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

   const handleResend = async (invitation: Invitation) => {
    try {
      setActionLoading(invitation.id);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to resend invitations');
        return;
      }
      
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          emails: [invitation.email],
          role: invitation.role,
          roleLevel: invitation.role_level,
          tenantId: invitation.tenant_id,
          expiresInDays: 7,
          customMessage: invitation.custom_message || ''
        }),
      });invitation.custom_message || ''
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Invitation resent successfully!');
        fetchInvitations(); // Refresh the list
      } else {
        alert(`Failed to resend invitation: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Failed to resend invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (invitationId: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      setActionLoading(invitationId);
      
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Error deleting invitation:', error);
        alert('Failed to delete invitation');
        return;
      }

      alert('Invitation deleted successfully!');
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
        <div className="text-center py-8 text-gray-500">
          Loading invitations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error loading invitations</p>
          <p className="text-sm text-gray-500">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchInvitations();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No pending invitations at this time.</p>
          <p className="text-sm mt-2">Invited users will appear here until they accept their invitation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Pending Invitations</h3>
        <p className="text-sm text-gray-500 mt-1">{invitations.length} pending invitation(s)</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invited At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitations.map((invitation) => {
              const expired = isExpired(invitation.expires_at);
              return (
                <tr key={invitation.id} className={expired ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invitation.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {invitation.role.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {invitation.role_level}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invitation.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invitation.expires_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      expired 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {expired ? 'Expired' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(invitation)}
                      disabled={actionLoading === invitation.id}
                    >
                      {actionLoading === invitation.id ? 'Resending...' : 'Resend'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(invitation.id)}
                      disabled={actionLoading === invitation.id}
                    >
                      {actionLoading === invitation.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

