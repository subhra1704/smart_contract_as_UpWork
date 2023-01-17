const router= require('express').Router();
const auth= require('../../middleware/auth');
const staticController= require('../../controller/staticController');

/**
 * @swagger
 * /api/v1/static/editStaticPage:
 *   put:
 *     tags:
 *       - STATIC
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id 
 *         description: _id
 *         in: formData
 *         required: false
 *       - name: title
 *         description: title
 *         in: formData
 *         required: false
 *       - name: description
 *         description: description
 *         in: formData
 *         required: false
 *       - name: image
 *         description: image
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully updated.
 *       404:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error
 */

router.put('/editStaticPage' , staticController.editStaticPage)

/**
 * @swagger
 * /api/v1/static/viewStaticPage:
 *   get:
 *     tags:
 *       - STATIC
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: type
 *         description: type
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Details have been fetched successfully.
 *       404:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error
 */

router.get('/viewStaticPage' , staticController.viewStaticPage)

/**
 * @swagger
 * /api/v1/static/staticPageList:
 *   get:
 *     tags:
 *       - STATIC
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Requested data found.
 *       404:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error
 */
router.get('/staticPageList',staticController.staticPageList);

module.exports= router;