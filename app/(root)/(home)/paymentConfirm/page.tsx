'use client';
import React, { useState } from 'react';
import { CheckCircle, Download, Home, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const PaymentConfirmationPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const totalAmount = 2500; // Update this to be dynamic based on actual medications

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({ 
        title: "Error",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }

    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith("07") || formattedPhone.startsWith("01")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    }

    if (!/^254(7|1)\d{8}$/.test(formattedPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Use format 07XXXXXXXX or 01XXXXXXXX.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: totalAmount,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentInitiated(true);
        toast({
          title: "Payment Initiated",
          description: "Check your phone for M-Pesa payment prompt...",
        });
      } else {
        toast({ 
          title: "Payment Failed",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive"
        });
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({ 
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Success Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Medication Order Ready!
          </h2>
          <p className="text-lg text-gray-600">
            Please complete payment to confirm your medication order.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Summary Section */}
          <section className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium text-gray-900">98765</p>
              </div>
              <div>
                <p className="text-gray-500">Patient Name</p>
                <p className="font-medium text-gray-900">John Doe</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">2024-05-16</p>
              </div>
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-bold text-gray-900 text-lg">{totalAmount} KES</p>
              </div>
            </div>
          </section>

          {/* Medications */}
          <section className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">Medications</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Amoxicillin 500mg (7 days × 3 daily)
                  </p>
                </div>
                <p className="text-gray-700 font-medium">1500 KES</p>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Ibuprofen 400mg × 100 tabs
                  </p>
                </div>
                <p className="text-gray-700 font-medium">1000 KES</p>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          {!paymentInitiated && (
            <section className="p-6 border-b border-gray-200 bg-blue-50">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                M-Pesa Payment
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your M-Pesa registered phone number to initiate payment
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="07XXXXXXXX or 01XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !phoneNumber}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-md transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Pay Now with M-Pesa'}
                </button>
              </div>
            </section>
          )}

          {/* Success Message */}
          {paymentInitiated && (
            <section className="p-6 border-b border-gray-200 bg-green-50">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Initiated ✓</h3>
              <p className="text-sm text-green-700">
                Please complete the payment prompt on your phone. Your order will be confirmed once payment is successful.
              </p>
            </section>
          )}

          {/* Action Buttons */}
          <section className="p-6 space-y-4 bg-gray-50">
            <button className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 border border-gray-300 rounded-md flex items-center justify-center gap-3 transition">
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-md flex items-center justify-center gap-3 text-lg transition"
            >
              <Home className="w-6 h-6" />
              Go to Dashboard
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PaymentConfirmationPage;
