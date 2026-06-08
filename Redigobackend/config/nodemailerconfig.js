const nodemailer = require('nodemailer');

 
const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,   
     secure: false,  
     auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD 
     },
     tls: {
          rejectUnauthorized: false
     },
     connectionTimeout: 60000,   
     greetingTimeout: 30000,       
     socketTimeout: 60000        
});

 
const verifyTransporter = async () => {
     try {
          await transporter.verify();
          console.log('✅ SMTP Server is ready to send emails');
          return true;
     } catch (error) {
          console.error('❌ SMTP Configuration Error:', error.message);
          return false;
     }
};

verifyTransporter();

async function sendMail(to, subject, otp) {
    return new Promise(async (resolve, reject) => {
        try {
           
            const isVerified = await verifyTransporter();
            if (!isVerified) {
                throw new Error('SMTP server not ready');
            }

            const mailOptions = {
                from: `"Redigo" <${process.env.EMAIL}>`,  
                to: to,
                subject: subject || "Your OTP Code for Redigo",  
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0891b2;">Welcome to Redigo! 🚗</h2>
                        
                        <p>Hello User,</p>
                        
                        <p>Thank you for using Redigo!</p>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <h3 style="color: #0891b2; margin-top: 0;">Your OTP Code:</h3>
                            <div style="font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 5px; font-family: monospace;">
                                ${otp}
                            </div>
                        </div>
                        
                        <p>Please enter this code to verify your email address. This OTP is valid for <strong>5 minutes</strong>.</p>
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            If you did not request this code, please ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            Best regards,<br>
                            The Redigo Team<br>
                            🚗 Share your ride, share the journey!
                        </p>
                    </div>
                `,
                text: `Hello User,

            Thank you for using Redigo!  

            Your One-Time Password (OTP) is: ${otp}

            Please enter this code to verify your email address. This OTP is valid for 5 minutes.

            If you did not request this code, please ignore this email.

            Best regards,
            The Redigo Team  
            🚗 Share your ride, share the journey!
            `
            };
            
            console.log(' Attempting to send email to:', to);
            console.log(' SMTP Config:', {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                user: process.env.EMAIL ? 'Configured' : 'Missing',
                pass: process.env.EMAIL_PASSWORD ? 'Configured' : 'Missing'
            });
            
           
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.response);
            console.log("Message ID:", info.messageId);
            resolve(info);
            
        } catch (error) {
            console.error(" Email sending failed:", error.message);
            console.error(" Error code:", error.code);
            console.error("Error details:", error);
            reject(error);
        }
    });
}

module.exports = {
    sendMail,
    verifyTransporter,
    transporter
};