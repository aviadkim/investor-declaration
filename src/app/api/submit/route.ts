import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// יצירת אובייקט Resend - נצטרך להוסיף את המפתח בהגדרות Railway
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const emailHtml = `
      <div dir="rtl" style="font-family: Assistant, sans-serif;">
        <img src="https://movne.co.il/wp-content/uploads/2023/12/movne-logo.png" alt="Movne" style="width: 150px; margin-bottom: 20px;">
        <h2 style="color: #1a1f36;">הצהרת משקיע חדשה</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
          <p><strong>שם מלא:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>תעודת זהות:</strong> ${data.idNumber}</p>
          <p><strong>טלפון:</strong> ${data.phone}</p>
          <p><strong>דואל:</strong> ${data.email}</p>
          <p><strong>תנאי כשירות:</strong> ${data.condition}</p>
          <p><strong>תאריך:</strong> ${data.date}</p>
          <p><strong>חתימה:</strong> ${data.signature}</p>
        </div>
      </div>
    `;

    // שליחת מייל למובנה
    await resend.emails.send({
      from: 'Movne Forms <forms@movne.co.il>',
      to: 'aviad@movne.co.il',
      subject: 'הצהרת משקיע מסווג חדשה',
      html: emailHtml
    });

    // שליחת אישור למשקיע
    const confirmationHtml = `
      <div dir="rtl" style="font-family: Assistant, sans-serif;">
        <img src="https://movne.co.il/wp-content/uploads/2023/12/movne-logo.png" alt="Movne" style="width: 150px; margin-bottom: 20px;">
        <h2 style="color: #1a1f36;">תודה על פנייתך למובנה</h2>
        <p>קיבלנו את הצהרת המשקיע המסווג שלך.</p>
        <p>נציג מטעמנו יהיה בקשר בהקדם.</p>
        <br>
        <p>בברכה,</p>
        <p>צוות מובנה</p>
      </div>
    `;

    await resend.emails.send({
      from: 'Movne <forms@movne.co.il>',
      to: data.email,
      subject: 'אישור קבלת הצהרת משקיע מסווג - מובנה',
      html: confirmationHtml
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}