import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface BookingConfirmationEmailPayload {
  to: string;
  contactName: string;
  userMobile: string;
  whatsapp: string;
  ref: string;
  sectionLabel: string;
  seatCount: number;
  seats: { label: string; attendeeName: string }[];
  entryCode: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendBookingConfirmation(payload: BookingConfirmationEmailPayload): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured — skipping confirmation email');
      return;
    }

    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const secure = this.configService.get<string>('SMTP_SECURE', 'false') === 'true';
    const from = this.configService.get<string>('SMTP_FROM', user);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const seatsHtml = payload.seats
      .map(
        (seat) =>
          `<tr><td style="padding:6px 12px;border:1px solid #333;">${seat.label}</td><td style="padding:6px 12px;border:1px solid #333;">${seat.attendeeName}</td></tr>`,
      )
      .join('');

    const html = `
      <div dir="rtl" style="font-family:Arial,sans-serif;color:#eee;background:#1a1a1a;padding:24px;max-width:560px;">
        <h1 style="color:#f2ca50;margin:0 0 16px;">Premier Theater</h1>
        <p style="font-size:16px;">مرحباً <strong>${payload.contactName}</strong>،</p>
        <p>تم تأكيد حجزك بنجاح. فيما يلي تفاصيل تذكرتك:</p>
        <table style="width:100%;margin:16px 0;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#aaa;">رقم الحجز</td><td style="padding:6px 0;"><strong>${payload.ref}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#aaa;">رقم الموبايل</td><td style="padding:6px 0;direction:ltr;text-align:right;">${payload.userMobile}</td></tr>
          <tr><td style="padding:6px 0;color:#aaa;">واتساب</td><td style="padding:6px 0;direction:ltr;text-align:right;">${payload.whatsapp}</td></tr>
          <tr><td style="padding:6px 0;color:#aaa;">القسم</td><td style="padding:6px 0;">${payload.sectionLabel}</td></tr>
          <tr><td style="padding:6px 0;color:#aaa;">عدد المقاعد</td><td style="padding:6px 0;">${payload.seatCount}</td></tr>
        </table>
        <h3 style="color:#f2ca50;margin:16px 0 8px;">المقاعد والحضور</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#333;"><th style="padding:8px 12px;border:1px solid #444;">المقعد</th><th style="padding:8px 12px;border:1px solid #444;">الاسم</th></tr>
          ${seatsHtml}
        </table>
        <div style="margin:24px 0;padding:20px;background:#2a2410;border:2px solid #f2ca50;border-radius:8px;text-align:center;">
          <p style="margin:0 0 8px;color:#aaa;font-size:14px;">كود الدخول</p>
          <p style="margin:0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#f2ca50;direction:ltr;">${payload.entryCode}</p>
        </div>
        <p style="font-size:13px;color:#aaa;">يرجى إحضار هذا الكود عند الدخول. الكود صالح لمرة واحدة.</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: payload.to,
      subject: `تأكيد حجز Premier Theater — كود الدخول ${payload.entryCode}`,
      html,
    });

    this.logger.log(`Confirmation email sent to ${payload.to} for booking ${payload.ref}`);
  }
}
