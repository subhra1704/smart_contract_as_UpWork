const router = require('express').Router();
const FAQController = require('../../controller/faqController');
const auth = require('../../middleware/auth');



/**
 * @swagger
 * /api/v1/faq/faqs:
 *   post:
 *     tags:
 *       - FAQ
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: question   
 *         description: question
 *         in: formData
 *         required: true
 *       - name: answer
 *         description: answer
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Data is saved successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/faqs', auth.verifyToken, FAQController.addFaq);
/**
 * @swagger
 * /api/v1/faq/faqs/{faqId}:
 *   get:
 *     tags:
 *       - FAQ
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: faqId
 *         description: faqId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Data is saved successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Errors
 */
router.get('/faqs/:id', FAQController.viewFaq);
/**
 * @swagger
 * /api/v1/faq/faqs:
 *   delete:
 *     tags:
 *       - FAQ
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true
 *       - name: faqId
 *         description: faqId
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Data is saved successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/faqs', auth.verifyToken, FAQController.deleteFaq);
/**
 * @swagger
 * /api/v1/faq/faqs:
 *   put:
 *     tags:
 *       - FAQ
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: faqId
 *         description: faqId
 *         in: formData
 *         required: true
 *       - name: question   
 *         description: question
 *         in: formData
 *         required: false
 *       - name: answer
 *         description: answer
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Data is saved successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/faqs', auth.verifyToken, FAQController.editFaq);
/**
 * @swagger
 * /api/v1/faq/faqsList:
 *   post:
 *     tags:
 *       - FAQ
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: status
 *         description: status
 *         in: formData
 *         required: false
 *       - name: pageNumber
 *         description: pageNumber
 *         in: formData
 *         required: false
 *       - name: limit
 *         description: limit
 *         in: formData
 *         required: false
 *       - name: fromDate
 *         description: fromDate
 *         in: query
 *         required: false
 *       - name: toDate
 *         description: toDate
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Data is saved successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/faqsList', auth.verifyToken, FAQController.faqList);
module.exports = router;
