'use client';

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import DoctorForm from '@/components/admin/DoctorForm';
import { Search, ExternalLink, Calendar, Phone, Building, Stethoscope, ShieldCheck, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
  license_url?: string;
  experience_years?: number;
  clinic?: string;
  joined_date?: string; // ISO string or timestamp
  is_verified: boolean;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'doctors'));
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name || 'N/A',
        specialty: d.data().specialty || 'General',
        email: d.data().email || '',
        phone: d.data().phone || '',
        license_url: d.data().license_url || '',
        experience_years: d.data().experience_years || 0,
        clinic: d.data().clinic || 'Not specified',
        joined_date: d.data().joined_date || new Date().toISOString(),
        is_verified: d.data().is_verified || false,
      } as Doctor));
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.clinic?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  const handleVerificationChange = async (doctorId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'unverify' : 'verify'} this doctor?`)) return;

    try {
      const doctorRef = doc(db, 'doctors', doctorId);
      await updateDoc(doctorRef, { is_verified: !currentStatus });
      setDoctors(prev => prev.map(d =>
        d.id === doctorId ? { ...d, is_verified: !currentStatus } : d
      ));
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Failed to update verification status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctors Management</h1>
          <p className="text-gray-600">Manage and verify registered doctors</p>
        </div>

        {/* Add New Doctor Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-600" />
            Add New Doctor
          </h2>
          {/* Provide a typed onSuccess prop instead of using `any` */}
          <DoctorForm onSuccess={fetchDoctors} />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, specialty, or clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Doctors ({filteredDoctors.length})</h2>
          </div>

          {loading ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 py-4 border-b">
                  <div className="bg-gray-200 h-12 w-12 rounded-full"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No doctors found matching your search.' : 'No doctors registered yet.'}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Doctor</th>
                      <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                      <th className="text-left p-4 font-medium text-gray-700">Specialty</th>
                      <th className="text-left p-4 font-medium text-gray-700">Experience</th>
                      <th className="text-left p-4 font-medium text-gray-700">Clinic</th>
                      <th className="text-left p-4 font-medium text-gray-700">Joined</th>
                      <th className="text-left p-4 font-medium text-gray-700">License</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{doctor.email}</div>
                            {doctor.phone && <div className="text-gray-500 flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" /> {doctor.phone}
                            </div>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {doctor.specialty}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700">
                          {doctor.experience_years ? `${doctor.experience_years} years` : '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{doctor.clinic}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(doctor.joined_date || '')}
                          </div>
                        </td>
                        <td className="p-4">
                          {doctor.license_url ? (
                            <button
                              onClick={() => setSelectedDoctor(doctor)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
                        </td>
                        <td className="p-4">
                          {doctor.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ShieldAlert className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doctor.is_verified}
                              onChange={() => handleVerificationChange(doctor.id, doctor.is_verified)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.email}</p>
                        {doctor.phone && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="w-4 h-4" /> {doctor.phone}
                        </p>}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doctor.is_verified}
                          onChange={() => handleVerificationChange(doctor.id, doctor.is_verified)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Specialty</span>
                        <p className="font-medium">{doctor.specialty}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Experience</span>
                        <p className="font-medium">{doctor.experience_years || 0} years</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Clinic</span>
                        <p className="font-medium text-gray-700">{doctor.clinic}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status</span>
                        <p className={doctor.is_verified ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                          {doctor.is_verified ? "Verified" : "Pending"}
                        </p>
                      </div>
                    </div>

                    {doctor.license_url && (
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="text-green-600 text-sm font-medium"
                      >
                        View License →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* License Modal */}
      {selectedDoctor && selectedDoctor.license_url && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Medical License - {selectedDoctor.name}</h3>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-100">
              <Image
              height={200}
              width={200}
                src={selectedDoctor.license_url}
                alt="Medical License"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="p-4 border-t text-right">
              <a
                href={selectedDoctor.license_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Open in new tab →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}