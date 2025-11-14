const Brevo = require('@getbrevo/brevo');
require('dotenv').config();

// Initialize Brevo Transactional Email client
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);


const sendEmail = async (to, subject, content, isHtml = true) => {
  try {
   
    const recipients = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];

    
    const emailData = {
      sender: { name: 'JAAPS', email: process.env.SENDER_EMAIL },
      to: recipients,
      subject,
      // if HTML → use htmlContent, else use textContent
      ...(isHtml ? { htmlContent: content } : { textContent: content })
    };

   
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log(` Email sent to: ${recipients.map(r => r.email).join(', ')}`);
    return response;
  } catch (error) {
    console.error(' Email send error:', error.response?.body || error.message);
  }
};

module.exports = sendEmail;
