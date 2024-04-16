const nodemailer = require('nodemailer');

async function sendEmail(from, to, subject, htmlContent) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'emonawong22@gmail.com',
            pass: 'nouv heik zbln qkhf',
        },
    });

    try {
        const mailOptions = { from, to, subject, html: htmlContent };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

async function emailContent(user, tokenObject) {
    const emailContent = `
                        <div style="text-align: center;">
                            <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                                <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
                                <p style="color: #dcddde;">Welcome aboard!</p>
                                <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                                <p style="color: #dcddde;">Your unique verification code is: <strong>${tokenObject.verificationCode}</strong></p>
                                <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                                <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                                <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                            </div>
                        </div>
                            `;
    return emailContent;
}

async function emailContentSuccess(user) {
    const emailContent = `
                        <div style="text-align: center;display: block;">
                            <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                                <h3 style="color: #66c0f4; margin-bottom: 20px;"><a href="http://example.onrender.com" style="color: #007bff; text-decoration: none;">example.onrender.com</a></h3>
                                <h4 style="color: #dcddde;">Greetings, ${user.email}!</h4>
                                <p style="color: #dcddde;">Hooray! Your email verification is successfully completed!</p>
                                <p style="color: #dcddde;">Welcome to our community! Now that you're officially registered, it's time to embark on an exciting journey through our platform.</p>
                                <p style="color: #dcddde;">We extend our heartfelt gratitude to you for confirming your email address.</p>
                                <p style="color: #dcddde;">Ensuring account confirmation is a vital step in safeguarding our platform against spam and ensuring seamless communication with our valued users.</p>
                                <p style="color: #dcddde;">Moreover, email verification enhances security, reducing the risk of users registering with outdated or incorrect email addresses.</p>
                                <p style="color: #dcddde;">As you dive into our customer portal, rest assured that all accounts are rigorously validated to maintain a secure and user-centric environment.</p>
                            </div>
                        </div>
                        `;
    return emailContent;
}

async function emailContentResend(user, updatedCode) {
    const emailContent = `
                    <div style="text-align: center;display: block;">
                        <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                            <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
                            <p style="color: #dcddde;">Welcome aboard!</p>
                            <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                            <p style="color: #dcddde;">Your unique verification code is: <strong>${updatedCode.verificationCode}</strong></p>
                            <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                            <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                            <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                        </div>
                    </div>
                    `;
    return emailContent;
}

async function emailContentEditEmail(user, tokenObject) {
    const emailContent = `
                        <div style="text-align: center;">
                            <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                                <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
                                <p style="color: #dcddde;">Welcome aboard!</p>
                                <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                                <p style="color: #dcddde;">Your unique verification code is: <strong>${tokenObject.verificationCode}</strong></p>
                                <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                                <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                                <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                            </div>
                        </div>
                            `;
    return emailContent;
}

async function emailContentEditEmailResend(user, updatedCode) {
    const emailContent = `
                    <div style="text-align: center;">
                        <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                            <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
                            <p style="color: #dcddde;">Welcome to our platform!</p>
                            <p style="color: #dcddde;">We've just sent a new email to your address.</p>
                            <p style="color: #dcddde;">Please verify your new email address.</p>
                            <p style="color: #dcddde;">Your unique verification code is: <strong>${updatedCode.verificationCode}</strong></p>
                            <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                            <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                            <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                        </div>
                    </div>`;
    return emailContent;
}

async function emailContentEditEmailSuccess(user) {
    const emailContent = `
                        <div style="text-align: center;">
                            <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                                <h2 style="color: #66c0f4;">Congratulations!</h2>
                                <p style="color: #dcddde;">Dear ${user.firstname},</p>
                                <p style="color: #dcddde;">We are delighted to inform you that your email address has been successfully change.</p>
                                <p style="color: #dcddde;">Thank you for taking this important step towards securing your account and accessing all the features our platform offers.</p>
                                <p style="color: #dcddde;">If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
                                <p style="color: #dcddde;">Once again, congratulations on successfully verifying your email address!</p>
                            </div>
                        </div> `;
    return emailContent;
}

module.exports = {
    sendEmail,
    emailContent,
    emailContentSuccess,
    emailContentResend,
    emailContentEditEmail,
    emailContentEditEmailResend,
    emailContentEditEmailSuccess,
};
