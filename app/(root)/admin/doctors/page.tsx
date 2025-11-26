import DoctorForm from '@/components/admin/DoctorForm';
import { supabase } from '@/lib/supabase';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  license_url: string;
  is_verified: boolean;
};

export default async function DoctorsPage() {
  const { data: doctors } = await supabase.from('doctors').select('*');

  return (
    <div>
      <DoctorForm />
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Doctors List</h2>
        <table className="w-full text-left bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Specialty</th>
              <th className="p-2">Email</th>
              <th className="p-2">License</th>
              <th className="p-2">Verified</th>
            </tr>
          </thead>
          <tbody>
            {doctors?.map((doctor: Doctor) => (
              <tr key={doctor.id} className="border-t">
                <td className="p-2">{doctor.name}</td>
                <td className="p-2">{doctor.specialty}</td>
                <td className="p-2">{doctor.email}</td>
                <td className="p-2">
                  <a href={doctor.license_url} target="_blank" className="text-primary">
                    View License
                  </a>
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={doctor.is_verified}
                    onChange={async () => {
                      await supabase
                        .from('doctors')
                        .update({ is_verified: !doctor.is_verified })
                        .eq('id', doctor.id);
                    }}
                    className="h-4 w-4"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}