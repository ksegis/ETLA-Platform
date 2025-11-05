'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, File, Lock } from 'lucide-react';
import { exportToExcel, exportToPDF, exportToCSV, getTimestampedFilename } from '@/utils/exportUtils-enhanced';
import { logCandidateExport } from '@/services/auditLogService';
import { useRBAC } from '@/hooks/useRBAC';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  jobLocation: string;
  requisitionId: string;
  requisitionDescription: string;
  title: string;
  company: string;
  experience: string;
  expectedSalary: number;
  currentSalary: number;
  availability: string;
  status: string;
  rating: number;
  skills: string[];
  source: string;
  addedDate: string;
  lastContact: string;
  tags: string[];
}

interface ExportButtonsProps {
  candidates: Candidate[];
  filterDescription?: string;
  tenantName?: string;
  userId: string;
  tenantId: string;
}

export function ExportButtons({ 
  candidates, 
  filterDescription, 
  tenantName,
  userId,
  tenantId 
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { canExport, canViewSalary } = useRBAC();

  /**
   * Prepare candidate data for export by flattening nested structures
   */
  const prepareExportData = (includeAllFields: boolean = true) => {
    return candidates.map(candidate => {
      const baseData = {
        'Candidate ID': candidate.id,
        'Name': candidate.name,
        'Email': candidate.email,
        'Phone': candidate.phone,
        'Address': `${candidate.address.street}, ${candidate.address.city}, ${candidate.address.state} ${candidate.address.zip}`,
        'Job Location': candidate.jobLocation,
        'Requisition ID': candidate.requisitionId,
        'Requisition Description': candidate.requisitionDescription,
        'Job Title': candidate.title,
        'Current Company': candidate.company,
        'Experience': candidate.experience,
        'Status': candidate.status,
        'Rating': candidate.rating,
        'Skills': candidate.skills.join(', '),
        'Source': candidate.source,
        'Added Date': candidate.addedDate,
        'Last Contact': candidate.lastContact,
        'Tags': candidate.tags.join(', '),
      };

      // Only include salary fields if user has permission and full export requested
      if (includeAllFields && canViewSalary) {
        return {
          ...baseData,
          'Expected Salary': candidate.expectedSalary,
          'Current Salary': candidate.currentSalary,
          'Availability': candidate.availability,
        };
      }

      return baseData;
    });
  };

  /**
   * Handle Excel export
   */
  const handleExportExcel = async (includeAllFields: boolean = true) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const data = prepareExportData(includeAllFields);
      const filename = getTimestampedFilename(
        `${tenantName || 'ETLA'}_Candidates`,
        'xlsx'
      );

      await exportToExcel(data, filename, {
        title: 'Candidate Export',
        author: tenantName || 'ETLA Platform',
        subject: filterDescription || 'Candidate listing',
        creator: 'ETLA Talent Management System'
      });

      // Log the export
      await logCandidateExport(
        userId,
        tenantId,
        'excel',
        candidates.length,
        includeAllFields && canViewSalary,
        filterDescription
      );

      console.log(`Successfully exported ${candidates.length} candidates to Excel`);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Excel export failed:', error);
      setExportError('Failed to export to Excel. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle PDF export
   */
  const handleExportPDF = async (includeAllFields: boolean = true) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const data = prepareExportData(includeAllFields);
      const filename = getTimestampedFilename(
        `${tenantName || 'ETLA'}_Candidates`,
        'pdf'
      );

      exportToPDF(data, filename, {
        title: 'Candidate Export',
        author: tenantName || 'ETLA Platform',
        subject: filterDescription || 'Candidate listing'
      });

      // Log the export
      await logCandidateExport(
        userId,
        tenantId,
        'pdf',
        candidates.length,
        includeAllFields && canViewSalary,
        filterDescription
      );

      console.log(`Successfully exported ${candidates.length} candidates to PDF`);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportError('Failed to export to PDF. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle CSV export
   */
  const handleExportCSV = async (includeAllFields: boolean = true) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const data = prepareExportData(includeAllFields);
      const filename = getTimestampedFilename(
        `${tenantName || 'ETLA'}_Candidates`,
        'csv'
      );

      exportToCSV(data, filename);

      // Log the export
      await logCandidateExport(
        userId,
        tenantId,
        'csv',
        candidates.length,
        includeAllFields && canViewSalary,
        filterDescription
      );

      console.log(`Successfully exported ${candidates.length} candidates to CSV`);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('CSV export failed:', error);
      setExportError('Failed to export to CSV. Please try again.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // If user doesn't have export permission
  if (!canExport) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Lock className="h-4 w-4 mr-2" />
        Export (No Permission)
      </Button>
    );
  }

  if (candidates.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="h-4 w-4 mr-2" />
        Export (No Data)
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isExporting}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        {isDropdownOpen && (
          <DropdownMenuContent align="end" className="w-56 z-[9999]">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Excel Export */}
            <DropdownMenuItem onClick={() => handleExportExcel(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">Excel (Full)</span>
                <span className="text-xs text-gray-500">
                  {canViewSalary ? 'All fields including salary' : 'All available fields'}
                </span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleExportExcel(false)}>
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">Excel (Summary)</span>
                <span className="text-xs text-gray-500">Basic fields only</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* PDF Export */}
            <DropdownMenuItem onClick={() => handleExportPDF(true)}>
              <FileText className="h-4 w-4 mr-2 text-red-600" />
              <div className="flex flex-col">
                <span className="font-medium">PDF (Full)</span>
                <span className="text-xs text-gray-500">
                  {canViewSalary ? 'All fields including salary' : 'All available fields'}
                </span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleExportPDF(false)}>
              <FileText className="h-4 w-4 mr-2 text-red-600" />
              <div className="flex flex-col">
                <span className="font-medium">PDF (Summary)</span>
                <span className="text-xs text-gray-500">Basic fields only</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* CSV Export */}
            <DropdownMenuItem onClick={() => handleExportCSV(true)}>
              <File className="h-4 w-4 mr-2 text-blue-600" />
              <div className="flex flex-col">
                <span className="font-medium">CSV (Full)</span>
                <span className="text-xs text-gray-500">
                  {canViewSalary ? 'All fields including salary' : 'All available fields'}
                </span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleExportCSV(false)}>
              <File className="h-4 w-4 mr-2 text-blue-600" />
              <div className="flex flex-col">
                <span className="font-medium">CSV (Summary)</span>
                <span className="text-xs text-gray-500">Basic fields only</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {exportError && (
        <div className="text-xs text-red-600 ml-2">
          {exportError}
        </div>
      )}
      
      {!exportError && candidates.length > 0 && (
        <span className="text-xs text-gray-500">
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
