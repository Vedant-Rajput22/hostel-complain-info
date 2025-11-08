import { body, validationResult } from 'express-validator';

export const emailDomainValidator = (domain) =>
  body('email')
    .isEmail()
    .withMessage('Invalid email')
    .custom((value) => value.toLowerCase().endsWith(`@${domain}`))
    .withMessage(`Email must end with @${domain}`);

export const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};
