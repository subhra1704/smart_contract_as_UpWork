const paymentController = require('../../controller/paymentController');
const auth = require("../../middleware/auth");
const express = require('express');
// const { payment } = require('../../controller/paymentController');
const Payment = require('../../helper/payment');
const router = express.Router();


/**
 * @swagger
 * /api/v1/payment/payment:
 *   post:
 *     tags:
 *       - USER_PAYMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: _id i.e subscriptionId
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Transaction has been done successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

router.post('/payment', auth.verifyToken, paymentController.payment);

router.post('/refundPayment', Payment.refundPayment);


module.exports = router;