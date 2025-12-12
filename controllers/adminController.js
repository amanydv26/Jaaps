const User = require("../models/userModel");
const sendEmail = require("../utils/email");

exports.getUser = async (req, res) => {
  try {
    const user = await User.find(
      { role: "user" },
      "full_name company email country isVerified user_name catalogues isActive"
    )
      .populate({
  path: "catalogues.catalogueId",
  select: "name catalogue_full_path category",
  populate: {
    path: "category",
    select: "name"
  }
})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("error fetching the data ", error);
    res.status(500).json({ success: false, message: "failed to fetch users" });
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
        message: "User not found",
      });
    }
    // only one updation allowed
    if (existingUser.isVerified === true) {
      return res.status(400).json({
        success: false,
        message: "Verified users cannot be unverified",
      });
    }

    // update verification status
    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: status },
      { new: true }
    );

    // Generate password ONLY first time
    const randomPassword = Math.random().toString(36).slice(-8);

    user.user_name = user.user_name;
    user.password = randomPassword;
    await user.save();

    const subject = "Your Account Has Been Verified";
    const html = `
        <h2>Hello, ${user.full_name}!</h2>
        <p>Your account has been verified successfully.</p>
        <p>You can now log in using the following credentials:</p>
        <ul>
          <li><b>Username:</b> ${user.user_name}</li>
          <li><b>Password:</b> ${randomPassword}</li>
        </ul>
        <p>Please change your password after logging in for security reasons.</p>
        <br/>
        <p>The Team</p>
      `;

    await sendEmail(user.email, subject, html);
    console.log(` verification email sent to ${user.email}`);

    // const userObj = user.toObject();
    // delete userObj.password;
    // delete userObj.user_name;

    // Step 3 — re-fetch CLEAN version without password/user_name
    const cleanUser = await User.findById(id)
      .select("full_name company email country isVerified catalogues")
      .populate("catalogues", "name catalogue_full_path");

    return res.status(200).json({
      success: true,
      message: "User verified",
      data: cleanUser,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating verification status",
      error: error.message,
    });
  }
};


exports.adminCreateCredentials = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password, catalogues, expiryDate } = req.body;
    console.log(userId , catalogues)
    const user = await User.findById(userId).populate("catalogues.catalogueId");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update username
    if (username) user.user_name = username;

    // Update password
    if (password) {
      user.password = password
    }

    // -------------------------
    // UPDATE ALLOWED & EXPIRY
    // -------------------------
    if (Array.isArray(catalogues)) {
      user.catalogues = user.catalogues.map((cat) => {
        const match = catalogues.find((c) => String(c.id) === String(cat.catalogueId._id));

        if (match) {
          return {
            ...cat.toObject(),
            allowed: match.checked === true,   // << IMPORTANT
            expiryDate: match.checked ? expiryDate : null
          };
        }

        return cat;
      });
    }

    //mail
    user.isVerified = true;

    await user.save();
     const subject = "Your Account Has Been Verified and catalogues access has been provided";
    const html = `
        <h2>Hello, ${user.full_name}!</h2>
        <p>Your account has been verified successfully.</p>
        <p>You can now log in using the following credentials:</p>
        <ul>
          <li><b>Username:</b> ${user.email}</li>
          <li><b>Password:</b> ${password}</li>
        </ul>
        <p></p>
        <br/>
        <p>The Team</p>
      `;

    await sendEmail(user.email, subject, html);
    console.log(` verification email sent to ${user.email}`);
    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });

  } catch (error) {
    console.log("Error updating:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },     //  Mark user as inactive
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Deactivate user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user from DB
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updateUserCataloguePermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { enable = [], remove = [], expiryDate } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // STEP 1: REMOVE unwanted catalogues
    user.catalogues = user.catalogues.filter(
      (c) => !remove.includes(c.catalogueId.toString())
    );

    // STEP 2: ENABLE selected catalogues
    enable.forEach((catId) => {
      const existing = user.catalogues.find(
        (c) => c.catalogueId.toString() === catId
      );

      if (existing) {
        // catalogue already exists → update it
        existing.allowed = true;
        existing.expiryDate = expiryDate || null;
      } else {
        // catalogue not present → add it
        user.catalogues.push({
          catalogueId: catId,
          allowed: true,
          expiryDate: expiryDate || null,
        });
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId).populate(
      "catalogues.catalogueId"
    );

    return res.status(200).json({
      success: true,
      message: "Catalogue permissions updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Catalogue update error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};