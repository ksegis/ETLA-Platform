'use client'

import { useState } from 'react'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  avatar?: string
  skills: string[]
  availability: 'available' | 'busy' | 'vacation' | 'sick'
  currentProjects: Array<{
    id: string
    title: string
    hoursAllocated: number
    hoursCompleted: number
    endDate: string
  }>
  weeklyCapacity: number
  currentWorkload: number
  utilizationRate: number
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Consultant',
    email: 'sarah.johnson@etla.com',
    phone: '+1 (555) 123-4567',
    skills: ['Benefits Administration', 'HRIS Integration', 'Compliance', 'Project Management'],
    availability: 'busy',
    currentProjects: [
      {
        id: '1',
        title: 'Payroll System Integration',
        hoursAllocated: 40,
        hoursCompleted: 24,
        endDate: '2024-08-30'
      },
      {
        id: '2',
        title: 'Benefits Audit',
        hoursAllocated: 20,
        hoursCompleted: 5,
        endDate: '2024-09-15'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 35,
    utilizationRate: 87.5
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Data Specialist',
    email: 'mike.chen@etla.com',
    phone: '+1 (555) 234-5678',
    skills: ['Data Migration', 'ETL Processes', 'Database Management', 'Analytics'],
    availability: 'available',
    currentProjects: [
      {
        id: '4',
        title: 'Data Migration Project',
        hoursAllocated: 80,
        hoursCompleted: 0,
        endDate: '2024-09-10'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 20,
    utilizationRate: 50
  },
  {
    id: '3',
    name: 'Lisa Wang',
    role: 'Technical Consultant',
    email: 'lisa.wang@etla.com',
    phone: '+1 (555) 345-6789',
    skills: ['Custom Development', 'API Integration', 'Reporting', 'Training'],
    availability: 'available',
    currentProjects: [
      {
        id: '5',
        title: 'Custom Reporting Dashboard',
        hoursAllocated: 50,
        hoursCompleted: 0,
        endDate: '2024-09-15'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 25,
    utilizationRate: 62.5
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Implementation Specialist',
    email: 'david.kim@etla.com',
    phone: '+1 (555) 456-7890',
    skills: ['System Configuration', 'User Training', 'Documentation', 'Support'],
    availability: 'vacation',
    currentProjects: [
      {
        id: '6',
        title: 'Benefits Configuration',
        hoursAllocated: 20,
        hoursCompleted: 0,
        endDate: '2024-09-12'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 0,
    utilizationRate: 0
  }
]

const availabilityColors = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-red-100 text-red-800',
  vacation: 'bg-blue-100 text-blue-800',
  sick: 'bg-yellow-100 text-yellow-800'
}

const utilizationColors = (rate: number) => {
  if (rate >= 90) return 'text-red-600'
  if (rate >= 75) return 'text-orange-600'
  if (rate >= 50) return 'text-green-600'
  return 'text-gray-600'
}

export default function TeamResourcesPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [selectedAvailability, setSelectedAvailability] = useState('all')

  const allSkills = Array.from(new Set(mockTeamMembers.flatMap(member => member.skills)))

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkill = selectedSkill === 'all' || member.skills.includes(selectedSkill)
    const matchesAvailability = selectedAvailability === 'all' || member.availability === selectedAvailability
    
    return matchesSearch && matchesSkill && matchesAvailability
  })

  const getTeamStats = () => {
    const totalCapacity = teamMembers.reduce((sum, member) => sum + member.weeklyCapacity, 0)
    const totalWorkload = teamMembers.reduce((sum, member) => sum + member.currentWorkload, 0)
    const averageUtilization = teamMembers.reduce((sum, member) => sum + member.utilizationRate, 0) / teamMembers.length
    const availableMembers = teamMembers.filter(member => member.availability === 'available').length

    return { totalCapacity, totalWorkload, averageUtilization, availableMembers }
  }

  const handleAssignProject = (memberId: string) => {
    alert(`Assign project to team member ${memberId} - would open assignment form`)
  }

  const handleViewDetails = (memberId: string) => {
    alert(`View details for team member ${memberId} - would open detailed view`)
  }

  const handleManageCapacity = () => {
    alert('Manage team capacity - would open capacity management form')
  }

  const stats = getTeamStats()

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/project-management'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Resources</h1>
              <p className="text-gray-600">Manage team capacity and workload allocation</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/project-management/schedule'}
                variant="outline"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule View
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleManageCapacity}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Capacity
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableMembers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCapacity}h</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Current Workload</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalWorkload}h</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageUtilization.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
            </select>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No team members found matching your criteria.</p>
            </div>
          ) : (
            filteredMembers.map(member => (
              <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Member Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availabilityColors[member.availability]}`}>
                    {member.availability.charAt(0).toUpperCase() + member.availability.slice(1)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workload */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Weekly Workload</p>
                    <span className={`text-sm font-medium ${utilizationColors(member.utilizationRate)}`}>
                      {member.utilizationRate}% utilized
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        member.utilizationRate >= 90 ? 'bg-red-500' :
                        member.utilizationRate >= 75 ? 'bg-orange-500' :
                        member.utilizationRate >= 50 ? 'bg-green-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${member.utilizationRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{member.currentWorkload}h allocated</span>
                    <span>{member.weeklyCapacity}h capacity</span>
                  </div>
                </div>

                {/* Current Projects */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Projects ({member.currentProjects.length})</p>
                  <div className="space-y-2">
                    {member.currentProjects.slice(0, 2).map(project => (
                      <div key={project.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">{project.title}</p>
                          <span className="text-xs text-gray-500">Due: {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(project.hoursCompleted / project.hoursAllocated) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {project.hoursCompleted}/{project.hoursAllocated}h
                          </span>
                        </div>
                      </div>
                    ))}
                    {member.currentProjects.length > 2 && (
                      <p className="text-xs text-gray-500">+{member.currentProjects.length - 2} more projects</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(member.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAssignProject(member.id)}
                    disabled={member.availability !== 'available'}
                  >
                    Assign Project
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

