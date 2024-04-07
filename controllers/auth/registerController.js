const User = require('../../models/user')
const SITE_TITLE = 'DSF';
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
module.exports.register = async (req, res) => {
    try {
        if (req.session.login) {
            const userLogin = await User.findById(req.session.login);
            if(userLogin.role === 'student'){
                return res.redirect('/student');
            } else if(userLogin.role === 'professor'){
                return res.redirect('/professor');
            } else if(userLogin.role === 'professor'){
                return res.redirect('/professor');
            } else {
                return res.status(404).render('404');
            }
        } else {
            res.render('auth/register', {
                site_title: SITE_TITLE,
                title: 'Register',
                session: req.session,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                req: req,
            });
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

module.exports.doRegister = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emonawong22@gmail.com',
                pass: 'nouv heik zbln qkhf',
            },
        });
        const sendEmail = async (from, to, subject, htmlContent) => {
            try {
                const mailOptions = {
                    from,
                    to,
                    subject,
                    html: htmlContent,
                };
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).render('500');
            }
        };
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        const existingUser = await User.findOne({ email: email });
        console.log(existingUser)
        if (existingUser) {
            if (existingUser.isVerified) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/register');
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/register');
                }
                const userUpdate = {
                    email: req.body.email,
                    role: 'student',
                    password: req.body.password,
                    isVerified: false,
                };
                const updatedUser = await User.findByIdAndUpdate(existingUser._id, userUpdate, { new: true });
                const registrationToken = jwt.sign({ userId: updatedUser._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                const verificationCode = sixDigitCode();

                const userToken = new UserToken({
                    userId: updatedUser._id,
                    token: registrationToken,
                    verificationCode: verificationCode,
                    expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                    expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000) // 5 mins expiration
                });
                await userToken.save();


                const verificationLink = `http://example.onrender.com/verify?token=${registrationToken}`;
                const emailContent = `
                <div style="text-align: center;">
                    <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                        <h2 style="color: #66c0f4;">Hello ${updatedUser.email},</h2>
                        <p style="color: #dcddde;">Welcome aboard!</p>
                        <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                        <p style="color: #dcddde;">Your unique verification code is: <strong>${verificationCode}</strong></p>
                        <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                        <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                        <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                    </div>
                </div>
                        `;
                sendEmail(
                    'example.onrender.com <school@gmail.com>',
                    updatedUser.email,
                    'Verify your email',
                    emailContent
                );
                console.log('Verification email sent. Please verify your email to complete registration.');
                return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);
            }
        } else {
            if (password !== confirmPassword) {
                req.flash('message', 'Password does not match.');
                return res.redirect('/register');
            }
            const user = new User({
                email: req.body.email,
                role: 'student',
                password: req.body.password,
                isVerified: false,
            });
            await user.save();
            const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
            const verificationCode = sixDigitCode();

            const userToken = new UserToken({
                userId: user._id,
                token: registrationToken,
                verificationCode: verificationCode,
                expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000) // 5 mins expiration
            });
            await userToken.save();

            const verificationLink = `http://example.onrender.com/verify?token=${registrationToken}`;
            const emailContent = `
            <div style="text-align: center;">
                <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                    <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
                    <p style="color: #dcddde;">Welcome aboard!</p>
                    <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                    <p style="color: #dcddde;">Your unique verification code is: <strong>${verificationCode}</strong></p>
                    <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                    <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                    <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                </div>
            </div>
                `;
            sendEmail(
                'example.onrender.com <example@gmail.com>',
                user.email,
                'Verify your email',
                emailContent
            );
            console.log('Verification email sent. Please verify your email to complete registration.');
            return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).render('500');
    }
}