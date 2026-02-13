'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { AadhaarDetails, AadhaarFormData } from '@/types/aadhaar';

export default function Home() {
  const [formData, setFormData] = useState<AadhaarFormData>({
    aadhaar_number: '',
    name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone_number: '',
    email: '',
  });

  const [aadhaarDetails, setAadhaarDetails] = useState<AadhaarDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchNumber, setSearchNumber] = useState('');

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: AadhaarFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper function to format date for HTML5 date input (YYYY-MM-DD)
  const formatDateForInput = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    
    try {
      // If it's already a string in YYYY-MM-DD format, return as is
      if (typeof dateValue === 'string') {
        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        // Try to parse and format other date string formats
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
      
      // If it's a Date object
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return '';
  };

  // Helper function to format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return '';
    }
  };

  // Helper function to format date-time for display (dd/mm/yyyy HH:mm:ss)
  const formatDateTimeForDisplay = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting date-time for display:', error);
      return '';
    }
  };

  // Fetch Aadhaar details by number
  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      setError('Please enter an Aadhaar number');
      return;
    }

    if (!/^\d{12}$/.test(searchNumber)) {
      setError('Invalid Aadhaar number format. Must be 12 digits');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setAadhaarDetails(null);

    try {
      const response = await fetch(`/api/aadhaar?aadhaar_number=${searchNumber}`);
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Failed to fetch Aadhaar details';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setAadhaarDetails(result.data);
        // Populate form with fetched data - format date properly for HTML5 date input
        setFormData({
          aadhaar_number: result.data.aadhaar_number,
          name: result.data.name || '',
          date_of_birth: formatDateForInput(result.data.date_of_birth),
          gender: result.data.gender || '',
          address: result.data.address || '',
          phone_number: result.data.phone_number || '',
          email: result.data.email || '',
        });
        setSuccess('Aadhaar details fetched successfully');
        setError(null); // Clear any previous errors
      } else {
        setError(result.error || 'Aadhaar details not found');
        setAadhaarDetails(null); // Clear details if not found
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // Check if it's a network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to server. Please make sure the server is running.');
      } else {
        setError(err?.message || 'Failed to fetch Aadhaar details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Aadhaar details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aadhaar_number || !formData.name) {
      setError('Aadhaar number and name are required');
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhaar_number)) {
      setError('Invalid Aadhaar number format. Must be 12 digits');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/aadhaar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Failed to save Aadhaar details';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setAadhaarDetails(result.data);
        setSuccess(result.message || 'Aadhaar details saved successfully');
      } else {
        setError(result.error || 'Failed to save Aadhaar details');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      // Check if it's a network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to server. Please make sure the server is running.');
      } else {
        setError(err?.message || 'Failed to save Aadhaar details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear form
  const handleClear = () => {
    setFormData({
      aadhaar_number: '',
      name: '',
      date_of_birth: '',
      gender: '',
      address: '',
      phone_number: '',
      email: '',
    });
    setAadhaarDetails(null);
    setSearchNumber('');
    setError(null);
    setSuccess(null);
  };

  // Download Aadhaar details as PDF
  const handleDownloadPDF = () => {
    if (!aadhaarDetails) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Format Aadhaar number as XXXX XXXX XXXX
    const formatAadhaarDisplay = (num: string) => {
      if (!num || num.length !== 12) return num;
      return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)}`;
    };

    // ---- Header Banner ----
    doc.setFillColor(102, 126, 234); // Purple gradient start
    doc.rect(0, 0, pageWidth, 32, 'F');
    doc.setFillColor(118, 75, 162); // Purple gradient end
    doc.rect(0, 28, pageWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Aadhaar Details', margin, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Record | Generated Document', margin, 27);
    y = 42;

    // ---- Section header card ----
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(85, 85, 85);
    doc.text('Personal Information', margin + 8, y + 5.5);
    y += 14;

    // ---- Table-style rows ----
    const rows: { label: string; value: string }[] = [
      { label: 'Aadhaar Number', value: formatAadhaarDisplay(aadhaarDetails.aadhaar_number) },
      { label: 'Full Name', value: aadhaarDetails.name },
      { label: 'Date of Birth', value: formatDateForDisplay(aadhaarDetails.date_of_birth) },
      { label: 'Gender', value: aadhaarDetails.gender || '—' },
      { label: 'Address', value: aadhaarDetails.address || '—' },
      { label: 'Phone Number', value: aadhaarDetails.phone_number || '—' },
      { label: 'Email Address', value: aadhaarDetails.email || '—' },
    ];
    if (aadhaarDetails.created_at) {
      rows.push({ label: 'Record Created', value: formatDateTimeForDisplay(aadhaarDetails.created_at) });
    }
    if (aadhaarDetails.updated_at) {
      rows.push({ label: 'Last Updated', value: formatDateTimeForDisplay(aadhaarDetails.updated_at) });
    }

    const rowHeight = 10;
    const labelWidth = 45;
    const valueX = margin + labelWidth + 5;

    rows.forEach((row, i) => {
      const isAlt = i % 2 === 1;
      if (isAlt) {
        doc.setFillColor(252, 252, 254);
        doc.rect(margin, y - 3, contentWidth, rowHeight + 2, 'F');
      }

      doc.setDrawColor(230, 230, 235);
      doc.line(margin, y + rowHeight - 2, margin + contentWidth, y + rowHeight - 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 110);
      doc.text(row.label + ':', margin + 6, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 55);
      const lines = doc.splitTextToSize(row.value, contentWidth - labelWidth - 16);
      doc.text(lines, valueX, y + 4);
      y += Math.max(rowHeight, lines.length * 5) + 2;
    });

    // ---- Footer ----
    y += 10;
    doc.setDrawColor(220, 220, 225);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 150);
    const generatedAt = formatDateTimeForDisplay(new Date().toISOString());
    doc.text(`Generated on ${generatedAt} | Aadhaar Details Management System`, pageWidth / 2, y, { align: 'center' });
    doc.text('This is a system-generated document. For official use only.', pageWidth / 2, y + 5, { align: 'center' });

    // ---- Document ID / Security note ----
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 190);
    doc.text(`Document ID: AAD-${aadhaarDetails.aadhaar_number}-${Date.now().toString(36).toUpperCase()}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

    // Download using anchor element to avoid insecure download block
    const fileName = `Aadhaar_${aadhaarDetails.aadhaar_number}_${aadhaarDetails.name?.replace(/\s+/g, '_') || 'Details'}.pdf`;
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.setAttribute('type', 'application/pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <h1>🆔 Aadhaar Details Management</h1>
            <p style={{ color: '#666', margin: 0 }}>
              Enter Aadhaar number to search or add new details
            </p>
          </div>
          <button
            type="button"
            className="btn-download-pdf"
            onClick={handleDownloadPDF}
            disabled={!aadhaarDetails}
            title={aadhaarDetails ? 'Download Aadhaar details as PDF' : 'Search for Aadhaar details first to download'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
        </div>
        <div style={{ marginBottom: '30px' }} />

        {/* Search Section */}
        <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h2>Search Aadhaar</h2>
          <div className="form-group">
            <label htmlFor="search_aadhaar">Aadhaar Number (12 digits)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                id="search_aadhaar"
                value={searchNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={handleSearch} disabled={loading}>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          <h2>Add/Update Aadhaar Details</h2>
          
          <div className="grid">
            <div className="form-group">
              <label htmlFor="aadhaar_number">Aadhaar Number *</label>
              <input
                type="text"
                id="aadhaar_number"
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setFormData((prev) => ({ ...prev, aadhaar_number: value }));
                }}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                  setFormData((prev) => ({ ...prev, phone_number: value }));
                }}
                placeholder="Enter phone number"
                maxLength={15}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Details'}
            </button>
            <button type="button" onClick={handleClear} disabled={loading} style={{ background: '#6c757d' }}>
              Clear
            </button>
          </div>
        </form>

        {/* Display Details */}
        {aadhaarDetails && (
          <div className="details-container">
            <h2>📋 Aadhaar Details</h2>
            <div className="details-card">
              <div className="detail-row">
                <div className="detail-label">Aadhaar Number:</div>
                <div className="detail-value">{aadhaarDetails.aadhaar_number}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{aadhaarDetails.name}</div>
              </div>
              {aadhaarDetails.date_of_birth && (
                <div className="detail-row">
                  <div className="detail-label">Date of Birth:</div>
                  <div className="detail-value">
                    {formatDateForDisplay(aadhaarDetails.date_of_birth)}
                  </div>
                </div>
              )}
              {aadhaarDetails.gender && (
                <div className="detail-row">
                  <div className="detail-label">Gender:</div>
                  <div className="detail-value">{aadhaarDetails.gender}</div>
                </div>
              )}
              {aadhaarDetails.address && (
                <div className="detail-row">
                  <div className="detail-label">Address:</div>
                  <div className="detail-value">{aadhaarDetails.address}</div>
                </div>
              )}
              {aadhaarDetails.phone_number && (
                <div className="detail-row">
                  <div className="detail-label">Phone Number:</div>
                  <div className="detail-value">{aadhaarDetails.phone_number}</div>
                </div>
              )}
              {aadhaarDetails.email && (
                <div className="detail-row">
                  <div className="detail-label">Email:</div>
                  <div className="detail-value">{aadhaarDetails.email}</div>
                </div>
              )}
              {aadhaarDetails.created_at && (
                <div className="detail-row">
                  <div className="detail-label">Created At:</div>
                  <div className="detail-value">
                    {formatDateTimeForDisplay(aadhaarDetails.created_at)}
                  </div>
                </div>
              )}
              {aadhaarDetails.updated_at && (
                <div className="detail-row">
                  <div className="detail-label">Updated At:</div>
                  <div className="detail-value">
                    {formatDateTimeForDisplay(aadhaarDetails.updated_at)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && !aadhaarDetails && (
          <div className="loading">Loading...</div>
        )}
      </div>
    </div>
  );
}
