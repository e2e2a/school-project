const SITE_TITLE = 'DSF';
const User = require('../../models/user');
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const StudentProfile = require('../../models/studentProfile');
const { sendEmail, emailContentSuccess, emailContentResend } = require('../../helper/controllers/auth/emailSender');

module.exports.verify = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        const sendcode = req.query.sendcode === 'true';
        const userLogin = await User.findById(req.session.login)
        if (!verificationToken) {
            return res.redirect('/register')
        }
        const userToken = await UserToken.findOne({ token: verificationToken });
        if (!userToken) {
            return res.redirect('/register')
        }
        const expirationCodeDate = userToken.expirationCodeDate;
        const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
        if (!userToken || userToken.expirationDate < new Date()) {
            return res.redirect('/register')
        }
        const user = await User.findById({ _id: userToken.userId });
        res.render('auth/verify', {
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
    } catch (error) {
        console.error('Error rendering verification input form:', error);
        return res.status(500).render('500');
    }
};

module.exports.doVerify = async (req, res) => {
    var action = req.body.action;
    const verificationToken = req.body.token;
    if (action === 'submit') {
        const verificationCode = req.body.verificationCode;
        const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
        // Checking
        const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
        console.log(userToken.verificationCode)
        if (userToken && userToken.expirationDate > new Date()) {
            if (verificationCode === userToken.verificationCode) {
                if (userToken.expirationCodeDate > new Date()) {
                    const user = await User.findByIdAndUpdate(decodedToken.userId, { isVerified: true });
                    req.session.login = user._id;
                    await UserToken.findByIdAndDelete(userToken._id);
                    console.log('Email verification successful. Registration completed.');
                    const studentProfile = new StudentProfile({
                        userId: user._id,
                        isVerified: false
                    });
                    console.log('studentProfile created')
                    await studentProfile.save();
                    const emailHtmlContent = await emailContentSuccess(user);
                    sendEmail(
                        'example.onrender.com <example@gmail.com>',
                        user.email,
                        'Congratulation!',
                        emailHtmlContent
                    );
                    res.redirect(`/student`);
                } else {
                    console.log('Code expired', userToken.expirationCodeDate)
                    req.flash('error', 'Code has been expired.');
                    res.redirect(`/verify?token=${verificationToken}`);
                }
            } else {
                req.flash('error', 'The code does not match.');
                res.redirect(`/verify?token=${verificationToken}`);
            }
        } else {
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', { role: userLogin.role });
        }
    } else if (action === 'resend') {
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
                const updatedCode = await UserToken.findByIdAndUpdate(userToken._id, updateCode, { new: true });
                const emailHtmlContent = await emailContentResend(user, userToken, updatedCode);
                sendEmail(
                    'example.onrender.com <example@gmail.com>',
                    user.email,
                    'New Email Verification',
                    emailHtmlContent
                );

                console.log('code has been updated', updatedCode);
                res.redirect(`/verify?token=${verificationToken}&sendcode=true`);
            } else {
                const userLogin = await User.findById(req.session.login)
                return res.status(404).render('404', { role: userLogin.role });
            }
        }
    }
};