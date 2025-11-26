'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Appointment = {
  id: string;
  doctor_id: string;
  patient_name: string;
  appointment_date: string;
  amount: number;
  status: string;
  doctors: { name: string };
};

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name)')
        .order('appointment_date', { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setAppointments(data);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Doctor</th>
            <th className="p-2">Patient</th>
            <th className="p-2">Date</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id} className="border-t">
              <td className="p-2">{appt.doctors.name}</td>
              <td className="p-2">{appt.patient_name}</td>
              <td className="p-2">{new Date(appt.appointment_date).toLocaleString()}</td>
              <td className="p-2">${appt.amount}</td>
              <td className="p-2">{appt.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}