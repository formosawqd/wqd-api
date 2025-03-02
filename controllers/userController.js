const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const register = async (req, res) => {
  //   console.log(req);
  console.log(req.body);

  const { username, email, password } = req.body;

  // 检查 password 是否存在
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const saltRounds = 10; // 设置加密强度
    const hashedPassword = await bcrypt.hash(password, saltRounds); // 加密密码
    await User.create(username, email, hashedPassword); // 创建用户
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error); // 打印错误信息
    res.status(500).json({ error: "Error registering user" });
  }
};

const login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
};

module.exports = { register, login, getProfile };
