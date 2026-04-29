'use client';

import { useState } from 'react';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  state: string;
  industry: string;
  applicationDescription: string;
  currentChallenges: string;
  agreeToContact: boolean;
  agreeToPrivacy: boolean;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    state: '',
    industry: '',
    applicationDescription: '',
    currentChallenges: '',
    agreeToContact: false,
    agreeToPrivacy: false,
  });

  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormState> = {};

    if (!formData.firstName.trim()) newErrors.firstName = true;
    if (!formData.lastName.trim()) newErrors.lastName = true;
    if (!formData.email.trim()) newErrors.email = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.company.trim()) newErrors.company = true;
    if (!formData.state) newErrors.state = true;
    if (!formData.industry) newErrors.industry = true;
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormState]) {
      setErrors(prev => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setStatus({ type: 'loading' });

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        state: '',
        industry: '',
        applicationDescription: '',
        currentChallenges: '',
        agreeToContact: false,
        agreeToPrivacy: false,
      });

      setStatus({
        type: 'success',
        message: 'Thank you! A WIKUS specialist will contact you shortly.',
      });

      setTimeout(() => {
        setStatus({ type: 'idle' });
      }, 5000);
    } catch (error) {
      console.error('[v0] Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error submitting the form. Please try again.';
      setStatus({
        type: 'error',
        message: errorMessage,
      });
    }
  };;

  const isSubmitting = status.type === 'loading';
  const isSuccess = status.type === 'success';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {isSuccess && (
        <div
          style={{
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            color: '#2e7d32',
            padding: '12px',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {status.message}
        </div>
      )}

      {/* Error Message */}
      {status.type === 'error' && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#c62828',
            padding: '12px',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {status.message}
        </div>
      )}

      {/* First Name */}
      <div>
        <label
          htmlFor="firstName"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          First Name <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: errors.firstName ? '2px solid #f44336' : '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
          }}
          placeholder="John"
        />
      </div>

      {/* Last Name */}
      <div>
        <label
          htmlFor="lastName"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          Last Name <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: errors.lastName ? '2px solid #f44336' : '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
          }}
          placeholder="Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          Email <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: errors.email ? '2px solid #f44336' : '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
          }}
          placeholder="john@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          Phone <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: errors.phone ? '2px solid #f44336' : '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
          }}
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Company */}
      <div>
        <label
          htmlFor="company"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          Company <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: errors.company ? '2px solid #f44336' : '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
          }}
          placeholder="Your Company"
        />
      </div>

      {/* Industry */}
      <div>
        <label
          htmlFor="industry"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          Industry <span style={{ color: '#f44336' }}>*</span>
        </label>
        <select
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: errors.industry ? '2px solid #f44336' : '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
          }}
        >
          <option value="">Select an industry</option>
          <option value="automotive">Automotive</option>
          <option value="aerospace">Aerospace</option>
          <option value="fabrication">Fabrication</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="metalworking">Metalworking</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Application Description */}
      <div>
        <label
          htmlFor="applicationDescription"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          What materials do you typically cut?
        </label>
        <textarea
          id="applicationDescription"
          name="applicationDescription"
          value={formData.applicationDescription}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
            fontFamily: 'Arial, Helvetica, sans-serif',
            minHeight: '80px',
            resize: 'vertical',
          }}
          placeholder="e.g., Stainless steel, aluminum, carbon steel"
        />
      </div>

      {/* Current Challenges */}
      <div>
        <label
          htmlFor="currentChallenges"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333333',
          }}
        >
          What challenges are you facing?
        </label>
        <textarea
          id="currentChallenges"
          name="currentChallenges"
          value={formData.currentChallenges}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '0px',
            boxSizing: 'border-box',
            fontFamily: 'Arial, Helvetica, sans-serif',
            minHeight: '80px',
            resize: 'vertical',
          }}
          placeholder="e.g., Blade breakage, slow cuts, expensive per-cut costs"
        />
      </div>

      {/* Agree to Contact */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <input
          type="checkbox"
          id="agreeToContact"
          name="agreeToContact"
          checked={formData.agreeToContact}
          onChange={handleInputChange}
          style={{
            marginTop: '2px',
            cursor: 'pointer',
          }}
        />
        <label
          htmlFor="agreeToContact"
          style={{
            fontSize: '13px',
            color: '#555555',
            cursor: 'pointer',
            lineHeight: '1.4',
          }}
        >
          Yes, I would like a WIKUS specialist to contact me about my needs.
        </label>
      </div>

      {/* Agree to Privacy */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <input
          type="checkbox"
          id="agreeToPrivacy"
          name="agreeToPrivacy"
          checked={formData.agreeToPrivacy}
          onChange={handleInputChange}
          style={{
            marginTop: '2px',
            cursor: 'pointer',
          }}
        />
        <label
          htmlFor="agreeToPrivacy"
          style={{
            fontSize: '13px',
            color: '#555555',
            cursor: 'pointer',
            lineHeight: '1.4',
          }}
        >
          I agree to the <a href="#" style={{color: '#003366', textDecoration: 'underline'}}>privacy policy</a> and terms of service. <span style={{ color: '#f44336' }}>*</span>
        </label>
      </div>

      {errors.agreeToPrivacy && (
        <div style={{ fontSize: '12px', color: '#f44336' }}>
          You must agree to the privacy policy to continue.
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          backgroundColor: isSubmitting ? '#999999' : '#003366',
          border: 'none',
          borderRadius: '0px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          marginTop: '16px',
        }}
      >
        {isSubmitting ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}
