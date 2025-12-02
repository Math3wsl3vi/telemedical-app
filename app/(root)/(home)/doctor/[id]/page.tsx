// app/doctor/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Bell,
  ChevronRight,
  HeartPulse,
  Brain,
  Stethoscope,
  Baby,
  MapPin,
  Phone,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  img: string;
  phone: string;
  whatsappNumber: string;
  experience_years: number;
  clinic: string;
  schedule: {
    workingDays: number[];
    workingHours: { start: string; end: string };
    breaks: Array<{ days: number[]; start: string; end: string }>;
  };
}

interface Appointment {
  id: string;
  appointmentDate: Timestamp; // Firestore Timestamp
  patientName: string;
  patientEmail: string;
  status: string;
  meetingLink?: string;
  doctorSpecialty?: string;
}

export default function DoctorPage() {
  const { id } = useParams() as { id: string };
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // === Fetch Doctor ===
        // Prefer top-level `doctors` collection (used elsewhere in the app). If not
        // found there, fall back to searching clinic subcollections (older structure).
  const doctorRef = doc(db, "doctors", id);
        let doctorSnap = await getDoc(doctorRef);

        if (!doctorSnap.exists()) {
          // Fallback: iterate clinics and look for the doctor inside clinics/{clinicId}/doctors/{id}
          try {
            const clinicsSnapshot = await getDocs(collection(db, "clinics"));
            for (const clinicDoc of clinicsSnapshot.docs) {
              const candidateRef = doc(db, "clinics", clinicDoc.id, "doctors", id);
              const candidateSnap = await getDoc(candidateRef);
              if (candidateSnap.exists()) {
                doctorSnap = candidateSnap;
                break;
              }
            }
          } catch (fallbackErr) {
            console.warn("Error while searching clinics fallback:", fallbackErr);
          }
        }

        if (!doctorSnap.exists()) {
          // Not found in any expected location
          setLoading(false);
          return;
        }

        const docData = { id: doctorSnap.id, ...doctorSnap.data() } as Doctor;
        setDoctor(docData);

        // === Fetch Appointments ===
        const apptsQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", id),
          where("status", "in", ["scheduled", "confirmed", "completed"]),
          orderBy("appointmentDate", "asc")
        );

        const apptSnapshot = await getDocs(apptsQuery);
        const appts = apptSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Appointment[];

        setAppointments(appts);
      } catch (err) {
        console.error("Error loading doctor/appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Format Firestore Timestamp
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "—";
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const today = new Date().toDateString();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Not Found</h1>
          <p className="text-gray-600">The requested doctor profile does not exist.</p>
        </div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(
    (a) => a.appointmentDate?.toDate().toDateString() === today
  );

  // const upcomingAppointments = appointments.filter(
  //   (a) =>
  //     a.appointmentDate?.toDate() > new Date() &&
  //     a.appointmentDate?.toDate().toDateString() !== today
  // );

  const workingDays = doctor.schedule?.workingDays || [1, 2, 3, 4, 5];
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 font-poppins">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Profile Card */}
        <Card className="p-8 bg-white shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 rounded-full border-4 border-green-100 overflow-hidden shadow-md">
              <Image
                src={doctor.img || "/images/user.png"}
                alt={doctor.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
              <p className="text-xl text-green-600 font-medium mt-1 capitalize">
                {doctor.specialty}
              </p>
              <p className="text-gray-600 mt-2">
                {doctor.experience_years} years of experience
              </p>

              <div className="flex flex-wrap gap-6 mt-5 text-gray-600">
                <span className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  {doctor.whatsappNumber || doctor.phone}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  {doctor.clinic}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8">
                Start Consultation
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Medical Services */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Medical Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Dermatology", icon: <HeartPulse className="h-7 w-7" />, path: "/doctor/dermatology" },
              { title: "Mental Health", icon: <Brain className="h-7 w-7" />, path: "/doctor/mental-health" },
              { title: "Regular Checkup", icon: <Stethoscope className="h-7 w-7" />, path: "/doctor/checkup" },
              { title: "Prenatal Care", icon: <Baby className="h-7 w-7" />, path: "/doctor/prenatal-care" },
            ].map((service) => (
              <Card
                key={service.title}
                className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-600 bg-white hover:bg-green-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage {service.title.toLowerCase()} cases</p>
                  </div>
                  <div className="text-green-600 bg-green-100 p-3 rounded-lg">
                    {service.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Appointments + Schedule */}
          <div className="lg:col-span-2 space-y-8">

            {/* Today's Appointments */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-green-600" />
                Today&apos;s Appointments
              </h2>
              {todayAppointments.length === 0 ? (
                <Card className="p-10 text-center border-dashed">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appt) => (
                    <Card key={appt.id} className="p-6 hover:border-green-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appt.patientName}</h3>
                          <p className="text-sm text-gray-600">{appt.patientEmail}</p>
                          <div className="flex gap-6 mt-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTime(appt.appointmentDate)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-2">
                            {appt.status}
                          </Badge>
                          {appt.meetingLink && (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(appt.meetingLink, "_blank")}
                            >
                              Join Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Schedule */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-3">
                <Clock className="h-6 w-6 text-green-600" />
                Weekly Schedule
              </h2>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Office Hours</h3>
                  <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                    Edit Schedule
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {days.map((day, i) => {
                    const isWorking = workingDays.includes(i);
                    const hours = isWorking
                      ? doctor.schedule?.workingHours
                        ? `${doctor.schedule.workingHours.start} - ${doctor.schedule.workingHours.end}`
                        : "08:00 - 16:00"
                      : "OFF";

                    return (
                      <div
                        key={day}
                        className={`text-center p-4 rounded-lg border ${
                          isWorking
                            ? "bg-green-50 border-green-300 text-gray-900"
                            : "bg-gray-50 border-gray-300 text-gray-500"
                        }`}
                      >
                        <div className="font-semibold text-sm">{day}</div>
                        <div className="text-xs mt-1">{hours}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">

            {/* Recent Patients */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-3">
                <Users className="h-6 w-6 text-green-600" />
                Recent Patients
              </h2>
              <Card>
                <div className="divide-y">
                  {appointments.slice(0, 4).map((appt) => (
                    <div key={appt.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{appt.patientName}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(appt.appointmentDate)} at {formatTime(appt.appointmentDate)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-2 text-green-600">
                  View all patients
                </Button>
              </Card>
            </div>

            {/* Notifications */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-3">
                <Bell className="h-6 w-6 text-green-600" />
                Notifications
              </h2>
              <Card className="p-5">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">New appointment booked</p>
                      <p className="text-xs text-gray-500">Levi Mathews - Dec 3, 2025</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Prescription ready</p>
                      <p className="text-xs text-gray-500">For patient Alex Johnson</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4 text-green-600">
                  View all notifications
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}