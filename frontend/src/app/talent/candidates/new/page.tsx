/**
 * Add New Candidate Page
 * Form to add a new candidate to the ATS
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
import { ArrowLeft, Save, Upload, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddCandidatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zip: '',
    
    // Job Information
    jobLocation: '',
    requisitionId: '',
    currentTitle: '',
    currentCompany: '',
    experience: '',
    
    // Compensation
    expectedSalary: '',
    currentSalary: '',
    availability: '',
    
    // Additional
    source: '',
    notes: '',
    linkedinUrl: '',
    portfolioUrl: '',
    
    // Education
    degree: '',
    school: '',
    graduationYear: '',
    gpa: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement actual API call to save candidate
      // const response = await supabase.from('candidates').insert({...});
      
      console.log('Saving candidate:', { ...formData, skills });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Candidate added successfully!');
      router.push('/talent/candidates');
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Failed to save candidate. Please try again.');
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
            <Link href="/talent/candidates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
              <p className="text-gray-500 mt-1">Enter candidate information below</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentTitle">Current Job Title</Label>
                  <Input
                    id="currentTitle"
                    value={formData.currentTitle}
                    onChange={(e) => handleInputChange('currentTitle', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 5 years"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="jobLocation">Preferred Job Location</Label>
                  <Input
                    id="jobLocation"
                    value={formData.jobLocation}
                    onChange={(e) => handleInputChange('jobLocation', e.target.value)}
                    placeholder="e.g., Miami, FL"
                    className="mt-1"
                  />
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

          {/* Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compensation & Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentSalary">Current Salary</Label>
                  <Input
                    id="currentSalary"
                    type="number"
                    value={formData.currentSalary}
                    onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                    placeholder="e.g., 100000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <Input
                    id="expectedSalary"
                    type="number"
                    value={formData.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    placeholder="e.g., 120000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select 
                    value={formData.availability}
                    onValueChange={(value) => handleInputChange('availability', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
                      <SelectItem value="1_month">1 Month</SelectItem>
                      <SelectItem value="2_months">2 Months</SelectItem>
                      <SelectItem value="3_months">3+ Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    placeholder="e.g., BS Computer Science"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="school">School/University</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    placeholder="e.g., Stanford University"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    placeholder="e.g., 2020"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input
                    id="gpa"
                    value={formData.gpa}
                    onChange={(e) => handleInputChange('gpa', e.target.value)}
                    placeholder="e.g., 3.8"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select 
                    value={formData.source}
                    onValueChange={(value) => handleInputChange('source', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How did you find this candidate?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="indeed">Indeed</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="company_website">Company Website</SelectItem>
                      <SelectItem value="glassdoor">Glassdoor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio/Website URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional notes about the candidate..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resume & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
                <Button type="button" variant="outline" className="mt-4">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/talent/candidates">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Candidate'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
