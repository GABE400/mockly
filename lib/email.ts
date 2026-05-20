import nodemailer from "nodemailer";
 
let transporter: nodemailer.Transporter | null = null;
 
async function getTransporter() {
  if (transporter) return transporter;
 
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
 
  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  } else {
    // Fallback to Ethereal SMTP test account
    console.log("⚠️ No SMTP credentials found in .env. Creating temporary Ethereal test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`✨ Ethereal Email Credentials generated:`);
      console.log(`   Host: ${testAccount.smtp.host}`);
      console.log(`   Port: ${testAccount.smtp.port}`);
      console.log(`   User: ${testAccount.user}`);
      console.log(`   Pass: ${testAccount.pass}`);
      
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error("❌ Failed to create Ethereal SMTP account:", err);
      // Fallback transporter that just logs to console
      transporter = {
        sendMail: async (options: any) => {
          console.log("📧 [MOCK EMAIL DELIVERED]");
          console.log(`   To: ${options.to}`);
          console.log(`   Subject: ${options.subject}`);
          console.log(`   Text: ${options.text}`);
          return { messageId: "mock-id" };
        }
      } as any;
    }
  }
 
  return transporter!;
}
 
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const client = await getTransporter();
    const from = process.env.SMTP_FROM || '"Muckly Support" <noreply@muckly.io>';
    const info = await client.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
 
    console.log(`📨 Email sent successfully! Message ID: ${info.messageId}`);
    
    // If it's an Ethereal test account, print the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Preview Sent Email: ${previewUrl}`);
    }
    
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
