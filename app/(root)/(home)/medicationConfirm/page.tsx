'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Loader from '@/components/Loader';
import { useToast } from '@/hooks/use-toast';
import { Medication, DoctorNote, saveAppointment } from '@/lib/appointments';

interface AppointmentData {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date;
  description?: string;
  prescription?: {
    medications: Medication[];
    notes: DoctorNote[];
    prescribedAt?: Date;
  };
}

const MedicationConfirmationPage: React.FC = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { toast } = useToast();

  // Debug function to create a test appointment
  const createTestAppointment = async () => {
    if (!user) return;
    
    try {
      const appointmentId = await saveAppointment({
        patientId: user.id,
        patientName: user.fullName || 'Test Patient',
        patientEmail: user.primaryEmailAddress?.emailAddress || 'test@example.com',
        doctorId: 'test-doctor-123',
        doctorName: 'Dr. Jane Smith',
        doctorSpecialty: 'General Practitioner',
        appointmentDate: new Date(),
        meetingId: 'test-meeting-' + Date.now(),
        meetingLink: 'https://example.com/meeting',
        description: 'Test appointment for debugging',
        paymentStatus: 'pending',
        status: 'scheduled',
      });
      
      toast({
        title: "Test Appointment Created!",
        description: `Appointment ID: ${appointmentId}. Reloading page...`
      });
      
      // Reload after 1 second
      setTimeout(() => {
        window.location.href = `/medicationConfirm?appointmentId=${appointmentId}`;
      }, 1000);
    } catch (error) {
      console.error('Error creating test appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create test appointment",
        variant: "destructive"
      });
    }
  };

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!isLoaded || !user) {
        console.log('⏳ Waiting for user to load...', { isLoaded, user: !!user });
        return;
      }

      console.log('👤 User loaded:', user.id, user.fullName);

      try {
        const appointmentId = searchParams.get('appointmentId');
        console.log('🔍 Fetching appointment with ID:', appointmentId || 'none (fetching latest)');
        let appointmentData: AppointmentData | null = null;

        if (appointmentId) {
          // Fetch specific appointment
          console.log('📋 Fetching specific appointment:', appointmentId);
          const appointmentRef = doc(db, 'appointments', appointmentId);
          const appointmentSnap = await getDoc(appointmentRef);
          
          if (appointmentSnap.exists()) {
            console.log('✅ Appointment found:', appointmentSnap.id);
            console.log('📄 Appointment data:', appointmentSnap.data());
            const data = appointmentSnap.data();
            appointmentData = {
              id: appointmentSnap.id,
              patientName: data.patientName || user.fullName || 'Patient',
              patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
              doctorName: data.doctorName,
              doctorSpecialty: data.doctorSpecialty,
              appointmentDate: data.appointmentDate?.toDate() || new Date(),
              description: data.description,
              prescription: data.prescription ? {
                medications: data.prescription.medications || [],
                notes: data.prescription.notes?.map((note: {
                  id: string;
                  content: string;
                  type: string;
                  timestamp: {toDate?: () => Date} | Date;
                }) => ({
                  ...note,
                  timestamp: (note.timestamp as {toDate?: () => Date})?.toDate ? (note.timestamp as {toDate: () => Date}).toDate() : note.timestamp as Date
                })) || [],
                prescribedAt: data.prescription.prescribedAt?.toDate?.() || undefined,
              } : undefined,
            };
          } else {
            console.log('❌ Appointment not found with ID:', appointmentId);
          }
        } else {
          // Fetch most recent appointment
          console.log('🔎 Fetching most recent appointment for user:', user.id);
          const appointmentsRef = collection(db, 'appointments');
          
          // Try without orderBy first to see if it's an index issue
          try {
            const q = query(
              appointmentsRef,
              where('patientId', '==', user.id),
              orderBy('createdAt', 'desc'),
              limit(1)
            );
            console.log('📊 Executing query with orderBy...');
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              console.log('✅ Found appointment:', querySnapshot.docs[0].id);
              console.log('📄 Appointment data:', querySnapshot.docs[0].data());
              const data = querySnapshot.docs[0].data();
              appointmentData = {
                id: querySnapshot.docs[0].id,
                patientName: data.patientName || user.fullName || 'Patient',
                patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
                doctorName: data.doctorName,
                doctorSpecialty: data.doctorSpecialty,
                appointmentDate: data.appointmentDate?.toDate() || new Date(),
                description: data.description,
                prescription: data.prescription ? {
                  medications: data.prescription.medications || [],
                  notes: data.prescription.notes?.map((note: {
                    id: string;
                    content: string;
                    type: string;
                    timestamp: {toDate?: () => Date} | Date;
                  }) => ({
                    ...note,
                    timestamp: (note.timestamp as {toDate?: () => Date})?.toDate ? (note.timestamp as {toDate: () => Date}).toDate() : note.timestamp as Date
                  })) || [],
                  prescribedAt: data.prescription.prescribedAt?.toDate?.() || undefined,
                } : undefined,
              };
            } else {
              console.log('❌ No appointments found for user');
            }
          } catch (indexError) {
            console.warn('⚠️ Index error, trying without orderBy:', indexError);
            // Fallback: query without orderBy if index doesn't exist
            const qSimple = query(
              appointmentsRef,
              where('patientId', '==', user.id),
              limit(1)
            );
            console.log('📊 Executing simple query without orderBy...');
            const querySnapshot = await getDocs(qSimple);
            
            if (!querySnapshot.empty) {
              console.log('✅ Found appointment (no ordering):', querySnapshot.docs[0].id);
              console.log('📄 Appointment data:', querySnapshot.docs[0].data());
              const data = querySnapshot.docs[0].data();
              appointmentData = {
                id: querySnapshot.docs[0].id,
                patientName: data.patientName || user.fullName || 'Patient',
                patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
                doctorName: data.doctorName,
                doctorSpecialty: data.doctorSpecialty,
                appointmentDate: data.appointmentDate?.toDate() || new Date(),
                description: data.description,
                prescription: data.prescription ? {
                  medications: data.prescription.medications || [],
                  notes: data.prescription.notes?.map((note: {
                    id: string;
                    content: string;
                    type: string;
                    timestamp: {toDate?: () => Date} | Date;
                  }) => ({
                    ...note,
                    timestamp: (note.timestamp as {toDate?: () => Date})?.toDate ? (note.timestamp as {toDate: () => Date}).toDate() : note.timestamp as Date
                  })) || [],
                  prescribedAt: data.prescription.prescribedAt?.toDate?.() || undefined,
                } : undefined,
              };
            }
          }
        }

        if (!appointmentData) {
          console.log('No appointment data found, using sample data');
          // Create sample appointment data so user can still proceed
          appointmentData = {
            id: 'sample-' + Date.now(),
            patientName: user.fullName || 'Patient',
            patientEmail: user.primaryEmailAddress?.emailAddress || '',
            doctorName: 'Dr. Sarah Kamau',
            doctorSpecialty: 'General Practitioner',
            appointmentDate: new Date(),
            description: 'Sample consultation',
          };
          toast({
            title: "Using Sample Data",
            description: "No appointment found. You can still view and proceed with sample medications.",
          });
        }

        setAppointment(appointmentData);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast({
          title: "Error",
          description: `Could not load appointment details: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Medication Confirmation</h2>
          
          {/* Debug Button - Only show in development */}
          {process.env.NODE_ENV === 'development' && !appointment?.id.startsWith('sample-') && (
            <button
              onClick={createTestAppointment}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition"
            >
              🧪 Create Test Appointment
            </button>
          )}
        </div>

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
              <span className={`px-3 py-1 ${appointment?.prescription ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} text-sm font-medium rounded-full flex items-center gap-2`}>
                <span className={`w-2 h-2 ${appointment?.prescription ? 'bg-green-500' : 'bg-orange-500 animate-pulse'} rounded-full`}></span>
                {appointment?.prescription ? 'Prescribed' : 'Pending'}
              </span>
            </div>

            {appointment?.prescription && appointment.prescription.medications.length > 0 ? (
              <div className="space-y-4 bg-gray-50 p-5 rounded-lg">
                {appointment.prescription.medications.map((med) => (
                  <div key={med.id} className="bg-white p-4 rounded border border-gray-200">
                    <p className="font-medium text-gray-900">
                      {med.name} - {med.strength}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Dosage: {med.dosage}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>Duration: {med.duration}</span>
                      <span>Quantity: {med.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                <p className="text-sm text-gray-500 text-center pt-2">Sample medications (Doctor has not prescribed yet)</p>
              </div>
            )}

            {/* Doctor's Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
              {"Doctor's"} Notes
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
                {appointment?.prescription && appointment.prescription.notes.length > 0 ? (
                  <div className="space-y-3">
                    {appointment.prescription.notes.map((note) => (
                      <div key={note.id} className="pb-3 border-b last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                            note.type === 'diagnosis' ? 'bg-red-100 text-red-700' :
                            note.type === 'plan' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {note.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {note.timestamp instanceof Date ? note.timestamp.toLocaleTimeString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Patient is advised to complete full course of antibiotics.</p>
                )}
              </div>
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