const User = require('../../models/user');
const StudentProfile = require('../../models/studentProfile');
const SITE_TITLE = 'DSF';
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'student') {
                const studentProfile = await StudentProfile.findOne({ userId: userLogin._id }).populate('userId').populate('courseId');
                res.render('user/form-print', {
                    site_title: SITE_TITLE,
                    title: 'Form',
                    messages: req.flash(),
                    currentUrl: req.originalUrl,
                    userLogin: userLogin,
                    req: req,
                    studentProfile: studentProfile,
                });
            } else {
                return res.status(404).render('404');
            }
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

module.exports.print = async (req, res) => {
    try {
    const studentId = req.body.studentId;
    console.log('studentId',studentId)
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        console.log('Invalid ObjectId:', studentId);
        return res.status(404).render('404');
    }
    const studentProfile = await StudentProfile.findById(studentId).populate('userId').populate('courseId');
    const templatePath = path.join(__dirname, '../../views/pdf/enrollment.ejs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(templateContent,{studentProfile:studentProfile});

        const browser = await puppeteer.launch({
            ...puppeteerConfig,

            headless: true
        });

        const page = await browser.newPage();
        await page.setContent(html);

        // Wait for the PDF generation to finish
        const pdfBuffer = await page.pdf({
            format: 'Legal',
            printBackground: true,
        });

        // Close the page and browser after PDF generation is complete
        await browser.close();

        // Set response headers to indicate PDF content
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="enrolly.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.log('err:', err);
        req.flash('message', 'Internal error occurred.');
        // Render a 500 error page if an error occurs
        return res.status(500).send('500', err);
    }
}
