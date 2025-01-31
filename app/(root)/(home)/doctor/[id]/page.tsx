import { DocData } from "@/constants";
import Image from "next/image";
import React from "react";

export interface DoctorData {
    id: string;
    name: string;
    img: string;
    spec: string;
    whatsappNumber: string;
  }

const Doctor = ({ params }: { params: { id: string } }) => {
  const doctorId = params.id;
  const docData = DocData.find((doc) => doc.id === doctorId);
  console.log(docData)

  if (!docData) {
    return <div>Doctor not found</div>;
  }
  return (
    <div>
      {/* left */}
      <div>
        {/* user card */}
        <div className="flex flex-row gap-10 border rounded-xl max-w-[450px] p-6 shadow-lg">
          <div className="border rounded-full">
            <Image
              src={docData?.img || "/images/user.png"}
              alt="doctor"
              width={100}
              height={100}
            />
          </div>
          <div>
            <h1 className="font-poppins font-semibold text-xl">
              {docData.name}
            </h1>
            <h1 className="font-poppins text-gray-400">{docData.spec}</h1>
              <h1 className="font-poppins">{docData.whatsappNumber}</h1>
          </div>
        </div>
      </div>
      {/* right */}
      <div></div>
    </div>
  );
};

export default Doctor;
