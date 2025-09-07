'use client'

import React from 'react'
import { Users, Shield } from 'lucide-react'

export type EntityType = 'users' | 'roles'

interface EntitySwitcherProps {
  activeEntity: EntityType
  onEntityChange: (entity: EntityType) => void
  userCount?: number
  roleCount?: number
}

export default function EntitySwitcher({
  activeEntity,
  onEntityChange,
  userCount,
  roleCount
}: EntitySwitcherProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onEntityChange('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeEntity === 'users'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users</span>
          {userCount !== undefined && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeEntity === 'users'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {userCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onEntityChange('roles')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeEntity === 'roles'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Roles</span>
          {roleCount !== undefined && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeEntity === 'roles'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {roleCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

