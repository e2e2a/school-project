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
    const userLogin = await User.findById(req.session.login);
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
}

module.exports.print = async (req, res) => {
    const actions = req.body.actions;
    const studentId = req.body.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        console.log('Invalid ObjectId:', studentId);
        return res.status(404).render('404', { role: 'student' });
    }
    if (actions === 'print') {
        const studentProfile = await StudentProfile.findById(studentId).populate('userId').populate('courseId');
        if (studentProfile.printLimit >= 3) {
            req.flash('message', 'You have exceed to the limit of print.')
            return res.redirect('/form')
        }
        const printLimit = studentProfile.printLimit + 1;
        await StudentProfile.findByIdAndUpdate(studentProfile._id, { printLimit: printLimit }, { new: true });
        const templatePath = path.join(__dirname, '../../views/pdf/enrollment.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { studentProfile: studentProfile });

        const browser = await puppeteer.launch({
            ...puppeteerConfig,

            headless: true
        });

        const page = await browser.newPage();
        await page.setContent(html);

        const pdfBuffer = await page.pdf({
            format: 'Legal',
            printBackground: true,
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="enrolly.pdf"`);
        res.send(pdfBuffer);
    } else if (actions === 'cancel') {
        await StudentProfile.findByIdAndUpdate(studentId, { isEnrolling: false }, { new: true });
        return res.redirect('/form')
    } else {
        return res.status(404).render('404', { role: 'student' });
    }
}
