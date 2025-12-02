'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface DoctorFormProps {
  onSuccess?: () => void | Promise<void>;
}

export default function DoctorForm({ onSuccess }: DoctorFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    clinic: '',
    experience_years: '',
    license_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const doctorsRef = collection(db, 'doctors');

      await addDoc(doctorsRef, {
        // Basic info
        name: formData.name.trim(),
        specialty: formData.specialty.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        whatsappNumber: formData.whatsappNumber.trim() || null,
        img: formData.img.trim() || null,
        clinic: formData.clinic.trim() || 'Private Practice',
        experience_years: formData.experience_years ? Number(formData.experience_years) : null,
        license_url: formData.license_url.trim() || null,

        // Verification & timestamps
        is_verified: false,
        created_at: serverTimestamp(),
        joined_date: new Date().toISOString(),

        // Full schedule (exactly like your example)
        schedule: {
          workingHours: { start: "08:00", end: "16:00" },
          workingDays: [1, 2, 3, 4, 5], // Monday to Friday
          breaks: [
            { start: "12:00", end: "13:00", days: [1, 2, 3, 4, 5] }
          ],
          bookedSlots: [] // will be filled when patients book
        }
      });

      alert('Doctor added successfully!');
      // Reset form
      setFormData({
        name: '',
        specialty: '',
        email: '',
        phone: '',
        whatsappNumber: '',
        img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
        clinic: '',
        experience_years: '',
        license_url: '',
      });

      if (onSuccess) await onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add doctor';
      setError(message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-800">Add New Doctor</h2>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Dr. Wanjiku Kimani"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialty <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            placeholder="Dermatologist"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="doctor@example.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0712345678"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (optional)</label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            placeholder="+254111971600"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic / Hospital</label>
          <input
            type="text"
            name="clinic"
            value={formData.clinic}
            onChange={handleChange}
            placeholder="Nairobi Skin Clinic"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <input
            type="number"
            name="experience_years"
            value={formData.experience_years}
            onChange={handleChange}
            placeholder="8"
            min="0"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (optional)</label>
          <input
            type="url"
            name="img"
            value={formData.img}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2 border rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Leave default for a nice placeholder</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical License URL (optional)</label>
          <input
            type="url"
            name="license_url"
            value={formData.license_url}
            onChange={handleChange}
            placeholder="https://example.com/license.jpg"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Adding Doctor...' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
}