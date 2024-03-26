const User = require('../../models/user')
const SITE_TITLE = 'shope';
module.exports.login = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (req.session.login) {
            return res.redirect('/');
        } else {
            res.render('auth/login', {
                site_title: SITE_TITLE,
                title: 'Login',
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
module.exports.doLogin = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            // 400 Bad Request
            req.flash('error', 'Invalid email.');
            return res.redirect('/login');
        } else {
            if (user.role === 'student') {
                if (user.isVerified) {
                    user.comparePassword(req.body.password, (error, valid) => {
                        if (error) {
                            return res.status(403).send('Forbidden'); // 403 Forbidden
                        }
                        if (!valid) {
                            // 400 Bad Request
                            req.flash('error', 'Invalid password.');
                            return res.redirect('/login');
                        }
                        req.session.login = user.id;
                        return res.redirect('/');
                    });
                } else {
                    req.flash('error', 'Users not found.');
                    return res.redirect('/login');
                }
            } else {
                user.comparePassword(req.body.password, (error, valid) => {
                    if (error) {
                        req.flash('message', 'WARNING DETECTED!');
                        return res.status(403).send('Forbidden');
                    }
                    if (!valid) {
                        // 400 Bad Request
                        req.flash('message', 'WARNING DETECTED!');
                        return res.redirect('/login');
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