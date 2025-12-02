import { NextResponse } from "next/server";
import axios from "axios";
import moment from "moment";

const getMpesaAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.get<{ access_token: string }>(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { 
        headers: { 
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000
      }
    );

    return response.data.access_token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("M-Pesa Auth Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
    } else if (error instanceof Error) {
      console.error("M-Pesa Auth Error:", error.message);
    } else {
      console.error("M-Pesa Auth Error: An unknown error occurred.");
    }
    throw new Error("Failed to obtain access token");
  }
};

export async function POST(req: Request) {
  try {
    const { phone, amount } = await req.json();

    // Validate and format phone number
    let formattedPhone = phone.toString().trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Validate phone format
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json(
        { message: "Invalid phone number format. Expected 254xxxxxxxxx (e.g., 254712345678)" },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { message: "Invalid amount. Minimum is 1 KES" },
        { status: 400 }
      );
    }

    const accessToken = await getMpesaAccessToken();

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const callbackURL = process.env.MPESA_CALLBACK_URL || 
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/mpesa/callback`;

    const requestBody = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: `Order${Date.now()}`,
      TransactionDesc: "Telemedicine Appointment",
    };

    console.log("📤 STK Push Request:", {
      BusinessShortCode: requestBody.BusinessShortCode,
      Timestamp: timestamp,
      PartyA: requestBody.PartyA,
      Amount: requestBody.Amount,
      CallBackURL: requestBody.CallBackURL,
    });

    const response = await axios.post<{
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResponseCode: string;
      ResponseDescription: string;
    }>(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    console.log("✅ STK Push Response:", {
      ResponseCode: data.ResponseCode,
      ResponseDescription: data.ResponseDescription,
      MerchantRequestID: data.MerchantRequestID,
      CheckoutRequestID: data.CheckoutRequestID,
    });

    if (data.ResponseCode !== "0") {
      return NextResponse.json(
        {
          message: "STK push failed",
          ResponseCode: data.ResponseCode,
          ResponseDescription: data.ResponseDescription,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "STK push sent. Please approve on your phone.",
      MerchantRequestID: data.MerchantRequestID,
      CheckoutRequestID: data.CheckoutRequestID,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ STK Push Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return NextResponse.json(
        {
          message: "STK push failed",
          error: error.response?.data || error.message,
        },
        { status: 500 }
      );
    } else if (error instanceof Error) {
      console.error("❌ STK Push Error:", error.message);
    }

    return NextResponse.json(
      { message: "Failed to initiate STK push" },
      { status: 500 }
    );
  }
}
