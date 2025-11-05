/**
 * Post New Job Page
 * Form to create a new job posting
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostNewJobPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState('');

  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    department: '',
    location: '',
    workType: '', // Remote, On-site, Hybrid
    employmentType: '', // Full-time, Part-time, Contract
    
    // Compensation
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    
    // Job Details
    description: '',
    requisitionId: '',
    hiringManager: '',
    numberOfPositions: '1',
    
    // Dates
    startDate: '',
    applicationDeadline: '',
    
    // Additional
    experienceLevel: '', // Entry, Mid, Senior, Lead
    educationRequired: '',
    status: 'draft' // draft, active, closed
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim() && !responsibilities.includes(newResponsibility.trim())) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (resp: string) => {
    setResponsibilities(responsibilities.filter(r => r !== resp));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement actual API call to save job
      // const response = await supabase.from('jobs').insert({...});
      
      console.log('Posting job:', { ...formData, requirements, responsibilities });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Job posted successfully!');
      router.push('/talent/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/talent/jobs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post New Job</h1>
              <p className="text-gray-500 mt-1">Create a new job posting</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="workType">Work Type *</Label>
                  <Select 
                    value={formData.workType}
                    onValueChange={(value) => handleInputChange('workType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select 
                    value={formData.employmentType}
                    onValueChange={(value) => handleInputChange('employmentType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select 
                    value={formData.experienceLevel}
                    onValueChange={(value) => handleInputChange('experienceLevel', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="requisitionId">Requisition ID</Label>
                  <Input
                    id="requisitionId"
                    value={formData.requisitionId}
                    onChange={(e) => handleInputChange('requisitionId', e.target.value)}
                    placeholder="e.g., REQ001"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the role..."
                    rows={6}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="Add a responsibility"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddResponsibility();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddResponsibility}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {responsibilities.length > 0 && (
                  <ul className="space-y-2">
                    {responsibilities.map((resp, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="flex-1">{resp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveResponsibility(resp)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requirements & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="educationRequired">Education Required</Label>
                  <Input
                    id="educationRequired"
                    value={formData.educationRequired}
                    onChange={(e) => handleInputChange('educationRequired', e.target.value)}
                    placeholder="e.g., Bachelor's degree in Computer Science"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement (e.g., 5+ years of React experience)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRequirement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {requirements.length > 0 && (
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="flex-1">{req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(req)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary *</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                    placeholder="e.g., 120000"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Maximum Salary *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                    placeholder="e.g., 180000"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hiringManager">Hiring Manager</Label>
                  <Input
                    id="hiringManager"
                    value={formData.hiringManager}
                    onChange={(e) => handleInputChange('hiringManager', e.target.value)}
                    placeholder="Name of hiring manager"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfPositions">Number of Positions</Label>
                  <Input
                    id="numberOfPositions"
                    type="number"
                    min="1"
                    value={formData.numberOfPositions}
                    onChange={(e) => handleInputChange('numberOfPositions', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Expected Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/talent/jobs">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
