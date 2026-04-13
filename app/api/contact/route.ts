import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SUBJECT_LABELS: Record<string, string> = {
  performance: "出演・音源使用のご依頼",
  collab: "楽曲制作・コラボのご相談",
  press: "取材・メディア関連",
  business: "契約・ビジネス関連",
  event: "イベント・ライブ関連",
  other: "その他",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim() || !subject) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 },
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "メールアドレスの形式が正しくありません" },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const subjectLabel = SUBJECT_LABELS[subject] ?? subject;

    const htmlBody = `
<h2>ウェブサイトからのお問い合わせ</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px">
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">お問い合わせ種別</td><td style="padding:8px;border:1px solid #ddd">${subjectLabel}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">お名前</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">会社名/団体</td><td style="padding:8px;border:1px solid #ddd">${company || "—"}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">メールアドレス</td><td style="padding:8px;border:1px solid #ddd"><a href="mailto:${email}">${email}</a></td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">電話番号</td><td style="padding:8px;border:1px solid #ddd">${phone || "—"}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;vertical-align:top">お問い合わせ内容</td><td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap">${message}</td></tr>
</table>`;

    const textBody = `
【ウェブサイトからのお問い合わせ】

お問い合わせ種別: ${subjectLabel}
お名前: ${name}
会社名/団体: ${company || "—"}
メールアドレス: ${email}
電話番号: ${phone || "—"}

お問い合わせ内容:
${message}
`.trim();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `【お問い合わせ】${subjectLabel} - ${name}`,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "送信中にエラーが発生しました。しばらくしてから再度お試しください。" },
      { status: 500 },
    );
  }
}
