const User = require('../../models/user')
const SITE_TITLE = 'DSF';
const bcrypt = require('bcrypt');
const { sendEmail, emailContent } = require('../../helper/controllers/auth/emailSender');
const { userToken } = require('../../helper/controllers/auth/userToken');

module.exports.register = async (req, res) => {
    if (req.session.login) {
        const userLogin = await User.findById(req.session.login);
        if (userLogin.role === 'student') {
            return res.redirect('/student');
        } else if (userLogin.role === 'professor') {
            return res.redirect('/professor');
        } else if (userLogin.role === 'admin') {
            return res.redirect('/admin');
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
            req: req,
        });
    }
}

module.exports.doRegister = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            if (existingUser.isVerified) {
                req.flash('error', 'Email Already Used. Please provide another email.');
                return res.redirect('/register');
            } else {
                if (password !== confirmPassword) {
                    req.flash('error', 'Password does not match.');
                    return res.redirect('/register');
                }
                const hashedNewPassword = await bcrypt.hash(req.body.password, 10);
                const userUpdate = {
                    email: req.body.email,
                    role: 'student',
                    password: hashedNewPassword,
                    isVerified: false,
                };
                const user = await User.findByIdAndUpdate(existingUser._id, userUpdate, { new: true });
                const tokenObject = await userToken(user);
                const emailHtmlContent = await emailContent(user, tokenObject);
                sendEmail(
                    'example.onrender.com <school@gmail.com>',
                    user.email,
                    'Verify your email',
                    emailHtmlContent
                );
                return res.redirect(`/verify?token=${tokenObject.token}&sendcode=true`,);
            }
        } else {
            if (password !== confirmPassword) {
                req.flash('error', 'Password does not match.');
                return res.redirect('/register');
            }
            const user = new User({
                email: req.body.email,
                role: 'student',
                password: req.body.password,
                isVerified: false,
            });
            await user.save();
            const tokenObject = await userToken(user);
            const emailHtmlContent = await emailContent(user, tokenObject);
            sendEmail(
                'example.onrender.com <example@gmail.com>',
                user.email,
                'Verify your email',
                emailHtmlContent
            );
            return res.redirect(`/verify?token=${tokenObject.token}&sendcode=true`);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).render('500');
    }
}