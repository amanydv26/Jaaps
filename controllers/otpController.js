const Otp = require("../models/otpModel");
const generateOtp = require("../utils/otpGenerator");
const sendEmail = require("../utils/email");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOtp();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const html = `
      <div style="font-family:Arial">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      </div>
    `;

    const response  = await sendEmail(email, "Your OTP Code", html, true);

    res.json({ success: true });
    console.log("sent otp to" , response);
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ success: false });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    console.log("record otp ", record)
    if (!record) return res.json({ success: false });

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.json({ success: false });
    }

    await Otp.deleteOne({ _id: record._id });

    res.json({ success: true });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ success: false });
  }
};
