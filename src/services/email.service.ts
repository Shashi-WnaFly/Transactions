import emailTransporter from "../configs/emailTransporter.js";

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const options = {
      from: process.env.EMAIL_SENDER,
      to: to,
      subject: subject,
      html: html,
    };
    await emailTransporter.sendMail(options);
  } catch (error: any) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

export default sendEmail;
