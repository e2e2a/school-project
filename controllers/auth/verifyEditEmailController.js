const SITE_TITLE = 'shope';
const User = require('../../models/user');
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const StudentProfile = require('../../models/studentProfile');

module.exports.verify = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        const sendcode = req.query.sendcode === 'true';
        const userLogin = await User.findById(req.session.login)
        if (!verificationToken) {
            return res.redirect('/register')
        }
        if (userLogin) {
            const userToken = await UserToken.findOne({ token: verificationToken });
            if (userToken.userId.equals(userLogin._id)) {
                if (!userToken) {
                    return res.redirect('/register');
                }
                const expirationCodeDate = userToken.expirationCodeDate;
                const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
                if (!userToken || userToken.expirationDate < new Date()) {
                    return res.redirect('/register');
                }
                const user = await User.findById({ _id: userToken.userId });
                res.render('auth/verifyEditEmail', {
                    site_title: SITE_TITLE,
                    title: 'Verify',
                    session: req.session,
                    currentUrl: req.originalUrl,
                    adjustedExpirationTimestamp: remainingTimeInSeconds,
                    userToken: userToken,
                    sendcode: sendcode,
                    user: user,
                    messages: req.flash(),
                });
            } else {
                return res.status(404).render('404')
            }
        } else {
            return res.redirect('/')
        }
    } catch (error) {
        console.error('Error rendering verification input form:', error);
        return res.status(500).render('500');
    }
};

module.exports.doVerify = async (req, res) => {
    var action = req.body.action;
    const verificationToken = req.body.token;
    if (action === 'submit') {
        try {
            const verificationCode = req.body.verificationCode;
            const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
            // Checking
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            console.log(userToken.verificationCode)
            if (userToken && userToken.expirationDate > new Date()) {
                if (verificationCode === userToken.verificationCode) {
                    if (userToken.expirationCodeDate > new Date()) {
                        const user = await User.findByIdAndUpdate(decodedToken.userId, { email: req.session.emailToChange }, { new: true });
                        req.session.login = user._id;
                        await UserToken.findByIdAndDelete(userToken._id);
                        console.log('Email Change successful.');
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
                                throw new Error('Failed to send email');
                            }
                        };
                        console.log('user email change.');
                        const emailContent = `
                        <div style="text-align: center;">
                            <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                                <h2 style="color: #66c0f4;">Congratulations!</h2>
                                <p style="color: #dcddde;">Dear ${user.email},</p>
                                <p style="color: #dcddde;">We are delighted to inform you that your email address has been successfully change.</p>
                                <p style="color: #dcddde;">Thank you for taking this important step towards securing your account and accessing all the features our platform offers.</p>
                                <p style="color: #dcddde;">If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
                                <p style="color: #dcddde;">Once again, congratulations on successfully verifying your email address!</p>
                            </div>
                        </div> `;
                        sendEmail(
                            'example.onrender.com <example@gmail.com>',
                            user.email,
                            'Congratulation',
                            emailContent
                        );
                        console.log(user.email)
                        res.redirect(`/`);
                    } else {
                        console.log('Code expired', userToken.expirationCodeDate);
                        req.flash('error', 'Code has been expired.');
                        res.redirect(`/verify/email?token=${verificationToken}`);
                    }
                } else {
                    console.log('Verification code does not match');
                    req.flash('error', 'The code does not match.');
                    res.redirect(`/verify/email?token=${verificationToken}`);
                }
            } else {
                console.log('Invalid or expired verification code.');
                const userLogin = await User.findById(req.session.login)
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } catch (error) {
            console.error('Verification failed:', error);
            return res.status(500).render('500');
        }
    } else if (action === 'resend') {
        try {
            const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            const user = await User.findById({ _id: userToken.userId });
            if (userToken) {
                console.log(user._id);
                const verificationCode = sixDigitCode();
                if (verificationToken === userToken.token) {
                    const updateCode = {
                        verificationCode: verificationCode,
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000),
                    };
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'emonawong22@gmail.com',
                            pass: 'nouv heik zbln qkhf',
                        },
                    });
                    // Function to send an email
                    const sendEmail = async (from, to, subject, htmlContent) => {
                        try {
                            const mailOptions = {
                                from,
                                to,
                                subject,
                                html: htmlContent,  // Set the HTML content
                            };
                            const info = await transporter.sendMail(mailOptions);
                            console.log('Email sent:', info.response);
                        } catch (error) {
                            console.error('Error sending email:', error);
                            return res.status(500).render('500');
                        }
                    };
                    // link
                    const emailContent = `
                    <div style="text-align: center;">
                        <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                            <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
                            <p style="color: #dcddde;">Welcome to our platform!</p>
                            <p style="color: #dcddde;">We've just sent a new email to your address.</p>
                            <p style="color: #dcddde;">Please verify your new email address.</p>
                            <p style="color: #dcddde;">Your unique verification code is: <strong>${verificationCode}</strong></p>
                            <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                            <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                            <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                        </div>
                    </div>`;
                    sendEmail(
                        'example.onrender.com <example@gmail.com>',
                        user.email,
                        'New Verification Code for your New Email',
                        emailContent
                    );
                    console.log(user.email)
                    console.log('Code Resend Successfully!');
                    const updatedCode = await UserToken.findByIdAndUpdate(userToken._id, updateCode, {
                        new: true
                    });
                    if (updatedCode) {
                        console.log('code has been updated', updatedCode);
                        console.log(user);
                        res.redirect(`/verify/email?token=${verificationToken}&sendcode=true`);
                    } else {
                        console.log('Error updating code: Code not found or update unsuccessful');
                    }
                } else {
                    // Codes in req.body do not match
                    console.log('Verification codes do not match.');
                    const userLogin = await User.findById(req.session.login)
                    return res.status(404).render('404', {
                        login: req.session.login,
                        userLogin: userLogin,
                    });
                }
            }
        } catch (err) {
            console.log('no token', err);
            return res.status(500).render('500');
        }
    } else if (action === 'cancel') {
        const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
        const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
        try {
            await User.findByIdAndDelete(decodedToken.userId);
            await UserToken.findByIdAndDelete(userToken._id);
            res.redirect('/register')
        } catch (error) {
            console.error('Deletion error:', error.message);
            return res.status(500).render('500');
        }
    } else {
        //this must be status 400 invalid action
        return res.status(500).render('500');
    }
};