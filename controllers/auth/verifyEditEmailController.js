const SITE_TITLE = 'shope';
const User = require('../../models/user');
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const StudentProfile = require('../../models/studentProfile');
const { sendEmail, emailContentEditEmailResend, emailContentEditEmailSuccess } = require('../../helper/controllers/auth/emailSender');

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
                        const emailHtmlContent = await emailContentEditEmailSuccess(user);
                        sendEmail(
                            'example.onrender.com <example@gmail.com>',
                            user.email,
                            'Congratulation',
                            emailHtmlContent
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
                const userLogin = await User.findById(req.session.login);
                return res.status(404).render('404', { role: userLogin.role });
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
                    console.log('Code Resend Successfully!');
                    const updatedCode = await UserToken.findByIdAndUpdate(userToken._id, updateCode, {
                        new: true
                    });
                    const emailHtmlContent = await emailContentEditEmailResend(user, updatedCode);
                    sendEmail(
                        'example.onrender.com <example@gmail.com>',
                        user.email,
                        'New Verification Code for your New Email',
                        emailHtmlContent
                    );
                    if (updatedCode) {
                        res.redirect(`/verify/email?token=${verificationToken}&sendcode=true`);
                    } else {
                        console.log('Error updating code: Code not found or update unsuccessful');
                    }
                } else {
                    const userLogin = await User.findById(req.session.login);
                    return res.status(404).render('404', { role: userLogin.role });
                }
            }
        } catch (err) {
            console.log('no token', err);
            return res.status(500).render('500');
        }
    }
};