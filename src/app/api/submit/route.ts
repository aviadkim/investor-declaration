import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        await resend.emails.send({
            from: 'הצהרות משקיעים <onboarding@resend.dev>',
            to: 'info@movne.co.il',
            subject: 'הצהרת משקיע כשיר חדשה',
            html: `
                <div dir="rtl" style="font-family: Assistant, sans-serif;">
                    <h2>הצהרת משקיע כשיר חדשה</h2>
                    <p>שם מלא: ${data.firstName} ${data.lastName}</p>
                    <p>תעודת זהות: ${data.idNumber}</p>
                    <p>טלפון: ${data.phone}</p>
                    <p>דוא"ל: ${data.email}</p>
                    <p>תנאי כשירות שנבחר: ${data.condition}</p>
                    <p>תאריך: ${data.date}</p>
                    ${data.signature ? `<img src="${data.signature}" alt="חתימה" style="max-width: 300px;">` : ''}
                </div>
            `
        });

        return new Response(JSON.stringify({ success: true }));
    } catch (error) {
        console.error('Email error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to submit form' }), 
            { status: 500 }
        );
    }
}