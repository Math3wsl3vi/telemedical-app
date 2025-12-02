import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, getDoc, Timestamp } from 'firebase/firestore';

export interface Appointment {
  patientId: string;
  patientName?: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date | Timestamp;
  meetingId: string;
  meetingLink: string;
  description?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  phoneNumber?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  prescription?: Prescription;
}

export interface Medication {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  duration: string;
  quantity: string;
  price?: number;
}

export interface DoctorNote {
  id: string;
  timestamp: Date | Timestamp;
  content: string;
  type: 'diagnosis' | 'observation' | 'plan';
}

export interface Prescription {
  medications: Medication[];
  notes: DoctorNote[];
  doctorNotes?: string;
  prescribedAt?: Timestamp;
  prescribedBy?: string;
}

/**
 * Save a new appointment to Firestore
 */
export const saveAppointment = async (appointmentData: Appointment): Promise<string> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    
    const docData = {
      ...appointmentData,
      appointmentDate: appointmentData.appointmentDate instanceof Date 
        ? Timestamp.fromDate(appointmentData.appointmentDate)
        : appointmentData.appointmentDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: appointmentData.status || 'scheduled',
    };

    // Remove undefined fields - Firestore doesn't allow undefined values
    Object.keys(docData).forEach(key => {
      if (docData[key as keyof typeof docData] === undefined) {
        delete docData[key as keyof typeof docData];
      }
    });

    const docRef = await addDoc(appointmentsRef, docData);
    console.log('Appointment saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving appointment:', error);
    throw new Error('Failed to save appointment');
  }
};

/**
 * Get all appointments for a specific patient
 */
export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('patientId', '==', patientId));
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        ...doc.data() as Appointment,
      });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
};

/**
 * Get all appointments for a specific doctor
 */
export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        ...doc.data() as Appointment,
      });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'scheduled' | 'completed' | 'cancelled'
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    console.log('Appointment status updated:', appointmentId);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
};

/**
 * Update appointment payment status
 */
export const updateAppointmentPaymentStatus = async (
  appointmentId: string,
  paymentStatus: 'pending' | 'completed' | 'failed'
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      paymentStatus,
      updatedAt: Timestamp.now(),
    });
    console.log('Appointment payment status updated:', appointmentId);
  } catch (error) {
    console.error('Error updating appointment payment status:', error);
    throw new Error('Failed to update appointment payment status');
  }
};

/**
 * Get all booked appointment times for a specific doctor
 * Returns ISO string dates of booked appointments
 */
export const getBookedTimeSlotsForDoctor = async (doctorId: string): Promise<string[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('status', 'in', ['scheduled', 'confirmed', 'completed'])
    );
    const querySnapshot = await getDocs(q);

    const bookedTimes: string[] = [];
    querySnapshot.forEach((doc) => {
      const appointmentData = doc.data() as Appointment;
      if (appointmentData.appointmentDate) {
        let dateToAdd: Date;
        
        // Handle both Timestamp and Date objects
        if (appointmentData.appointmentDate instanceof Timestamp) {
          dateToAdd = appointmentData.appointmentDate.toDate();
        } else if (appointmentData.appointmentDate instanceof Date) {
          dateToAdd = appointmentData.appointmentDate;
        } else {
          return; // Skip if invalid format
        }
        
        bookedTimes.push(dateToAdd.toISOString());
      }
    });

    return bookedTimes;
  } catch (error) {
    console.error('Error fetching booked time slots for doctor:', error);
    // Return empty array on error so appointments can still be booked
    return [];
  }
};

/**
 * Save or update prescription for an appointment
 */
export const savePrescription = async (
  appointmentId: string,
  prescription: Prescription,
  doctorId: string
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    // Convert any Date objects in notes to Timestamps
    const prescriptionData = {
      ...prescription,
      notes: prescription.notes.map(note => ({
        ...note,
        timestamp: note.timestamp instanceof Date 
          ? Timestamp.fromDate(note.timestamp)
          : note.timestamp
      })),
      prescribedAt: Timestamp.now(),
      prescribedBy: doctorId,
    };
    
    await updateDoc(appointmentRef, {
      prescription: prescriptionData,
      updatedAt: Timestamp.now(),
    });
    
    console.log('Prescription saved successfully for appointment:', appointmentId);
  } catch (error) {
    console.error('Error saving prescription:', error);
    throw new Error('Failed to save prescription');
  }
};

/**
 * Get prescription for an appointment
 */
export const getPrescription = async (appointmentId: string): Promise<Prescription | null> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (appointmentSnap.exists()) {
      const data = appointmentSnap.data();
      return data.prescription || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching prescription:', error);
    throw new Error('Failed to fetch prescription');
  }
};
