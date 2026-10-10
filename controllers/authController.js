const bcrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, studentId, password } = req.body;

    // Check required fields
    if (!fullName || !email || !studentId || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check if student ID already exists
    const existingStudentId = await User.findOne({ studentId });

    if (existingStudentId) {
      return res.status(400).json({
        message: "Student ID already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const user = await User.create({
      fullName,
      email,
      studentId,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

module.exports = {
  registerUser,
};