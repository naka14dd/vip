const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// تخزين مؤقت للكود (بلا Database)
let verificationCodes = {};

// إعداد Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "YOUR_GMAIL@gmail.com",   // ✨ الإيميل ديالك
        pass: "YOUR_APP_PASSWORD"       // ✨ App Password من Google
    }
});

// تحقق من الاتصال
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Error:", error);
    } else {
        console.log("✅ SMTP Server Ready");
    }
});

// API: إرسال كود
app.post('/send-code', (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000); // 6 أرقام
    verificationCodes[email] = code;

    const mailOptions = {
        from: "YOUR_GMAIL@gmail.com",
        to: email,
        subject: "RN FAMILY Verification Code",
        text: `Your verification code is: ${code}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Error sending verification code");
        }
        res.send("Verification code sent!");
    });
});

// API: تحقق من الكود
app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;
    if (verificationCodes[email] && verificationCodes[email] == code) {
        delete verificationCodes[email]; // مسح الكود بعد التفعيل
        return res.send("Verified!");
    }
    res.status(400).send("Invalid code");
});

// تشغيل السيرفر
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
