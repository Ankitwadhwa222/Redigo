const authService = require("../service/authService");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.signup({
     name,
     email,
     password,
    });
    res.cookie('token', user.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', maxAge: 7*24*60*60*1000 });
    res.status(201).json({ message: "User registered successfully", user: { id: user.id, name: user.name, email: user.email }, token: user.token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const signin = async (req, res) => {
     try {
       const { email, password } = req.body;
       const result = await authService.signin({ email, password });
       res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', maxAge: 7*24*60*60*1000 });
       res.status(200).json({ message: "User logged in successfully", user: { id: result.id, name: result.name, email: result.email }, token: result.token });
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
};
module.exports = { signup, signin };