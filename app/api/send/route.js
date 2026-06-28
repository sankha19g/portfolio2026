import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const senderEmail = formData.get("senderEmail");
    const subject = formData.get("subject");
    const body = formData.get("body");
    const attachments = formData.getAll("attachments");

    if (!senderEmail || !subject || !body) {
      return NextResponse.json(
        { success: false, error: "Sender email, subject, and body are required." },
        { status: 400 }
      );
    }

    // Convert file attachments to Resend format
    const resendAttachments = [];
    for (const file of attachments) {
      if (file && typeof file === "object" && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        resendAttachments.push({
          filename: file.name,
          content: buffer,
        });
      }
    }

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "sankhadeepghosh0@gmail.com";

    const emailResponse = await resend.emails.send({
      from: "Portfolio Contact Form <onboarding@resend.dev>",
      to: receiverEmail,
      replyTo: senderEmail,
      subject: `[Portfolio Contact] ${subject}`,
      text: `You have received a new contact message from your portfolio website.\n\nSender: ${senderEmail}\nSubject: ${subject}\n\nMessage:\n${body}`,
      attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
    });

    if (emailResponse.error) {
      console.error("Resend API Error:", emailResponse.error);
      return NextResponse.json(
        { success: false, error: emailResponse.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: emailResponse.data });
  } catch (error) {
    console.error("Contact Form Server Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong while sending the email." },
      { status: 500 }
    );
  }
}
