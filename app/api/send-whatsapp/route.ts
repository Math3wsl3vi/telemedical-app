import { NextResponse } from "next/server";
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token
const fromWhatsAppNumber = "whatsapp:+14155238886"; // Twilio WhatsApp number

const client = new Twilio(accountSid, authToken);

export async function POST(req: Request) {
  const { to, message } = await req.json();

  if (!to || !message) {
    return NextResponse.json(
      { success: false, error: "Missing 'to' or 'message' in request body." },
      { status: 400 }
    );
  }

  try {
    const response = await client.messages.create({
      from: fromWhatsAppNumber,
      to: `whatsapp:${to}`,
      body: message,
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}