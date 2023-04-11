import { createTransport } from "nodemailer";
import { nodemailerMjmlPlugin } from "nodemailer-mjml";
import appRootPath from "app-root-path";
import { PasswordRecoveryMailDTO } from "../dto/passwordRecoveryMailDTO";
import { VerifyMailDTO } from "../dto/verifyMailDTO";

let transport;

function initTrasport() {
  transport = createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  transport.use(
    "compile",
    nodemailerMjmlPlugin({
      templateFolder: appRootPath.resolve("mailTemplates"),
    })
  );
}

export async function sendPasswordRecoveryEmail(
  passwordRecover: PasswordRecoveryMailDTO
) {
  if (!transport) initTrasport();

  return await transport.sendMail({
    from: process.env.MAIL_SENDER,
    to: passwordRecover.userEmail,
    subject: "Coding Contest 2.0 - Recupera password",
    templateName: "passwordRecovery",
    templateData: {
      userName: passwordRecover.userName,
      link: passwordRecover.passwordRecoveryLink,
    },
  });
}

export async function sendVerifyEmail(verifyMail: VerifyMailDTO) {
  if (!transport) initTrasport();

  return await transport.sendMail({
    from: process.env.MAIL_SENDER,
    to: verifyMail.userEmail,
    subject: "Coding Contest 2.0 - Verifica email",
    templateName: "verifyMail",
    templateData: {
      userName: verifyMail.userName,
      link: verifyMail.verifyLink,
    },
  });
}
