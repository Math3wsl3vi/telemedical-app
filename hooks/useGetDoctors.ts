import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Schedule = {
  workingHours?: { start?: string; end?: string } | null;
  workingDays?: number[] | null;
  breaks?: Array<{ start?: string; end?: string; days?: number[] }> | null;
  bookedSlots?: Array<Record<string, unknown>> | null;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  img?: string | null;
  clinic?: string | null;
  experience_years?: number | null;
  license_url?: string | null;
  is_verified?: boolean;
  created_at?: Timestamp | null; // Firestore Timestamp
  joined_date?: string | null; // ISO string
  schedule?: Schedule | null;
  [key: string]: unknown;
};

export default function useGetDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const doctorsCol = collection(db, 'doctors');
      // Try to order by created_at if present, otherwise fallback to default ordering
      const q = query(doctorsCol, orderBy('created_at', 'desc'));
      const snap = await getDocs(q);

      const items: Doctor[] = snap.docs.map(d => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
          name: (data.name as string) ?? '',
          specialty: (data.specialty as string) ?? '',
          email: (data.email as string) ?? '',
          phone: (data.phone as string) ?? null,
          whatsappNumber: (data.whatsappNumber as string) ?? null,
          img: (data.img as string) ?? null,
          clinic: (data.clinic as string) ?? null,
          experience_years: typeof data.experience_years === 'number' ? data.experience_years : (data.experience_years ?? null),
          license_url: (data.license_url as string) ?? null,
          is_verified: (data.is_verified as boolean) ?? false,
          created_at: (data.created_at as Timestamp) ?? null,
          joined_date: (data.joined_date as string) ?? null,
          schedule: (data.schedule as Schedule) ?? null,
          // include any other fields to preserve shape
          ...data,
        } as Doctor;
      });

      setDoctors(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch doctors';
      setError(message);
      console.error('useGetDoctors error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial fetch
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    loading,
    error,
    refresh: fetchDoctors,
  };
}
