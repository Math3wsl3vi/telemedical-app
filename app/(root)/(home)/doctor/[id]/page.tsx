"use client";

import Image from "next/image";
import React from "react";
import { DocData } from "@/constants";
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
  Phone
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { use } from "react";

export interface DoctorData {
  id: string;
  name: string;
  img: string;
  spec: string;
  whatsappNumber: string;
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ServiceCard = ({ title, description, icon, onClick }: ServiceCardProps) => (
  <Card 
    className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-[3px] border-l-green-600 bg-white hover:bg-green-50"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-base font-semibold text-gray-900 mb-2">{title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="text-green-600 bg-green-100 p-3 ml-4">
        {icon}
      </div>
    </div>
  </Card>
);

interface AppointmentCardProps {
  patientName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const AppointmentCard = ({ patientName, specialty, date, time, status }: AppointmentCardProps) => (
  <Card className="p-5 border border-gray-200 hover:border-green-300 transition-colors">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base mb-1">{patientName}</h3>
        <p className="text-sm text-gray-700 mb-2">{specialty}</p>
        <div className="flex items-center text-sm text-gray-600 space-x-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {date}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {time}
          </span>
        </div>
      </div>
      <Badge className={`px-3 py-1 text-xs ${
        status === 'upcoming' 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-gray-100 text-gray-800 border-gray-200'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
  </Card>
);

type DoctorParams = Promise<{ id: string }>;

const Doctor = ({ params }: { params: DoctorParams }) => {
  // Unwrap the params Promise using React.use()
  const { id: doctorId } = use(params);
  const docData = DocData.find((doc) => doc.id.toString() === doctorId);
  const router = useRouter();

  if (!docData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Doctor not found</h1>
          <p className="text-gray-600">The requested doctor profile could not be found.</p>
        </div>
      </div>
    );
  }

  const services = [
    {
      title: 'Dermatology',
      description: 'Manage dermatology consultations and patient cases',
      icon: <HeartPulse className="h-6 w-6" />,
      path: '/doctor/dermatology',
    },
    {
      title: 'Mental Health',
      description: 'Manage therapy sessions and mental health consultations',
      icon: <Brain className="h-6 w-6" />,
      path: '/doctor/mental-health',
    },
    {
      title: 'Regular Checkup',
      description: 'Manage general checkups and follow-up appointments',
      icon: <Stethoscope className="h-6 w-6" />,
      path: '/doctor/checkup',
    },
    {
      title: 'Infant & Prenatal Care',
      description: 'Manage prenatal and infant care consultations',
      icon: <Baby className="h-6 w-6" />,
      path: '/doctor/prenatal-care',
    },
  ];

  const upcomingAppointments = [
    {
      patientName: 'Alex Johnson',
      specialty: 'Dermatology',
      date: 'Aug 15, 2023',
      time: '10:30 AM',
      status: 'upcoming',
    },
    {
      patientName: 'Emma Rodriguez',
      specialty: 'Psychiatry',
      date: 'Aug 15, 2023',
      time: '11:30 AM',
      status: 'upcoming',
    },
  ];

  const recentPatients = [
    {
      name: 'Sam Wilson',
      lastVisit: 'Aug 10, 2023',
      condition: 'Eczema',
    },
    {
      name: 'Jamie Lee',
      lastVisit: 'Aug 8, 2023',
      condition: 'Anxiety',
    },
    {
      name: 'Taylor Smith',
      lastVisit: 'Aug 5, 2023',
      condition: 'Prenatal Checkup',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-8 py-6 font-poppins">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Doctor Profile Card */}
        <Card className="p-8 shadow-sm border border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 border-2 border-green-200 overflow-hidden">
              <Image
                src={docData.img || "/images/user.png"}
                alt="doctor"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-semibold text-2xl text-gray-900 mb-2">
                Dr. {docData.name}
              </h1>
              <p className="text-lg text-green-600 font-medium mb-3">{docData.spec}</p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <span className="flex items-center justify-center md:justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  {docData.whatsappNumber}
                </span>
                <span className="flex items-center justify-center md:justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  General Hospital - Floor 3, Room 304
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                Start Consultation
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Service Cards */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Services</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  onClick={() => router.push(service.path)}
                />
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Appointments */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-green-600" />
                  Today&apos;s Appointments
                </h2>
                <div className="space-y-3">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment, index) => (
                      <AppointmentCard
                        key={index}
                        patientName={appointment.patientName}
                        specialty={appointment.specialty}
                        date={appointment.date}
                        time={appointment.time}
                        status={appointment.status}
                      />
                    ))
                  ) : (
                    <Card className="p-8 text-center border border-gray-200">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-lg font-medium">No appointments scheduled for today</p>
                      <p className="text-gray-400 text-sm mt-1">All appointments are completed or rescheduled</p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Availability Settings */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-green-600" />
                  Weekly Schedule
                </h2>
                <Card className="p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-base">Office Hours</h3>
                      <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                        Edit Schedule
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => (
                        <div
                          key={day}
                          className={`text-center p-3 border ${
                            ['THU', 'SAT', 'SUN'].includes(day)
                              ? 'bg-gray-50 border-gray-300 text-gray-500'
                              : 'bg-green-50 border-green-300 text-gray-900'
                          }`}
                        >
                          <div className="font-semibold text-sm mb-1">{day}</div>
                          <div className="text-xs">
                            {['THU', 'SAT', 'SUN'].includes(day) 
                              ? 'OFF' 
                              : index === 4 
                                ? '9:00 - 15:00' 
                                : '9:00 - 17:00'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Patients */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-3 text-green-600" />
                  Recent Patients
                </h2>
                <Card className="border border-gray-200">
                  <div className="divide-y divide-gray-200">
                    {recentPatients.map((patient, index) => (
                      <div
                        key={index}
                        className="py-4 px-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{patient.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Last visit: {patient.lastVisit}
                            </span>
                            <Badge className="text-xs bg-gray-100 text-gray-800 border-gray-300">
                              {patient.condition}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 mt-1 border-t border-gray-200">
                    <Button variant="ghost" size="sm" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50">
                      View all patients
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Notifications */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-3 text-green-600" />
                  Notifications
                </h2>
                <Card className="border border-gray-200">
                  <div className="space-y-4 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 bg-green-600"></div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          New patient referral
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Maria Garcia - Dermatology</p>
                        <p className="text-xs text-gray-400">30 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 bg-green-600"></div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Prescription renewal request
                        </p>
                        <p className="text-xs text-gray-500 mt-1">David Kim - Medication refill</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="pt-3 mt-2 border-t border-gray-200">
                      <Button variant="ghost" size="sm" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50">
                        View all notifications
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctor;