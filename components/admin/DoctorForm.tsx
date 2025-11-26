'use client';
import { useState } from 'react';
import { supabaseService } from '@/lib/supabase';

export default function DoctorForm() {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);

  try {
    const { error: insertError } = await supabaseService
      .from('doctors')
      .insert({
        name: formData.name,
        specialty: formData.specialty,
        email: formData.email,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Failed to add doctor: ${insertError.message}`);
    }

    alert('Doctor added successfully');
    setFormData({ name: '', specialty: '', email: '' });
  } catch (err: unknown) {
    // Type-safe narrowing
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }

    console.error('Error in handleSubmit:', err);
  } finally {
    setSubmitting(false);
  }
};
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Doctor</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Specialty</label>
        <input
          type="text"
          value={formData.specialty}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Add Doctor'}
      </button>
    </form>
  );
}
