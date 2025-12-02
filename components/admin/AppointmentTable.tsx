'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';

type Appointment = {
  id: string;
  doctorName: string;
  patientName: string;
  appointmentDate: Date;          // We'll convert Timestamp → Date
  status: string;
  paymentStatus: string;
  doctorSpecialty?: string;
  meetingLink?: string;
};

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRef = collection(db, 'appointments');

        // Order by newest appointment first
        const q = query(appointmentsRef, orderBy('appointmentDate', 'desc'));

        const snapshot = await getDocs(q);

        const data: Appointment[] = snapshot.docs.map((doc) => {
          const d = doc.data();

          return {
            id: doc.id,
            doctorName: d.doctorName ?? '—',
            patientName: d.patientName ?? '—',
            appointmentDate: d.appointmentDate?.toDate() ?? new Date(),
            status: d.status ?? 'unknown',
            paymentStatus: d.paymentStatus ?? 'pending',
            doctorSpecialty: d.doctorSpecialty,
            meetingLink: d.meetingLink,
          };
        });

        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Helper to format the date nicely
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Appointments</h2>

      {loading && (
        <p className="text-gray-500 text-center py-8">Loading appointments…</p>
      )}

      {!loading && appointments.length === 0 && (
        <p className="text-gray-500 text-center py-8">No appointments found.</p>
      )}

      {!loading && appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm uppercase tracking-wider">
                <th className="p-4">Doctor</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Appointment Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{appt.doctorName}</div>
                      <div className="text-sm text-gray-500">
                        {appt.doctorSpecialty || 'Specialty not set'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{appt.patientName}</td>
                  <td className="p-4">{formatDate(appt.appointmentDate)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appt.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appt.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appt.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {appt.meetingLink && (
                      <a
                        href={appt.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        Join Meeting
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}