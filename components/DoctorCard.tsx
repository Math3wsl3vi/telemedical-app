"use client";

import Image from "next/image";
import React, { ReactNode, useState } from "react";
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
import { DocData } from "@/constants";
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
  Brain,
  Activity
} from 'lucide-react';

type Doctor = {
  id: string; // Changed to string
  name: string;
  spec: string;
  img: string;
  whatsappNumber?: string;
};


interface ServiceCardProps {
  title: string;
  icon: ReactNode;
  count: number | string;
}


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
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

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
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSchedule = () => {
    setIsConfirmationOpen(true);
    console.log("Appointment scheduled:", { doctor: selectedDoctor, ...values });
    closeDialog();
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
    console.log("Appointment booked.");
  };

  const startRoom = async () => {
    if (!client || !user || !selectedDoctor) {
      console.log("Client:", client);
      console.log("User:", user);
      console.log("Selected Doctor:", selectedDoctor);
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
        toast({ title: "Link sent. The doctor will be with you shortly" });
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
    { title: 'Total Doctors', icon: <Stethoscope className="w-6 h-6" />, count: DocData.length.toString() },
    { title: 'Appointments', icon: <Calendar className="w-6 h-6" />, count: '12' },
    { title: 'Specialties', icon: <Activity className="w-6 h-6" />, count: '24' },
    { title: 'Mental Health', icon: <Brain className="w-6 h-6" />, count: '8' },
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
  const filteredDoctors = DocData.filter((doctor) => {
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
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1">
                          Available Today
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

      {/* Booking Dialog */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-white text-black border-none shadow-2xl max-w-lg">
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Hello, {user?.username}
          </DialogTitle>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h1 className="font-poppins text-lg text-center"> 
              Book an appointment with{" "}
              <span className="font-semibold text-green-600">Dr. {selectedDoctor?.name}</span>
            </h1>
          </div>
          <div className="flex flex-col gap-4">
            <Textarea 
              placeholder="Describe your symptoms or reason for appointment..."
              className="min-h-[100px] border-gray-300 focus:border-green-600"
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Select Date and Time
              </label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date) => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat="HH:mm"
                minDate={new Date()} 
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full border border-gray-300 p-3 focus:outline-none focus:border-green-600"
              />
            </div>
          </div>
          <div className="w-full flex items-center justify-center gap-4 mt-6">
            <Button
              onClick={closeDialog}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-6 border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
            >
              Schedule
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
          <div className="mt-4 w-full bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-600 font-medium">Scheduled For:</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {values.dateTime.toLocaleString()}
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={startRoom}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
            >
              Start Consultation
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