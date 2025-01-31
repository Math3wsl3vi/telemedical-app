"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useGetCallById } from "@/hooks/UseGetCallById";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { DocData } from "@/constants";

type Doctor = {
  id: number;
  name: string;
  spec: string;
  img: string;
  whatsappNumber?: string; // Include this if you added it
};



const DoctorCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });

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
    // setSelectedDoctor(null);
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

      const whatsappMessage = `Hello Dr. ${selectedDoctor.name}, your meeting is ready to start. The patient is already on the call waiting. Here is the meeting link: ${meetingLink}`;

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
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mt-[60px] justify-center">
      {DocData.map((item) => (
        <div
          key={item.id}
          className="border p-10 rounded-xl flex items-center flex-col gap-10 w-[300px] h-[440px] cursor-pointer"
        >
          <Image src={item.img} alt={item.name} width={150} height={150} />
          <div className="mt-8 flex items-center flex-col gap-3">
            <h2 className="text-xl font-semibold font-poppins">
              Dr. {item.name}
            </h2>
            <h3 className="text-lg text-gray-400 font-poppins">{item.spec}</h3>
          </div>
          <div>
            <Button
              onClick={() => openDialog(item)}
              className="bg-green-1 text-white text-lg font-poppins"
            >
              Book Now
            </Button>
          </div>
        </div>
      ))}

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-white text-black">
          <DialogTitle className="text-xl font-poppins text-center mb-4">
            Hello, {user?.username}
          </DialogTitle>
          <h1 className="font-poppins text-xl"> Book An Appointment with{" "}
          <span className="font-semibold">Dr. {selectedDoctor?.name}</span></h1>
          <div className="flex flex-col gap-4">
            {/* <Input placeholder="Name" />
            <Input placeholder="Phone Number" /> */}
            <Textarea placeholder="Reason for appointment"/>
            <div className="flex flex-col gap-2.5">
              <label
                className="text-base text-normal
                        leading-[22px] "
              >
                Select date and time for Appointment
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
                className="w-full rounded-md border p-2 focus:outline-none"
              />
            </div>
          </div>
          <div className="w-full flex items-center justify-center gap-10">
            <Button
              onClick={closeDialog}
              className="min-w-[200px] bg-red-800 font-poppins text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              className="min-w-[200px] bg-green-1 font-poppins text-white"
            >
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* confirmation dialog */}
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={closeConfirmation}>
        <DialogContent className="bg-white text-black text-center flex flex-col items-center">
          <div className="flex items">
            <Image
              src="/images/success.gif"
              alt="success"
              width={150}
              height={150}
            />
          </div>
          <DialogTitle className="text-xl font-poppins font-semibold mb-4">
            Appointment Scheduled!
          </DialogTitle>
          <p className="text-lg font-poppins">
            Thank you, {user?.username}. Your appointment with{" "}
            <span className="font-semibold">Dr. {selectedDoctor?.name}</span>{" "}
            has been successfully scheduled. You can proceed to the call.
          </p>
          <p className="mt-2 border rounded-md p-2">
            Date and Time: {values.dateTime.toLocaleString()}
          </p>
          <div className="mt-4 flex flex-row gap-5">
            <Button
              onClick={startRoom}
              className="bg-green-1 text-white font-poppins"
            >
              Continue
            </Button>
            <Button
              variant={"outline"}
              className=""
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
