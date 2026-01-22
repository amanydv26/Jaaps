require("dotenv").config();
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async (to, subject, content, isHtml = true) => {
  try {
    const recipients = Array.isArray(to) ? to : [to];

    const params = {
      Source: `"JAAPS" <${process.env.SENDER_EMAIL}>`,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          ...(isHtml
            ? {
                Html: {
                  Data: content,
                  Charset: "UTF-8",
                },
              }
            : {
                Text: {
                  Data: content,
                  Charset: "UTF-8",
                },
              }),
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await ses.send(command);

    console.log("checking", response);
    return response;
  } catch (err) {
    console.error("AWS SES error:", err.message);
    throw err;
  }
};

module.exports = sendEmail;
