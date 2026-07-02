import nodemailer from 'nodemailer';
import { prisma } from '../config/database';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static isEthereal = false;

  /**
   * Initialize the Nodemailer transporter.
   * If SMTP credentials are not provided in the DB, it creates an Ethereal test account.
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    // Fetch email settings from database
    const emailSettings = await prisma.setting.findMany({
      where: { category: 'email' },
    });

    // Helper to get setting value
    const getSetting = (key: string) => {
      const setting = emailSettings.find((s) => s.key === key);
      return setting ? setting.value.replace(/^"|"$/g, '') : null; // Remove quotes if JSON stringified
    };

    const host = getSetting('smtp_host');
    const user = getSetting('smtp_username');
    const pass = getSetting('smtp_password');
    const port = parseInt(getSetting('smtp_port') || '587');

    if (host && user && pass) {
      // Use real SMTP server
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
      });
      console.log('📧 Email Service initialized with database SMTP config.');
      this.isEthereal = false;
    } else {
      // Fallback to Ethereal Mail for local testing
      console.log('📧 No complete SMTP credentials found in database. Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.isEthereal = true;
      console.log('📧 Ethereal test account created successfully.');
    }

    return this.transporter;
  }

  /**
   * Forces the email service to rebuild its transporter on the next email send.
   * Call this when SMTP settings are updated in the admin dashboard.
   */
  static reloadConfig(): void {
    this.transporter = null;
    console.log('📧 Email Service configuration reloaded.');
  }

  /**
   * Helper function to send the email and log the preview URL if using Ethereal
   */
  private static async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      // Set default 'from' address
      if (!mailOptions.from) {
        // Fetch from_email and from_name from database
        const fromEmailSetting = await prisma.setting.findUnique({ where: { category_key: { category: 'email', key: 'from_email' } } });
        const fromNameSetting = await prisma.setting.findUnique({ where: { category_key: { category: 'email', key: 'from_name' } } });
        
        const fromEmail = fromEmailSetting?.value?.replace(/^"|"$/g, '') || 'noreply@zyratechhub.com';
        const fromName = fromNameSetting?.value?.replace(/^"|"$/g, '') || 'ZyraTech Hub';
        
        mailOptions.from = `"${fromName}" <${fromEmail}>`;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Email sent: ${info.messageId}`);
      
      if (this.isEthereal) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      // We don't throw here to avoid crashing the main request if email fails
    }
  }

  // ─── Email Templates ─────────────────────────────────────────────────────────

  /**
   * Send Welcome Email with Credentials to a newly created Admin
   */
  static async sendAdminWelcomeEmail(email: string, name: string, plainTextPassword: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2b3a4a;">Welcome to ZyraTech Hub, ${name}!</h2>
        <p>A Super Admin has created an administrator account for you.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${plainTextPassword}</p>
        </div>
        <p><em>For security reasons, you will be required to change this password upon your first login.</em></p>
        <p>Click the link below to access the admin portal:</p>
        <a href="https://zyratechhub.com/admin/login" style="display: inline-block; background-color: #0066cc; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Admin Portal</a>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0 20px;" />
        <p style="font-size: 12px; color: #888;">If you were not expecting this email, please contact IT support.</p>
      </div>
    `;

    await this.sendMail({
      to: email,
      subject: 'Your ZyraTech Hub Admin Credentials',
      html,
    });
  }
}
