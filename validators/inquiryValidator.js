const { body, validationResult } = require('express-validator');

exports.validateInquiry = [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone required'),
    body('message').trim().notEmpty().withMessage('Message required').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join(', '));
            return res.redirect(`/cars/${req.params.slug}#inquiry`);
        }
        next();
    }
];