const nodemailer = require('nodemailer');
const config = require('../config/config');
const path = require('path');
const ejs = require('ejs');

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport(config.email.smtp);
        this.templateDir = path.join(__dirname, '../views/emails');
    }

    /**
     * Send an email
     * @param {Object} options - Email options
     * @returns {Promise} Nodemailer send promise
     */
    async sendMail(options) {
        try {
            const mailOptions = {
                from: `"${config.company.name}" <${config.email.from.email}>`,
                ...options
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Render email template with data
     * @param {string} template - Template name
     * @param {Object} data - Template data
     * @returns {Promise<string>} Rendered HTML
     */
    async renderTemplate(template, data = {}) {
        try {
            const templatePath = path.join(this.templateDir, `${template}.ejs`);
            const html = await ejs.renderFile(templatePath, {
                ...data,
                config,
                company: config.company
            });
            return html;
        } catch (error) {
            console.error('Error rendering email template:', error);
            throw error;
        }
    }

    /**
     * Send welcome email
     * @param {Object} user - User object
     * @returns {Promise} Send mail promise
     */
    async sendWelcomeEmail(user) {
        const html = await this.renderTemplate('welcome', { user });
        return this.sendMail({
            to: user.email,
            subject: `Welcome to ${config.company.name}!`,
            html
        });
    }

    /**
     * Send contact form confirmation
     * @param {Object} contact - Contact form data
     * @returns {Promise} Send mail promise
     */
    async sendContactConfirmation(contact) {
        const html = await this.renderTemplate('contact-confirmation', { contact });
        return this.sendMail({
            to: contact.email,
            subject: `Thank you for contacting ${config.company.name}`,
            html
        });
    }

    /**
     * Send contact form notification to admin
     * @param {Object} contact - Contact form data
     * @returns {Promise} Send mail promise
     */
    async sendContactNotification(contact) {
        const html = await this.renderTemplate('contact-notification', { contact });
        return this.sendMail({
            to: config.company.email,
            subject: 'New Contact Form Submission',
            html
        });
    }

    /**
     * Send password reset email
     * @param {Object} user - User object
     * @param {string} resetToken - Password reset token
     * @returns {Promise} Send mail promise
     */
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${config.server.url}/reset-password/${resetToken}`;
        const html = await this.renderTemplate('password-reset', { user, resetUrl });
        return this.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html
        });
    }

    /**
     * Send test drive request confirmation
     * @param {Object} request - Test drive request data
     * @returns {Promise} Send mail promise
     */
    async sendTestDriveConfirmation(request) {
        const html = await this.renderTemplate('test-drive-confirmation', { request });
        return this.sendMail({
            to: request.email,
            subject: 'Test Drive Request Confirmation',
            html
        });
    }

    /**
     * Send newsletter
     * @param {Array} subscribers - Array of subscriber emails
     * @param {Object} newsletter - Newsletter content
     * @returns {Promise} Send mail promise
     */
    async sendNewsletter(subscribers, newsletter) {
        const html = await this.renderTemplate('newsletter', { newsletter });
        
        // Send in batches to avoid rate limits
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);
            batches.push(
                this.sendMail({
                    to: batch.join(','),
                    subject: newsletter.subject,
                    html
                })
            );
            
            // Add delay between batches
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return Promise.all(batches);
    }

    /**
     * Send appointment confirmation
     * @param {Object} appointment - Appointment details
     * @returns {Promise} Send mail promise
     */
    async sendAppointmentConfirmation(appointment) {
        const html = await this.renderTemplate('appointment-confirmation', { appointment });
        return this.sendMail({
            to: appointment.email,
            subject: 'Appointment Confirmation',
            html
        });
    }

    /**
     * Send order confirmation
     * @param {Object} order - Order details
     * @returns {Promise} Send mail promise
     */
    async sendOrderConfirmation(order) {
        const html = await this.renderTemplate('order-confirmation', { order });
        return this.sendMail({
            to: order.email,
            subject: 'Order Confirmation',
            html
        });
    }

    /**
     * Verify email configuration
     * @returns {Promise<boolean>} True if configuration is valid
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('Email configuration error:', error);
            return false;
        }
    }
}

// Export singleton instance
module.exports = new Mailer();
