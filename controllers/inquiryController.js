const Inquiry = require('../models/Inquiry');
const Car = require('../models/Car');
const { validationResult } = require('express-validator');
const mailer = require('../utils/mailer');

exports.submitInquiry = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join(', '));
            return res.redirect(`/car/${req.params.slug}#inquiry-form`);
        }

        const { name, email, phone, message } = req.body;
        const car = await Car.findOne({ slug: req.params.slug }).populate('dealer', 'email name');

        if (!car) {
            req.flash('error', 'Car not found or no longer available');
            return res.redirect('/cars');
        }

        // Create inquiry
        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            message,
            car: car._id,
            carName: `${car.make} ${car.model} ${car.year}`
        });

        // Send email notifications
        try {
            await Promise.all([
                // Send confirmation to customer
                mailer.sendInquiryConfirmation(email, {
                    name,
                    carName: `${car.make} ${car.model} ${car.year}`,
                    message
                }),
                // Notify dealer
                mailer.sendInquiryNotification(car.dealer.email, {
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone,
                    carName: `${car.make} ${car.model} ${car.year}`,
                    message,
                    inquiryId: inquiry._id
                })
            ]);
        } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail the request if email fails
        }

        req.flash('success', 'Your inquiry has been submitted successfully! We will contact you soon.');
        res.redirect(`/car/${req.params.slug}#inquiry-form`);
    } catch (err) {
        console.error('Inquiry submission error:', err);
        req.flash('error', 'Failed to submit inquiry. Please try again later.');
        res.redirect(`/car/${req.params.slug}#inquiry-form`);
    }
};
