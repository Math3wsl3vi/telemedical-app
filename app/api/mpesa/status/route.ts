import { NextResponse } from "next/server";
import axios from "axios";
import moment from "moment";

const getMpesaAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa credentials: MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET");
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

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
      console.error("M-Pesa Token Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
    } else if (error instanceof Error) {
      console.error("M-Pesa Token Error:", error.message);
    }
    throw new Error("Failed to obtain M-Pesa access token");
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { checkoutRequestID } = body;

    if (!checkoutRequestID) {
      return NextResponse.json({ message: "Missing checkoutRequestID" }, { status: 400 });
    }

    // Get access token
    let accessToken: string;
    try {
      accessToken = await getMpesaAccessToken();
    } catch (error) {
      console.error("❌ Token Error:", error);
      return NextResponse.json(
        { 
          message: "Failed to authenticate with M-Pesa",
          error: error instanceof Error ? error.message : "Unknown error"
        }, 
        { status: 401 }
      );
    }

    const BusinessShortCode = process.env.MPESA_SHORTCODE || "174379";
    const PassKey = process.env.MPESA_PASSKEY;
    
    if (!PassKey) {
      return NextResponse.json({ message: "Missing MPESA_PASSKEY" }, { status: 500 });
    }

    const Timestamp = moment().format("YYYYMMDDHHmmss");
    const Password = Buffer.from(`${BusinessShortCode}${PassKey}${Timestamp}`).toString("base64");

    console.log("📤 Querying STK Push Status:", {
      BusinessShortCode,
      CheckoutRequestID: checkoutRequestID,
      Timestamp,
    });

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode,
        Password,
        Timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    console.log("✅ M-Pesa Status Response:", {
      ResponseCode: data.ResponseCode,
      ResponseDescription: data.ResponseDescription,
      ResultCode: data.ResultCode,
      ResultDesc: data.ResultDesc,
      MerchantRequestID: data.MerchantRequestID,
      CheckoutRequestID: data.CheckoutRequestID,
    });

    // Handle error result codes from M-Pesa
    if (data.ResultCode !== "0") {
      console.warn("⚠️ M-Pesa Status Query Failed:", {
        ResultCode: data.ResultCode,
        ResultDesc: data.ResultDesc,
      });
    }

    // Map M-Pesa response codes to payment status
    const status = 
      data.ResultCode === "0" ? "COMPLETED" : 
      data.ResultCode === "1032" ? "PENDING" : 
      "FAILED";
    
    return NextResponse.json({ 
      status, 
      data,
      message: data.ResultDesc || data.ResponseDescription 
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ M-Pesa API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      return NextResponse.json(
        { 
          message: "M-Pesa API error",
          details: error.response?.data,
          status: error.response?.status
        }, 
        { status: 500 }
      );
    } else if (error instanceof Error) {
      console.error("❌ Server Error:", error.message);
    }
    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}
