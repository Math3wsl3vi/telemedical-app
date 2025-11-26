"use client";

import Image from "next/image";
import React, { ReactNode, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ReactDatePicker from "react-datepicker";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useGetCallById } from "@/hooks/UseGetCallById";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Filter,
  ChevronRight,
  Heart,
  Stethoscope,
  Activity,
  Users
} from 'lucide-react';
import { DocData } from "@/constants";

// Enhanced Doctor type with schedule
type Doctor = {
  id: string;
  name: string;
  spec: string;
  img: string;
  whatsappNumber?: string;
  schedule: DoctorSchedule;
};

type DoctorSchedule = {
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  breaks: {
    start: string;
    end: string;
    days: number[];
  }[];
  bookedSlots: string[]; // ISO string dates
};

interface ServiceCardProps {
  title: string;
  icon: ReactNode;
  count: number | string;
}

// Utility functions for schedule management
const isDoctorAvailable = (doctor: Doctor, date: Date): boolean => {
  const day = date.getDay();
  const time = date.toTimeString().slice(0, 5);
  
  // Check if it's a working day
  if (!doctor.schedule.workingDays.includes(day)) return false;
  
  // Check if within working hours
  if (time < doctor.schedule.workingHours.start || time >= doctor.schedule.workingHours.end) {
    return false;
  }
  
  // Check if during break
  const isBreak = doctor.schedule.breaks.some(breakTime => 
    breakTime.days.includes(day) && 
    time >= breakTime.start && 
    time < breakTime.end
  );
  
  if (isBreak) return false;
  
  // Check if slot is already booked
  const isBooked = doctor.schedule.bookedSlots.some(bookedSlot => {
    const bookedDate = new Date(bookedSlot);
    return bookedDate.getTime() === date.getTime();
  });
  
  if (isBooked) return false;
  
  return true;
};

const getAvailableTimeSlots = (doctor: Doctor, date: Date): string[] => {
  if (!doctor.schedule.workingDays.includes(date.getDay())) {
    return [];
  }

  const slots: string[] = [];
  const startTime = new Date(date);
  const endTime = new Date(date);
  
  const [startHour, startMinute] = doctor.schedule.workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = doctor.schedule.workingHours.end.split(':').map(Number);
  
  startTime.setHours(startHour, startMinute, 0, 0);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    if (isDoctorAvailable(doctor, new Date(currentTime))) {
      slots.push(currentTime.toTimeString().slice(0, 5));
    }
    currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots
  }
  
  return slots;
};

const isDateDisabled = (doctor: Doctor, date: Date): boolean => {
  const day = date.getDay();
  
  // Check if it's a working day
  if (!doctor.schedule.workingDays.includes(day)) return true;
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return true;
  
  return false;
};

const getDayName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
};

// Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const ServiceCard: React.FC<ServiceCardProps> = ({ title, icon, count }) => (
  <Card className="p-5 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-600">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
      </div>
      <div className="text-green-600 bg-green-50 p-3 rounded-lg">
        {icon}
      </div>
    </div>
  </Card>
);

const DoctorCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [values, setValues] = useState({
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [doctors, setDoctors] = useState<Doctor[]>(DocData);

  const router = useRouter();
  const { user } = useUser();
  const meetingId = user?.id;
  const client = useStreamVideoClient();
  const { toast } = useToast();
  const { call } = useGetCallById(meetingId!);

  const meetingLink = `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/meeting/${meetingId!}?personal=true`;

  const openDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime("");
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSchedule = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }

    // Create final datetime
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const finalDateTime = new Date(selectedDate);
    finalDateTime.setHours(hours, minutes, 0, 0);

    // Update doctor's booked slots in the state
    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        return {
          ...doctor,
          schedule: {
            ...doctor.schedule,
            bookedSlots: [...doctor.schedule.bookedSlots, finalDateTime.toISOString()]
          }
        };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(doc => doc.id === selectedDoctor.id) || null);

    setIsConfirmationOpen(true);
    closeDialog();
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    toast({ title: "Appointment booked successfully!" });
  };

  const startRoom = async () => {
    if (!client || !user || !selectedDoctor) {
      toast({ title: "Missing information to start the room.", variant: "destructive" });
      return;
    }

    try {
      if (!call) {
        const newCall = client.call("default", meetingId!);
        await newCall.getOrCreate({
          data: { starts_at: new Date().toISOString() },
        });
        toast({ title: "Room created successfully!" });
      }

      const whatsappMessage = `Hello ${selectedDoctor.name},

Your meeting is ready to start. The patient is already on the call waiting.
      
👉 Click here to join:
${meetingLink.startsWith('http') ? meetingLink : `https://${meetingLink}`}
      
Please join as soon as possible.`;

      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedDoctor.whatsappNumber, message: whatsappMessage }),
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: "Appointment Request Sent .A doctor will be with you shortly" });
      } else {
        toast({ title: "Failed to send WhatsApp message.", variant: "destructive" });
      }

      router.push(`/meeting/${meetingId}?personal=true`);
    } catch (error) {
      console.error("Error starting the room:", error);
      toast({ title: "An error occurred while starting the room.", variant: "destructive" });
    }
  };

  const services = [
    { title: 'Total Doctors', icon: <Stethoscope className="w-6 h-6" />, count: doctors.length.toString() },
    { title: 'Available Today', icon: <Users className="w-6 h-6" />, count: doctors.filter(doc => 
      doc.schedule.workingDays.includes(new Date().getDay())
    ).length.toString() },
    { title: 'Specialties', icon: <Activity className="w-6 h-6" />, count: '6' },
    { title: 'Booked Today', icon: <Calendar className="w-6 h-6" />, count: '12' },
  ];

  const specialties = [
    'All Specialties',
    'Dermatologist',
    'Psychiatrist',
    'Psychologist',
    'Counseling Psychologist',
    'Pediatrician',
    'Nutritionist',
    'Dietitian',
    'Clinical Nutritionist',
    'General Practitioner',
    'Family Medicine Specialist',
  ];

  // Filter doctors based on search query and selected specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.spec.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = 
      selectedSpecialty === 'All Specialties' || doctor.spec === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorClick = (id: string) => {
    router.push(`/doctor/${id}`);
  };

  // Get available time slots for selected doctor and date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    return getAvailableTimeSlots(selectedDoctor, selectedDate);
  }, [selectedDoctor, selectedDate]);

  // Check if current date has available slots
  const hasAvailableSlotsToday = (doctor: Doctor) => {
    const today = new Date();
    return getAvailableTimeSlots(doctor, today).length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 md:px-16 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Find the Right <span className="text-green-600">Doctor</span> for You
            </h1>
            <p className="mt-2 text-gray-600">
              Book appointments with top-rated healthcare professionals
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>

          {/* Search and Filter */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-3 border border-gray-200">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor name, specialty, or hospital..."
                  className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium border border-gray-200 transition-colors">
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button 
                onClick={() => setSearchQuery("")} 
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                Clear Search
              </button>
            </div>

            {/* Specialty Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    specialty === selectedSpecialty
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </Card>

          {/* Doctors Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Doctors</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-green-600 to-transparent ml-6"></div>
              <span className="text-sm text-gray-600 ml-4">Showing {filteredDoctors.length} doctors</span>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {filteredDoctors.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <Image 
                      src={item.img} 
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover border-2 rounded-full border-green-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 
                            className="text-lg font-semibold text-gray-900 hover:text-green-600 cursor-pointer"
                            onClick={() => handleDoctorClick(item.id)}
                          >
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{item.spec}</p>
                        </div>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">4.9</span>
                          <span>(234)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>15 years</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>City Hospital</span>
                      </div>

                      {/* Schedule Summary */}
                      <div className="mt-3 text-xs text-gray-500">
                        <p className="font-medium">Availability:</p>
                        <p>
                          {item.schedule.workingDays.map(day => 
                            getDayName(day).slice(0, 3)
                          ).join(', ')} • {item.schedule.workingHours.start} - {item.schedule.workingHours.end}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className={`text-sm font-medium px-3 py-1 ${
                          hasAvailableSlotsToday(item)
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {hasAvailableSlotsToday(item) ? 'Available Today' : 'Fully Booked Today'}
                        </span>
                        <button 
                          onClick={() => openDialog(item)}
                          className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          Book Now
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* View All CTA */}
          <div className="flex items-center justify-center pt-4">
            <Button className="px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all flex items-center gap-3 shadow-lg">
              <Calendar className="w-5 h-5" />
              View All Appointments
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Dialog */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-white text-black border-none shadow-2xl max-w-4xl">
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Book Appointment
          </DialogTitle>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h1 className="font-poppins text-lg text-center"> 
              Book with{" "}
              <span className="font-semibold text-green-600">Dr. {selectedDoctor?.name}</span>
            </h1>
            <p className="text-sm text-gray-600 text-center">{selectedDoctor?.spec}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Calendar */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Select Date</h3>
              <div className="border rounded-lg p-4">
                <ReactDatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setSelectedTime("");
                  }}
                  minDate={new Date()}
                  filterDate={(date) => selectedDoctor ? !isDateDisabled(selectedDoctor, date) : true}
                  inline
                  className="w-full"
                />
              </div>
              
              {/* Doctor Schedule Info */}
              {selectedDoctor && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{"Doctor's"} Schedule</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Working Days:</strong> {selectedDoctor.schedule.workingDays.map(day => 
                      getDayName(day)
                    ).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Hours:</strong> {selectedDoctor.schedule.workingHours.start} - {selectedDoctor.schedule.workingHours.end}
                  </p>
                  {selectedDoctor.schedule.breaks.length > 0 && (
                    <p className="text-sm text-gray-600">
                      <strong>Breaks:</strong> {selectedDoctor.schedule.breaks.map(breakTime => 
                        `${breakTime.start}-${breakTime.end}`
                      ).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Time Slots and Details */}
            <div className="space-y-6">
              {/* Time Slots */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Available Time Slots {selectedDate && `for ${selectedDate.toLocaleDateString()}`}
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-4 text-sm border-2 rounded-lg transition-all ${
                        selectedTime === time
                          ? 'bg-green-600 text-white border-green-600 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                  {availableTimeSlots.length === 0 && selectedDate && (
                    <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No available slots for this date</p>
                      <p className="text-sm mt-1">Please select another date</p>
                    </div>
                  )}
                  {!selectedDate && (
                    <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Select a date to see available time slots</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
                <Textarea 
                  placeholder="Describe your symptoms or reason for appointment..."
                  className="min-h-[100px] border-gray-300 focus:border-green-600"
                  value={values.description}
                  onChange={(e) => setValues({ ...values, description: e.target.value })}
                />
              </div>

              {/* Selected Appointment Summary */}
              {(selectedDate || selectedTime) && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Appointment Summary</h4>
                  {selectedDate && (
                    <p className="text-sm text-green-800">
                      <strong>Date:</strong> {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  {selectedTime && (
                    <p className="text-sm text-green-800">
                      <strong>Time:</strong> {selectedTime}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-4 mt-6 pt-6 border-t">
            <Button
              onClick={closeDialog}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-6 border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Schedule Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={closeConfirmation}>
        <DialogContent className="bg-white text-black text-center flex flex-col items-center border-none shadow-2xl max-w-lg">
          <div className="flex items-center justify-center">
            <Image
              src="/images/success.gif"
              alt="success"
              width={150}
              height={150}
            />
          </div>
          <DialogTitle className="text-2xl font-bold mb-4 text-green-600">
            Appointment Scheduled!
          </DialogTitle>
          <p className="text-base text-gray-700 leading-relaxed">
            Thank you, <span className="font-semibold">{user?.username}</span>. Your appointment with{" "}
            <span className="font-semibold text-green-600">Dr. {selectedDoctor?.name}</span>{" "}
            has been successfully scheduled.
          </p>
          {selectedDate && selectedTime && (
            <div className="mt-4 w-full bg-gray-50 border border-gray-200 p-4">
              <p className="text-sm text-gray-600 font-medium">Scheduled For:</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={startRoom}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6"
            >
              Request Appointment Now
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-6 font-semibold"
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                toast({ title: "Link Copied" });
              }}
            >
              Copy Invite Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorCard;