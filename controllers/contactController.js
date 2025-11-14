const enquiry = require('../models/enquiry')
const sendEmail = require('../utils/email')

exports.Contact = async(req , res)=>{ 
    try{
        const data = req.body;
        const contact = new enquiry(data);
        await contact.save();

       // Send email to admin
        const subject = data.subject;
        const htmlContent = `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${data.full_name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Phone:</b> ${data.phone || "Not provided"}</p>
        <p><b>Message:</b> ${data.message}</p>
    `;

        await sendEmail(process.env.ADMIN_EMAIL, subject, htmlContent);

        res.status(200).json({
        success: true,
        message: "Your message has been submitted successfully",
        data: data
        });
    }catch(error){
        console.error("Contact form error:", error);
        res.status(500).json({
        success: false,
        message: "Server error while saving your message"
        });
    }
};