import nodemailer from "nodemailer";
import { FROM_EMAIL, EMAIL_PASSWORD } from "../util/env";

const transporter = nodemailer.createTransport({
  pool: true,
  host: "smtp.porkbun.com",
  port: 465,
  secure: true,
  auth: {
    user: FROM_EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

type Props = {
  emailBody: string;
  emailTo: string;
  subject: string;
};

export function sendEmail({ emailBody, emailTo, subject }: Props) {
  const options = {
    from: FROM_EMAIL,
    to: emailTo,
    subject,
    text: emailBody,
  };

  return new Promise<number>((res, rej) => {
    transporter.sendMail(options, (err, info) => {
      if (err) {
        console.error(err);
        return rej(err);
      }
      res(200);
    });
  });
}
