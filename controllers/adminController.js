const User = require('../models/userModel')
const sendEmail = require('../utils/email')

exports.getUser = async(req , res)=>{
    try{
    const user = await User.find().populate('catalogues', 'name').sort({createdAt: -1});
    res.status(200).json({success:true , message:"All users fetched successfully", data:user});
    }catch(error){
        console.error("error fetching the data " , error);
        res.status(500).json({success:false , message:"failed to fetch users"});
    }

};

// exports.getVerifiedUser = async(req , res)=>{
//     try{
//         const user = await User.find({isVerified:true}).populate('catalogues', 'name') // only verified users will fetched
//         res.status(200).json({success:true , message:"all verified users are fetched" , data:user})

//     }catch(error){
//         console.error("error occured in verified users")
//         res.status(500).json({success:false , message:"error occured"});
//     }

// };

// exports.getNotVerifiedUser = async(req , res)=>{
//     try{
//         const user = await User.find({isVerified:false}).populate('catalogues', 'name') // only not verified users will fetched
//         res.status(200).json({success:true , message:"all verified users are fetched" , data:user})

//     }catch(error){
//         console.error("error occured in verified users")
//         res.status(500).json({success:false , message:"error occured"});
//     }

// };


exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // find existing user BEFORE update
    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    // only one updation allowed
    if (existingUser.isVerified === true && status === "false") {
      return res.status(400).json({
        success: false,
        message: "Verified users cannot be unverified"
      });
    }

    // update verification status
    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: status },
      { new: true }
    ).populate("catalogues", "name");

    // Generate password ONLY first time
    if (!existingUser.isVerified && status === "true") {
      const randomPassword = Math.random().toString(36).slice(-8);

      user.user_name = user.email;
      user.password = randomPassword;
      await user.save();

      const subject = "Your Account Has Been Verified";
      const html = `
        <h2>Hello, ${user.full_name}!</h2>
        <p>Your account has been verified successfully.</p>
        <p>You can now log in using the following credentials:</p>
        <ul>
          <li><b>Username:</b> ${user.email}</li>
          <li><b>Password:</b> ${randomPassword}</li>
        </ul>
        <p>Please change your password after logging in for security reasons.</p>
        <br/>
        <p>The Team</p>
      `;

      await sendEmail(user.email, subject, html);
      console.log(` verification email sent to ${user.email}`);
    }

    res.status(200).json({
      success: true,
      message: status === "true" ? "User verified" : "User unverified",
      data: user
    });

  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating verification status",
      error: error.message
    });
  }
};
