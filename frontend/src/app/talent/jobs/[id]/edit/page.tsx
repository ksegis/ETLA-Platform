/**
 * Job Edit Page
 * Edit existing job posting details
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  work_mode: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  status: string;
  description: string;
  requirements: string;
  benefits: string;
  hiring_manager_name: string;
  posted_date: string;
  closing_date: string;
}

export default function JobEditPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    status: 'draft',
    description: '',
    requirements: '',
    benefits: '',
    hiring_manager_name: '',
    posted_date: '',
    closing_date: ''
  });

  useEffect(() => {
    // In production, fetch job from API
    // For now, use mock data
    setFormData({
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      employment_type: 'full_time',
      work_mode: 'hybrid',
      salary_min: '120000',
      salary_max: '180000',
      salary_currency: 'USD',
      status: 'active',
      description: 'We are seeking an experienced Senior Full Stack Developer...',
      requirements: '5+ years of professional software development experience\nStrong proficiency in React, TypeScript, and Node.js\nExperience with cloud platforms',
      benefits: 'Competitive salary and equity package\nComprehensive health, dental, and vision insurance\n401(k) with company match',
      hiring_manager_name: 'Sarah Johnson',
      posted_date: '2024-01-11',
      closing_date: '2024-03-11'
    });
    setLoading(false);
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // In production, save to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert('Job updated successfully!');
      router.push(`/talent/jobs/${params.id}`);
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading job details...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/talent/jobs/${params.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employment_type">Employment Type *</Label>
                    <select
                      id="employment_type"
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="work_mode">Work Mode *</Label>
                    <select
                      id="work_mode"
                      name="work_mode"
                      value={formData.work_mode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compensation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salary_min">Minimum Salary</Label>
                      <Input
                        id="salary_min"
                        name="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={handleChange}
                        placeholder="120000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary_max">Maximum Salary</Label>
                      <Input
                        id="salary_max"
                        name="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={handleChange}
                        placeholder="180000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="salary_currency">Currency</Label>
                    <select
                      id="salary_currency"
                      name="salary_currency"
                      value={formData.salary_currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hiring_manager_name">Hiring Manager</Label>
                    <Input
                      id="hiring_manager_name"
                      name="hiring_manager_name"
                      value={formData.hiring_manager_name}
                      onChange={handleChange}
                      placeholder="Sarah Johnson"
                    />
                  </div>
                  <div>
                    <Label htmlFor="posted_date">Posted Date</Label>
                    <Input
                      id="posted_date"
                      name="posted_date"
                      type="date"
                      value={formData.posted_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closing_date">Closing Date</Label>
                    <Input
                      id="closing_date"
                      name="closing_date"
                      type="date"
                      value={formData.closing_date}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={10}
                    required
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Enter each requirement on a new line..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter each requirement on a new line
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Enter each benefit on a new line..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter each benefit on a new line
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <Link href={`/talent/jobs/${params.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
