import nodemailer from 'nodemailer';

export const smtpService = {
  createTransporter(config: { host: string; port: number; user: string; pass: string }) {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  },

  async sendEmail(config: any, to: string, subject: string, html: string) {
    const transporter = this.createTransporter(config);
    return transporter.sendMail({
      from: config.user,
      to,
      subject,
      html
    });
  }
};
