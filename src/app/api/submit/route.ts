import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "info@movne.co.il",
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        await transporter.sendMail({
            from: '"הצהרות משקיעים" <info@movne.co.il>',
            to: "info@movne.co.il",
            subject: "הצהרת משקיע כשיר חדשה",
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif;">
                    <h2>הצהרת משקיע כשיר חדשה</h2>
                    <p>שם מלא: ${data.firstName} ${data.lastName}</p>
                    <p>תעודת זהות: ${data.idNumber}</p>
                    <p>טלפון: ${data.phone}</p>
                    <p>דוא"ל: ${data.email}</p>
                    <p>תנאי כשירות: ${data.condition}</p>
                    <p>תאריך: ${data.date}</p>
                    ${data.signature ? `<img src="${data.signature}" alt="חתימה">` : ''}
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
    }
}