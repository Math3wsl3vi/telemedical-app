'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Loader from '@/components/Loader';
import { useToast } from '@/hooks/use-toast';

interface AppointmentData {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date;
  description?: string;
}

const MedicationConfirmationPage: React.FC = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { toast } = useToast();

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!isLoaded || !user) return;

      try {
        const appointmentId = searchParams.get('appointmentId');
        let appointmentData: AppointmentData | null = null;

        if (appointmentId) {
          // Fetch specific appointment
          const appointmentRef = doc(db, 'appointments', appointmentId);
          const appointmentSnap = await getDoc(appointmentRef);
          
          if (appointmentSnap.exists()) {
            const data = appointmentSnap.data();
            appointmentData = {
              id: appointmentSnap.id,
              patientName: data.patientName || user.fullName || 'Patient',
              patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
              doctorName: data.doctorName,
              doctorSpecialty: data.doctorSpecialty,
              appointmentDate: data.appointmentDate?.toDate() || new Date(),
              description: data.description,
            };
          }
        } else {
          // Fetch most recent appointment
          const appointmentsRef = collection(db, 'appointments');
          const q = query(
            appointmentsRef,
            where('patientId', '==', user.id),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            appointmentData = {
              id: querySnapshot.docs[0].id,
              patientName: data.patientName || user.fullName || 'Patient',
              patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
              doctorName: data.doctorName,
              doctorSpecialty: data.doctorSpecialty,
              appointmentDate: data.appointmentDate?.toDate() || new Date(),
              description: data.description,
            };
          }
        }

        setAppointment(appointmentData);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast({
          title: "Error",
          description: "Could not load appointment details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [isLoaded, user, searchParams, toast]);

  const handleConfirm = () => {
    if (appointment) {
      router.push(`/paymentConfirm?appointmentId=${appointment.id}`);
    } else {
      router.push('/paymentConfirm');
    }
  };

  if (!isLoaded || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Medication Confirmation</h2>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Patient Information */}
          <section className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-500">Patient Name</p>
                <p className="font-medium text-gray-900">{appointment?.patientName || user?.fullName || 'Patient'}</p>
              </div>
              <div>
                <p className="text-gray-500">Appointment ID</p>
                <p className="font-medium text-gray-900">{appointment?.id.slice(-5).toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {appointment?.appointmentDate.toLocaleDateString() || new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Doctor</p>
                <p className="font-medium text-gray-900">{appointment?.doctorName || 'Dr. Unknown'}</p>
              </div>
            </div>
          </section>

          {/* Prescribed Medication */}
          <section className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-gray-700">Prescribed Medication</h3>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Pending
              </span>
            </div>

            <div className="space-y-4 bg-gray-50 p-5 rounded-lg">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="font-medium text-gray-900">
                  Amoxicillin, 500mg, 3 times daily, 7 days
                </p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="font-medium text-gray-900">
                  Ibuprofen, 400mg, as needed for pain
                </p>
              </div>
            </div>

            {/* Doctor's Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
              {"Doctor's"} Notes
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                defaultValue="Patient is advised to complete full course of antibiotics."
                readOnly
              />
            </div>
          </section>

          {/* Confirmation Checkbox & Button */}
          <section className="p-6 bg-gray-50">
            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                id="confirm-medication"
                className="mt-1 h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                checked={confirmed}
                onChange={() => setConfirmed((prev) => !prev)}
              />
              <label htmlFor="confirm-medication" className="text-sm text-gray-700">
                I confirm these medications are correct
              </label>
            </div>

            <button
              disabled={!confirmed}
              onClick={handleConfirm}
              className={`w-full md:w-auto px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${!confirmed ? 'disabled:bg-gray-400 disabled:cursor-not-allowed' : ''} transition`}
            >
              Confirm Medication
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MedicationConfirmationPage;