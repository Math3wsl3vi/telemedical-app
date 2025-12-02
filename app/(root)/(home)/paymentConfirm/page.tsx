'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Home, CreditCard, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import jsPDF from 'jspdf';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Loader from '@/components/Loader';

interface Medication {
  name: string;
  strength: string;
  dosage: string;
  duration: string;
  quantity: string;
  price: number;
}

interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date;
  description?: string;
  phoneNumber?: string;
}

interface DoctorData {
  name: string;
  specialty: string;
  clinic?: string;
  phone?: string;
  license_url?: string;
}

const PaymentConfirmationPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  // In the future, medications can be fetched from Firestore or passed via props
  // For now, using default mock medications
  const medications: Medication[] = [
    { name: "Amoxicillin", strength: "500mg Capsules", dosage: "1 capsule three times daily", duration: "7 days", quantity: "21 capsules", price: 1500 },
    { name: "Ibuprofen", strength: "400mg Tablets", dosage: "1 tablet three times daily when in pain", duration: "As needed", quantity: "30 tablets", price: 1000 },
  ];

  const totalAmount = medications.reduce((sum, med) => sum + med.price, 0);

  // Fetch appointment and doctor data
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !user) return;

      try {
        // Try to get appointment ID from URL params
        const appointmentId = searchParams.get('appointmentId');
        
        let appointmentData: AppointmentData | null = null;

        if (appointmentId) {
          // Fetch specific appointment by ID
          const appointmentRef = doc(db, 'appointments', appointmentId);
          const appointmentSnap = await getDoc(appointmentRef);
          
          if (appointmentSnap.exists()) {
            const data = appointmentSnap.data();
            appointmentData = {
              id: appointmentSnap.id,
              patientId: data.patientId,
              patientName: data.patientName || user.fullName || 'Patient',
              patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
              doctorId: data.doctorId,
              doctorName: data.doctorName,
              doctorSpecialty: data.doctorSpecialty,
              appointmentDate: data.appointmentDate?.toDate() || new Date(),
              description: data.description,
              phoneNumber: data.phoneNumber,
            };
          }
        } else {
          // Fetch most recent appointment for the user
          const appointmentsRef = collection(db, 'appointments');
          const q = query(
            appointmentsRef,
            where('patientId', '==', user.id),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            appointmentData = {
              id: querySnapshot.docs[0].id,
              patientId: data.patientId,
              patientName: data.patientName || user.fullName || 'Patient',
              patientEmail: data.patientEmail || user.primaryEmailAddress?.emailAddress || '',
              doctorId: data.doctorId,
              doctorName: data.doctorName,
              doctorSpecialty: data.doctorSpecialty,
              appointmentDate: data.appointmentDate?.toDate() || new Date(),
              description: data.description,
              phoneNumber: data.phoneNumber,
            };
          }
        }

        if (appointmentData) {
          setAppointment(appointmentData);
          setPhoneNumber(appointmentData.phoneNumber || '');

          // Fetch doctor details
          const doctorRef = doc(db, 'doctors', appointmentData.doctorId);
          const doctorSnap = await getDoc(doctorRef);
          
          if (doctorSnap.exists()) {
            const doctorData = doctorSnap.data();
            setDoctor({
              name: doctorData.name,
              specialty: doctorData.specialty,
              clinic: doctorData.clinic,
              phone: doctorData.phone || doctorData.whatsappNumber,
              license_url: doctorData.license_url,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
        toast({ 
          title: "Error", 
          description: "Could not load appointment details.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, user, searchParams, toast]);

  if (!isLoaded || loading) {
    return <Loader />;
  }

  // Prepare order data for PDF generation
  const order = {
    orderId: appointment?.id.slice(-5).toUpperCase() || "00000",
    patientName: appointment?.patientName || user?.fullName || "Patient",
    patientId: `PAT-${new Date().getFullYear()}-${user?.id.slice(-4) || '0000'}`,
    date: appointment?.appointmentDate.toLocaleDateString() || new Date().toLocaleDateString(),
    doctorName: doctor?.name || appointment?.doctorName || "Dr. Unknown",
    doctorLicense: "MD/REG NO. A7890", // You might want to store this in doctor data
    clinic: doctor?.clinic || "Healthcare Center",
    phone: doctor?.phone || "+254 712 345 678",
    medications: medications,
    total: totalAmount
  };

  // Format phone number
  const formatPhoneNumber = (phone: string) => {
    let formatted = phone.trim();
    if (formatted.startsWith("0")) {
      formatted = "254" + formatted.slice(1);
    }
    return formatted;
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({ title: "Error", description: "Please enter your phone number.", variant: "destructive" });
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!/^254(7|1)\d{8}$/.test(formattedPhone)) {
      toast({ title: "Invalid Phone Number", description: "Use format 07XXXXXXXX or 01XXXXXXXX.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, amount: totalAmount }),
      });

      await response.json();
      if (response.ok) {
        setPaymentInitiated(true);
        toast({ title: "Payment Initiated", description: "Check your phone for M-Pesa prompt..." });
      } else {
        toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.log(error)
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Receipt PDF
  const downloadReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MEDICAL RECEIPT", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.orderId}`, 20, 35);
    doc.text(`Patient: ${order.patientName}`, 20, 43);
    doc.text(`Date: ${order.date}`, 20, 51);
    doc.text(`Payment Status: ${paymentInitiated ? "Pending Confirmation" : "Awaiting Payment"}`, 20, 59);

    // Table
    const tableData = order.medications.map(m => [
      m.name,
      m.dosage,
      m.duration,
      `KES ${m.price.toLocaleString()}`
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      head: [["Medicine", "Dosage Instructions", "Duration", "Price"]],
      body: tableData,
      startY: 70,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: KES ${order.total.toLocaleString()}`, pageWidth - 40, finalY + 15, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for using our service!", pageWidth / 2, finalY + 30, { align: "center" });

    doc.save(`Receipt_${order.orderId}.pdf`);
    toast({ title: "Receipt Downloaded", description: "Your receipt has been saved." });
  };

// Generate Professional Prescription PDF
const downloadPrescription = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Header Background
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Clinic Name (White text on blue background)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(order.clinic, pageWidth / 2, 22, { align: "center" });

  // Contact Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("P.O. Box 1234 - 00100, Nairobi", pageWidth / 2, 32, { align: "center" });
  doc.text("Tel: +254 712 345 678 | Email: info@daktariconnect.co.ke", pageWidth / 2, 38, { align: "center" });

  // Divider line
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(margin, 55, pageWidth - margin, 55);

  // Reset text color to black
  doc.setTextColor(0, 0, 0);

  // Prescription Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIPTION", pageWidth / 2, 68, { align: "center" });

  // Patient Information Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, 78, pageWidth - 2 * margin, 32, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("PATIENT INFORMATION", margin + 5, 86);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${order.patientName}`, margin + 5, 94);
  doc.text(`Patient ID: ${order.patientId}`, margin + 5, 101);
  doc.text(`Date: ${order.date}`, pageWidth - margin - 60, 94);

  // Doctor Information Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, 118, pageWidth - 2 * margin, 28, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text("PRESCRIBING PHYSICIAN", margin + 5, 126);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Dr. ${order.doctorName}`, margin + 5, 134);
  doc.text(`License No: ${order.doctorLicense}`, margin + 5, 141);

  // Rx Symbol
  doc.setFontSize(24);
  doc.setFont("times", "italic");
  doc.setTextColor(41, 128, 185);
  doc.text("℞", margin, 165);

  // Medications Table Header
  doc.setFillColor(41, 128, 185);
  doc.rect(margin, 170, pageWidth - 2 * margin, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICATION DETAILS", margin + 5, 177);

  // Medications List
  let y = 188;
  doc.setTextColor(0, 0, 0);
  
  order.medications.forEach((med, index) => {
    // Medication name and strength
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${med.name} ${med.strength}`, margin + 5, y);
    y += 8;

    // Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Dosage: ${med.dosage}`, margin + 10, y);
    y += 6;
    doc.text(`Duration: ${med.duration}`, margin + 10, y);
    y += 6;
    doc.text(`Quantity: ${med.quantity}`, margin + 10, y);
    y += 12;

    // Separator line between medications
    if (index < order.medications.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin + 5, y - 2, pageWidth - margin - 5, y - 2);
      y += 8;
    }
  });


  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This is a digitally generated prescription. Valid for dispensing at any licensed pharmacy.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  // Save PDF
  doc.save(`Prescription_${order.patientId}_${order.date}.pdf`);
  toast({ 
    title: "Prescription Downloaded", 
    description: "Professional prescription ready for pharmacy." 
  });
};

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Medication Order Ready!
          </h2>
          <p className="text-lg text-gray-600">
            Pay now or download your prescription to buy later at any pharmacy.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Order Summary */}
          <section className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div><p className="text-gray-500">Order ID</p><p className="font-medium">{order.orderId}</p></div>
              <div><p className="text-gray-500">Patient</p><p className="font-medium">{order.patientName}</p></div>
              <div><p className="text-gray-500">Date</p><p className="font-medium">{order.date}</p></div>
              <div><p className="text-gray-500">Total</p><p className="font-bold text-lg">{totalAmount.toLocaleString()} KES</p></div>
            </div>
          </section>

          {/* Medications List */}
          <section className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">Medications</h3>
            <div className="space-y-4">
              {order.medications.map((med, i) => (
                <div key={i} className="flex justify-between items-start bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{med.name} {med.strength}</p>
                    <p className="text-sm text-gray-600 mt-1">{med.dosage} • {med.duration}</p>
                  </div>
                  <p className="font-medium">KES {med.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Section */}
          {!paymentInitiated && (
            <section className="p-6 border-b border-gray-200 bg-blue-50">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Pay with M-Pesa
              </h3>
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !phoneNumber}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Pay Now with M-Pesa'}
                </button>
              </div>
            </section>
          )}

          {paymentInitiated && (
            <section className="p-6 bg-green-50 border-b border-green-200">
              <p className="text-green-800 font-medium">Payment request sent! Complete on your phone.</p>
            </section>
          )}

          {/* Action Buttons */}
          <section className="p-6 space-y-4 bg-gray-50">
            {/* Download Prescription - Works even without payment */}
            <button
              onClick={downloadPrescription}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-md flex items-center justify-center gap-3 transition"
            >
              <FileText className="w-6 h-6" />
              Download Prescription (For Any Pharmacy)
            </button>

            {/* Download Receipt */}
            <button
              onClick={downloadReceipt}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center gap-3 transition"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-md flex items-center justify-center gap-3 transition"
            >
              <Home className="w-6 h-6" />
              Go to Dashboard
            </button>
          </section>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          You can download the prescription and buy medicine from any pharmacy, even without paying here.
        </p>
      </main>
    </div>
  );
};

export default PaymentConfirmationPage;