'use client'

import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef
} from '@tanstack/react-table'
import { 
  Check, 
  X, 
  Minus, 
  ChevronRight, 
  ChevronDown, 
  User, 
  Shield,
  Info
} from 'lucide-react'
import { RBACMatrixRowUser, RBACPermissionCell, RBACPermissionCatalog } from '@/types'

interface RBACMatrixGridProps {
  users: RBACMatrixRowUser[]
  permissionCatalog: RBACPermissionCatalog[]
  onCellClick: (userId: string, permissionId: string) => void
  onUserClick: (userId: string) => void
  loading?: boolean
  draftChanges?: Map<string, 'allow' | 'deny' | 'none'>
}

// Group permissions by resource
interface PermissionGroup {
  resource: string
  permissions: RBACPermissionCatalog[]
}

const columnHelper = createColumnHelper<RBACMatrixRowUser>()

export default function RBACMatrixGrid({
  users,
  permissionCatalog,
  onCellClick,
  onUserClick,
  loading = false,
  draftChanges = new Map()
}: RBACMatrixGridProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Group permissions by resource
  const permissionGroups = useMemo(() => {
    const groups = new Map<string, RBACPermissionCatalog[]>()
    
    permissionCatalog.forEach((permission: any) => {
      if (!groups.has(permission.resource)) {
        groups.set(permission.resource, [])
      }
      groups.get(permission.resource)!.push(permission)
    })

    return Array.from(groups.entries()).map(([resource, permissions]: any) => ({
      resource,
      permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
    }))
  }, [permissionCatalog])

  // Toggle group expansion
  const toggleGroup = (resource: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource)
    } else {
      newExpanded.add(resource)
    }
    setExpandedGroups(newExpanded)
  }

  // Create columns
  const columns = useMemo(() => {
    const cols: ColumnDef<RBACMatrixRowUser, any>[] = []

    // User column (sticky)
    cols.push(
      columnHelper.accessor('email', {
        id: 'user',
        header: 'User',
        size: 250,
        cell: ({ row }) => (
          <div 
            className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => onUserClick(row.original.userId)}
          >
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {row.original.display_name || row.original.email}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {row.original.email}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  row.original.role === 'host_admin' 
                    ? 'bg-purple-100 text-purple-800'
                    : row.original.role === 'client_admin'
                    ? 'bg-blue-100 text-blue-800'
                    : row.original.role === 'program_manager'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {row.original.role.replace('_', ' ')}
                </span>
                {!row.original.is_active && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })
    )

    // Permission group columns
    permissionGroups.forEach((group: any) => {
      const isExpanded = expandedGroups.has(group.resource)
      
      // Group header column
      cols.push(
        columnHelper.display({
          id: `group-${group.resource}`,
          header: () => (
            <div className="text-center">
              <button
                onClick={() => toggleGroup(group.resource)}
                className="flex items-center justify-center space-x-1 w-full p-2 hover:bg-gray-50 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="text-xs font-medium text-gray-700 capitalize">
                  {group.resource.replace('-', ' ')}
                </span>
              </button>
            </div>
          ),
          size: 120,
          cell: ({ row }) => (
            <div className="text-center p-2">
              <BulkPermissionCell
                userId={row.original.userId}
                resource={group.resource}
                permissions={group.permissions}
                userCells={row.original.cells}
                onBulkChange={(effect: any) => {
                  group.permissions.forEach((permission: any) => {
                    onCellClick(row.original.userId, permission.permissionId)
                  })
                }}
              />
            </div>
          )
        })
      )

      // Individual permission columns (only if expanded)
      if (isExpanded) {
        group.permissions.forEach((permission: any) => {
          cols.push(
            columnHelper.display({
              id: permission.permissionId,
              header: () => (
                <div className="text-center p-2">
                  <div className="text-xs font-medium text-gray-700 capitalize">
                    {permission.action}
                  </div>
                </div>
              ),
              size: 80,
              cell: ({ row }) => {
                const cell = row.original.cells.find((c: any) => c.permissionId === permission.permissionId)
                const draftKey = `${row.original.userId}:${permission.permissionId}`
                const draftState = draftChanges.get(draftKey)
                
                return (
                  <div className="text-center p-2">
                    <PermissionCell
                      cell={cell}
                      draftState={draftState}
                      onClick={() => onCellClick(row.original.userId, permission.permissionId)}
                    />
                  </div>
                )
              }
            })
          )
        })
      }
    })

    return cols
  }, [permissionGroups, expandedGroups, users, draftChanges, onCellClick, onUserClick])

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions matrix...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th
                    key={header.id}
                    className={`px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      header.id === 'user' ? 'sticky left-0 bg-gray-50 z-10' : ''
                    }`}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell: any) => (
                  <td
                    key={cell.id}
                    className={`px-2 py-1 whitespace-nowrap text-sm text-gray-900 ${
                      cell.column.id === 'user' ? 'sticky left-0 bg-white z-10' : ''
                    }`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a tenant to view users and their permissions.
          </p>
        </div>
      )}
    </div>
  )
}

