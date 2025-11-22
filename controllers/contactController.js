const enquiry = require('../models/enquiry');
const sendEmail = require('../utils/email');

exports.Contact = async (req, res) => { 
  try {
    const data = req.body;

    const contact = new enquiry(data);
    await contact.save();

    // --- Send email to admin ---
    const subject = data.subject || "New Contact Message";
    const htmlContent = `
      <h2>New Contact Message</h2>
      <p><b>Name:</b> ${data.full_name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Phone:</b> ${data.phone || "Not provided"}</p>
      <p><b>Message:</b> ${data.message}</p>
    `;

    await sendEmail(process.env.ADMIN_EMAIL, subject, htmlContent);

    // --- Send confirmation email to user ---
    const userSubject = "We have received your enquiry";
    const userHtml = `
      <h2>Thank You for Contacting Us</h2>
      <p>Hi <b>${data.full_name}</b>,</p>
      <p>Your enquiry has been received. Our team will get back to you soon.</p>
      <hr/>
      <p><b>Your Submitted Message:</b></p>
      <p>${data.message}</p>
      <br/>
      <p>Regards,<br/>Support Team</p>
    `;

    await sendEmail(data.email, userSubject, userHtml);

    res.status(200).json({
      success: true,
      message: "Your message has been submitted successfully. A confirmation email has been sent.",
      data: data
    });

  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving your message"
    });
  }
};
