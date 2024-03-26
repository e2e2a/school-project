const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config.cjs');
const ejs = require('ejs');

module.exports.print = async (req, res) => {
    const templatePath = path.join(__dirname, '../views/pdf/enrollment.ejs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(templateContent);

    try {
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
        res.setHeader('Content-Disposition', `inline; filename="enrollment.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.log('err:', err);
        req.flash('message', 'Internal error occurred.');
        // Render a 500 error page if an error occurs
        return res.status(500).send('500', err);
    }
}
