const User = require('../models/userModel');
const Catalogue = require('../models/catelogueModel');
const sendEmail = require('../utils/email');

exports.registerUser = async (req, res) => {
  try {
    const data = req.body;
    console.log(data)
    // Check for existing user
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Validate catalogue IDs sent from frontend
    if (!data.catalogues || !Array.isArray(data.catalogues) || data.catalogues.length === 0) {
      return res.status(400).json({ message: "Please select at least one catalogue." });
    }

    // Ensure all provided catalogue IDs exist
    const validCatalogues = await Catalogue.find({ _id: { $in: data.catalogues } });
    if (validCatalogues.length !== data.catalogues.length) {
      return res.status(400).json({ message: "Some catalogues are invalid." });
      console.log("invalid catalogues");
    }

    // Create new user
    const newUser = new User({
      full_name: data.full_name,
      company: data.company,
      email: data.email,
      country: data.country,
      catalogues: data.catalogues.map((id)=>{
        return {
          catalogueId:id
        }
      }) // store catalogue IDs
    });
    console.log(newUser);
    await newUser.save();

    // Email to Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New User Registered",
      `
      <h2>New User Registration</h2>
      <p><b>Full Name:</b> ${data.full_name}</p>
      <p><b>Company:</b> ${data.company}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Country:</b> ${data.country}</p>
      <p><b>Catalogue IDs:</b> ${data.catalogues.join(', ')}</p>
      <br/>
      <p>Check your dashboard for more info.</p>
      `
    );

    // Email to User
    await sendEmail(
      data.email,
      "Thank You for Registering",
      `
      <h2>Welcome, ${data.full_name}!</h2>
      <p>Thank you for registering with us.</p>
      <p>We’ve received your details:</p>
      <ul>
        <li><b>Company:</b> ${data.company}</li>
        <li><b>Country:</b> ${data.country}</li>
        <li><b>Catalogue IDs:</b> ${data.catalogues.join(', ')}</li>
      </ul>
      <br/>
      <p>We'll contact you shortly.</p>
      <p>– The Team</p>
      `
    );

    // Success response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: newUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
};
