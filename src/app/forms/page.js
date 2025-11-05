'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import FormBuilder from '../../components/FormBuilder';

export default function Forms() {
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleFormSubmit = (formData) => {
    console.log('Form submitted:', formData);
    setSubmissionMessage('Form submitted successfully!');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {submissionMessage && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md">
            {submissionMessage}
          </div>
        )}
        <FormBuilder onSubmit={handleFormSubmit} />
      </div>
    </Layout>
  );
}
