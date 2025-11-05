'use client';

import { useState } from 'react';

const formTemplate = {
  name: 'Project Proposal',
  fields: [
    { name: 'projectName', label: 'Project Name', type: 'text' },
    { name: 'projectDescription', label: 'Project Description', type: 'textarea' },
    { name: 'startDate', label: 'Start Date', type: 'date' },
  ],
};

export default function FormBuilder({ template = formTemplate, onSubmit }) {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">{template.name}</h2>
      {template.fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          ) : (
            <input
              type={field.type}
              name={field.name}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          )}
        </div>
      ))}
      <button type="submit" className="w-full px-4 py-2 text-white bg-orange-500 rounded-md">
        Submit
      </button>
    </form>
  );
}
