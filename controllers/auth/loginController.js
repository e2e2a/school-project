const User = require('../../models/user')
const SITE_TITLE = 'shope';
module.exports.login = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (req.session.login) {
            if (userLogin.role === 'student') {
                return res.redirect('/student');
            } else if (userLogin.role === 'professor') {
                return res.redirect('/professor');
            }else if (userLogin.role === 'admin') {
                return res.redirect('/admin');
            } else{
                console.log('forbidden')
            }
        } else {
            res.render('auth/login', {
                site_title: SITE_TITLE,
                title: 'Login',
                session: req.session,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                req: req,
            });
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}
module.exports.doLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/');
        } else {
            if (user.role === 'student') {
                if (user.isVerified) {
                    user.comparePassword(req.body.password, (error, valid) => {
                        if (error) {
                            return res.status(403).send('Forbidden');
                        }
                        if (!valid) {
                            req.flash('error', 'Invalid password.');
                            return res.redirect('/');
                        }
                        req.session.login = user.id;
                        return res.redirect('/student');
                    });
                } else {
                    req.flash('error', 'User not found.');
                    return res.redirect('/');
                }
            } else if (user.role === 'professor') {
                user.comparePassword(req.body.password, (error, valid) => {
                    if (error) {
                        return res.status(403).send('Forbidden');
                    }
                    if (!valid) {
                        req.flash('error', 'Invalid password.');
                        return res.redirect('/');
                    }
                    req.session.login = user.id;
                    return res.redirect('/professor');
                });
            } else {
                user.comparePassword(req.body.password, (error, valid) => {
                    if (error) {
                        return res.status(403).send('Forbidden'); 
                    }
                    if (!valid) {
                        req.flash('error', 'Invalid password.');
                        return res.redirect('/');
                    }
                    req.session.login = user.id;
                    return res.redirect('/admin');
                });
            }

        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}