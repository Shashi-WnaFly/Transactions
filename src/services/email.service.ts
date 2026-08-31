import emailTransporter from "../configs/emailTransporter.js";

const sendEmail = async (to: string, subject: string, html: string) => {
  const options = {
    to: to,
    from: process.env.EMAIL_SENDER,
    subject: subject,
    html: html,
  };

  await emailTransporter.sendMail(options);
};

export default sendEmail;