// Individual permission cell component
interface PermissionCellProps {
  cell?: RBACPermissionCell
  draftState?: 'allow' | 'deny' | 'none'
  onClick: () => void
}

function PermissionCell({ cell, draftState, onClick }: PermissionCellProps) {
  const state = draftState || cell?.state || 'none'
  const origin = cell?.origin || 'none'
  const isDraft = draftState !== undefined

  const getIcon = () => {
    switch (state) {
      case 'allow':
        return <Check className="h-4 w-4" />
      case 'deny':
        return <X className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getColors = () => {
    if (isDraft) {
      switch (state) {
        case 'allow':
          return 'bg-green-200 text-green-800 border-green-300 ring-2 ring-green-400'
        case 'deny':
          return 'bg-red-200 text-red-800 border-red-300 ring-2 ring-red-400'
        default:
          return 'bg-gray-200 text-gray-600 border-gray-300 ring-2 ring-gray-400'
      }
    }

    switch (state) {
      case 'allow':
        return origin === 'role' 
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-green-500 text-white border-green-600'
      case 'deny':
        return origin === 'role'
          ? 'bg-red-100 text-red-700 border-red-200'
          : 'bg-red-500 text-white border-red-600'
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200'
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded border flex items-center justify-center hover:opacity-80 transition-all ${getColors()}`}
      title={`${state} (${origin}${cell?.roleNames ? ` - ${cell.roleNames.join(', ')}` : ''})`}
    >
      {getIcon()}
    </button>
  )
}

// Bulk permission cell for resource groups
interface BulkPermissionCellProps {
  userId: string
  resource: string
  permissions: RBACPermissionCatalog[]
  userCells: RBACPermissionCell[]
  onBulkChange: (effect: 'allow' | 'deny' | 'none') => void
}

function BulkPermissionCell({ 
  userId, 
  resource, 
  permissions, 
  userCells, 
  onBulkChange 
}: BulkPermissionCellProps) {
  const resourceCells = userCells.filter((cell: any) => 
    permissions.some((p: any) => p.permissionId === cell.permissionId)
  )

  const allowCount = resourceCells.filter((c: any) => c.state === 'allow').length
  const denyCount = resourceCells.filter((c: any) => c.state === 'deny').length
  const totalCount = resourceCells.length

  const getState = () => {
    if (allowCount === totalCount) return 'allow'
    if (denyCount === totalCount) return 'deny'
    if (allowCount > 0 || denyCount > 0) return 'mixed'
    return 'none'
  }

  const state = getState()

  const getIcon = () => {
    switch (state) {
      case 'allow':
        return <Check className="h-4 w-4" />
      case 'deny':
        return <X className="h-4 w-4" />
      case 'mixed':
        return <Info className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getColors = () => {
    switch (state) {
      case 'allow':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'deny':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'mixed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200'
    }
  }

  return (
    <button
      onClick={() => onBulkChange(state === 'allow' ? 'none' : 'allow')}
      className={`w-8 h-8 rounded border flex items-center justify-center hover:opacity-80 transition-all ${getColors()}`}
      title={`Bulk ${resource}: ${allowCount}/${totalCount} allowed`}
    >
      {getIcon()}
    </button>
  )
}

