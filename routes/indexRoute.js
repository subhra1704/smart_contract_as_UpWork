const router = require('express').Router();
const user = require('../routes/userRoute/userRouter');
const admin = require('./adminRoute/adminRoute');
const payment = require('./paymentRoute/paymentRouter')
const static = require('./staticRoute/staticRouter')
const faq = require('./faqRoute/faqRouter')

router.use('/user', user);
router.use('/admin', admin);
router.use('/static',static)
router.use('/payment',payment)
router.use('/faq',faq)

module.exports = router;