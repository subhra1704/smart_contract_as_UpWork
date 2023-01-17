const router = require('express').Router();
const adminController = require('../../controller/adminController');
const userController = require('../../controller/userController');
const auth = require('../../middleware/auth');


/**
 * @swagger
 * /api/v1/user/signUp:
 *   post:
 *     tags:
 *        - USER
 *     description: Check for Social existence 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: firstName
 *         in: formData
 *         required: false
 *       - name: lastName
 *         description: lastName
 *         in: formData
 *         required: false
 *       - name: userName
 *         description: userName
 *         in: formData
 *         required: false
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *       - name: countryCode
 *         description: countryCode
 *         in: formData
 *         required: true
 *       - name: mobileNumber
 *         description: mobileNumber
 *         in: formData
 *         required: true
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *       - name: dateOfBirth
 *         description: dateOfBirth (dd/mm/yyyy)
 *         in: formData
 *         required: true
 *       - name: agencyTeam
 *         description: agencyTeam
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Thanks, You have successfully signed up. 
 *       409:
 *         description: This email/mobile number already exists.
 *       500:
 *         description: Internal Server Error
 */

router.post('/signUp', userController.signUp)

/**  
 * @swagger
 * /api/v1/user/otpVerify:
 *   post:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *       - name: otp
 *         description: otp
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       404:
 *         description: Entered mobile number is not registered.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 *       400:
 *         description: Fields are required.
 */

router.post('/otpVerify', userController.otpVerify)

/**
* @swagger
* /api/v1/user/resendOTP:
*   post:
*     tags:
*       - USER
*     description: Check for Social existence and give the access Token 
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email
*         in: formData
*         required: true   
*     responses:
*       200:
*         description: OTP has been sent on your registered Email.
*       404: 
*         description: Entered email number is not registered.
*       500:
*         description: Internal Server Error.
*       501:
*         description: Something went wrong!
*/

router.post('/resendOTP', userController.resendOTP)


/**
 * @swagger
 * /api/v1/user/forgotPassword:
 *   post:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: OTP has been sent to your registered mobile number.
 *       404:
 *         description: Provided mobile number is not registered.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */

router.post('/forgotPassword', userController.forgotPassword)


/**
 * @swagger
 * /api/v1/user/resetPassword:
 *   post:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *       - name: newPassword
 *         description: newPassword
 *         in: formData
 *         required: true
 *       - name: confirmPassword
 *         description: confirmPassword
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Your password has been successfully changed.
 *       404:
 *         description: This user does not exist.
 *       422:
 *         description: Password not matched.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */

router.post('/resetPassword', userController.resetPassword)


/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *       - name: deviceToken
 *         description: deviceToken
 *         in: formData
 *         required: false
 *       - name: deviceType
 *         description: deviceType-iOS/android
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Your login is successful.
 *       404:
 *         description: Requested data not found.
 *       402:
 *         description: Invalid login credentials.
 *       500:
 *         description: Internal Server Error
 */

router.post('/login', userController.login)


/**
 * @swagger
 * /api/v1/user/editProfile:
 *   put:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: firstName
 *         description: firstName
 *         in: formData
 *         required: false
 *       - name: lastName
 *         description: lastName
 *         in: formData
 *         required: false
 *       - name: location
 *         description: location
 *         in: formData
 *         required: false
 *       - name: countryCode
 *         description: countryCode
 *         in: formData
 *         required: false
 *       - name: mobileNumber
 *         description: mobileNumber
 *         in: formData
 *         required: false
 *       - name: email
 *         description: email
 *         in: formData
 *         required: false
 *       - name: profilePic
 *         description: profilePic
 *         in: formData
 *         required: false
 *       - name: countryCode
 *         description: countryCode
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully updated.
 *       409:
 *         description: This email/mobile number already exists.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
router.put('/editProfile', auth.verifyToken, userController.editProfile);


/**
 * @swagger
 * /api/v1/user/getProfile:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Requested data found successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getProfile', auth.verifyToken, userController.getProfile)



/**
 * @swagger
 * /api/v1/user/addContract:
 *   post:
 *     tags:
 *       - COMPANY MANAGEMENT
 *     description: Check for Social existence and give the access Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token ? admin token
 *         in: header
 *         required: true
 *       - in: body
 *         name: contract
 *         description: Contract add.
 *         schema:
 *           properties:
 *             agencyTeam:
 *               type: string
 *             description:
 *               type: string
 *             startDate:
 *               type: string
 *             stopDate:
 *               type: string
 *             amount:
 *               type: string
 *             contractName:
 *               type: string
 *             privacy:
 *               type: string
 *             milestones:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 milestone:
 *                   type: string
 *                 assignee:
 *                   type: string
 *                 dueDate:
 *                   type: string
 *                 amount:
 *                   type: string
 *                 description:
 *                   type: string
 *             profilePic:
 *               type: file
 *             bioText:
 *               type: string
 *             contractDocument:
 *               type: array
 *               items:
 *                type: file
 *     responses:
 *       200:
 *         description: New Contract created Successfully.
 *       409:
 *         description: already exists.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
router.post('/addContract', auth.verifyToken, userController.addContract)

/**
 * @swagger
 * /api/v1/user/shareContractDetails:
 *   post:
 *     tags:
 *       - COMPANY MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true
 *       - name: maillist 
 *         description: maillist in array should be same as in addContract
 *         in: formData
 *       - name: contractId
 *         description: contractId i.e _id
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Data send successfully successfully.
 *       404:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/shareContractDetails', auth.verifyToken, userController.shareContractDetails);

/**
 * @swagger
 * /api/v1/user/viewContract:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: contractId
 *         description: contractId
 *         in: query
 *         required: true   
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/viewContract', userController.viewContract)
/**
 * @swagger
 * /api/v1/user/listContract:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:  
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true 
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listContract', auth.verifyToken, userController.listContract)


/**
 * @swagger
 * /api/v1/user/listContractById:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:  
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true 
 *       - name: _id  
 *         description: _id i.e contractId
 *         in: query
 *         required: true 
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listContractById', auth.verifyToken, userController.listContractById)

/**
 * @swagger
 * /api/v1/user/listContractForCompany:
 *   get:
 *     tags:
 *       - COMPANY MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:  
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true 
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listContractForCompany', auth.verifyToken, userController.listContractForCompany);

/**
 * @swagger
 * /api/v1/user/listMilestone:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true  
 *       - name: contractId  
 *         description: contractId i.e contractId
 *         in: query
 *         required: true  
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listMilestone', auth.verifyToken, userController.listMilestone)












/**
 * @swagger
 * /api/v1/user/editMilestone:
 *   put:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: milestone
 *         description: Milestone Edit.
 *         schema:
 *           type: object
 *           required:
 *             - contractId
 *             - _id
 *           properties:
 *             contractId:
 *               type: string
 *             _id:
 *               type: string
 *             milestones:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 milestone:
 *                   type: string
 *                 dueDate:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 amount:
 *                   type: string
 *                 description:
 *                   type: string
 *     responses:
 *       200:
 *         description: Milestone Update Successfully.
 *       409:
 *         description: Not Found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
 router.put('/editMilestone',auth.verifyToken,userController.editMilestone)































/**
 * @swagger
 * /api/v1/user/listMilestoneForCompany:
 *   get:
 *     tags:
 *       - COMPANY MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true 
 *       - name: _id  
 *         description: _id i.e contractId
 *         in: query
 *         required: true   
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listMilestoneForCompany', auth.verifyToken, userController.listMilestoneForCompany)


/**
 * @swagger
 * /api/v1/user/viewMilestone:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: token
 *         in: header   
 *         required: true  
 *       - name: _id  
 *         description: milestoneId i.e _id
 *         in: query
 *         required: true  
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/viewMilestone', auth.verifyToken, userController.viewMilestone)

/**
 * @swagger
 * /api/v1/user/deleteContract:
 *   delete:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         description: _id
 *         in: formData
 *         required: true    
 *     responses:
 *       200:
 *         description: Contract Delete successfully.
 *       400:
 *         description: Data Not Found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.delete('/deleteContract', userController.deleteContract)



/**
 * @swagger
 * /api/v1/user/favouriteUnfavouriteContract:
 *   get:
 *     tags:
 *       - CONTRACT_MANAGEMENT_USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: formData
 *         required: false  
 *       - name: _id
 *         description: _id
 *         in: formData
 *         required: true   
 *     responses:
 *       200:
 *         description: Update  successfully.
 *       400:
 *         description: Data Not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.post('/favouriteUnfavouriteContract', auth.verifyToken, userController.favouriteUnfavouriteContract)

/**
 * @swagger
 * /api/v1/user/approveContract:
 *  post:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: _id
 *         description: _id 
 *         in: formData
 *         required: true
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *    responses:
 *       200:
 *         description: Contract has been approved successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
router.post('/approveContract', auth.verifyToken, userController.approveContract);

/**
 * @swagger
 * /api/v1/user/rejectContract:
 *  post:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: contractId
 *         description: contractId 
 *         in: formData
 *         required: true
 *    responses:
 *       200:
 *         description: Contract has been rejected successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
router.post('/rejectContract', auth.verifyToken, userController.rejectContract);


/**
 * @swagger
 * /api/v1/user/completeParticularMilestone:
 *  post:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: _id 
 *         in: formData
 *         required: true
 *       - name: milestoneId
 *         description: milestoneId 
 *         in: formData
 *         required: true
 *       - name: comment
 *         description: comment 
 *         in: formData
 *         required: true
 *    responses:
 *       200:
 *         description: Milestone complete successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
router.post('/completeParticularMilestone', auth.verifyToken, userController.completeParticularMilestone);



// router.get('/completeMilestonelistCompany',auth.verifyToken,userController.completeMilestonelistCompany)

/**
 * @swagger
 * /api/v1/user/completeMilestonelistCompany:
 *  get:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: _id i.e contractId 
 *         in: query
 *         required: true
 *    responses:
 *       200:
 *         description: Milestone complete successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
router.get('/completeMilestonelistCompany',auth.verifyToken,userController.completeMilestonelistCompany)

/**
 * @swagger
 * /api/v1/user/CompletedlistContract:
 *  get:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    responses:
 *       200:
 *         description: Milestone complete successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
// router.get('/CompletedlistContract',userController.CompletedlistContract)


/**
 * @swagger
 * /api/v1/user/completeMilestonelist:
 *  get:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    responses:
 *       200:
 *         description: Milestone complete successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
// router.get('/completeMilestonelist', userController.completeMilestonelist);





/**
  * @swagger
  * /api/v1/user/subscriptionList:
  *   get:
  *     tags:
  *       - USER_PLAN_MANAGEMENT
  *     description: Check for Social existence and give the access Token 
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: token
  *         in: header
  *         required: true
  *       - name: search
  *         description: search
  *         in: formData
  *         required: false
  *       - name: page
  *         description: page
  *         in: formData
  *         required: false
  *       - name: limit
  *         description: limit
  *         in: formData
  *         required: false
  *     responses:
  *       200:
  *         description: Requested data found
  *       404:
  *         description: Requested data not found
  *       500:
  *         description: Internal Server Error
  */

router.get('/subscriptionList', auth.verifyToken, userController.subscriptionList)

/**
 * @swagger
 * /api/v1/user/viewPlan:
 *   get:
 *     tags:
 *       - PLAN_MANAGEMENT_USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: planName
 *         description: planName
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

router.get('/viewPlan', userController.viewPlan)


/**
* @swagger
* /api/v1/user/planList:
*   get:
*     tags:
*       - PLAN_MANAGEMENT_USER
*     description: Check for Social existence and give the access Token 
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*     responses:
*       200:
*         description: Data fetched Successfully.
*       500:
*         description: Internal Server Error.
*       501:
*         description: Something went wrong!
*/
router.get('/planList', auth.verifyToken, userController.planList)


/**
 * @swagger
 * /api/v1/user/addCard:
 *   post:
 *     tags:
 *       - USER_CARD_MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: accountHolderName
 *         description: accountHolderName
 *         in: formData
 *         required: true
 *       - name: cardNumber
 *         description: cardNumber
 *         in: formData
 *         required: 
 *       - name: accountHolderName
 *         description: accountHolderName
 *         in: formData
 *         required: true
 *       - name: expiryDate
 *         description: expiryDate
 *         in: formData
 *         required: true
 *       - name: cvv
 *         description: cvv number
 *         in: formData
 *         required: true
 *       - name: postCode
 *         description: postCode
 *         in: formData
 *         required: true
 *       - name: cardType
 *         description: DEBIT or CREDIT
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Card added successfully.
 *       404:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong
 */
router.post('/addCard', auth.verifyToken, userController.addCard);


/**
 * @swagger
 * /api/v1/user/selectCard:
 *   post:
 *     tags:
 *       - USER_CARD_MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: cardId
 *         description: cardId
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Card selected.
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/selectCard', auth.verifyToken, userController.selectCard);

/**
 * @swagger
 * /api/v1/user/cardList:
 *   get:
 *     tags:
 *       - USER_CARD_MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/cardList', auth.verifyToken, userController.cardList);



/**
 * @swagger
 * /api/v1/user/viewTransaction:
 *  get:
 *    tags:
 *       - USER TRANSACTION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: _id i.e transactionId
 *         in: query
 *         required: false
 *    responses:
 *       200:
 *         description: Data fetched successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
 router.get('/viewTransaction',auth.verifyToken,userController.viewTransaction)

/**
 * @swagger
 * /api/v1/user/transactionList:
 *  post:
 *    tags:
 *       - USER TRANSACTION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: fromDate
 *         description: fromDate
 *         in: formData
 *         required: false
 *       - name: toDate
 *         description: toDate
 *         in: formData
 *         required: false
 *       - name: page
 *         description: page
 *         in: formData
 *         required: false
 *       - name: limit
 *         description: limit
 *         in: formData
 *         required: false
 *    responses:
 *       200:
 *         description: Data fetched successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
 router.post('/transactionList',auth.verifyToken,userController.transactionList)


/**
 * @swagger
 * /api/v1/user/contactUs:
 *   post:
 *     tags:
 *       - CONTACT_US
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: name
 *         description: name
 *         in: formData
 *         required: true
 *       - name: message
 *         description: message
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Data fetched Successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
router.post('/contactUs', userController.contactUs)
/**
 * @swagger
 * /api/v1/user/viewFaq/{faqId}:
 *   get:
 *     tags:
 *       - USER
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
 *         description: Requested data found successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/viewFaq/:faqId', auth.verifyToken, userController.viewFaq);



/**
 * @swagger
 * /api/v1/user/viewNotification/{notificationId}:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: notificationId
 *         description: notificationId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description:Requested data found successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

router.get('/viewNotification/:notificationId', auth.verifyToken, userController.viewNotification)

/**
 * @swagger
 * /api/v1/user/notificationList:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *     responses:
 *       200:
 *         description: Notification fetched successfully.
 *       400:
 *         description: Data Not Found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/notificationList', userController.notificationList)


router.post('/removeCollection', userController.removeCollection);


router.put('/editMilestone',auth.verifyToken,userController.editMilestone)

/**
 * @swagger
 * /api/v1/user/listValidator:
 *   get:
 *     tags:
 *       - USER 
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
 router.get('/listValidator', userController.listValidator)



/**
 * @swagger
 * /api/v1/user/selectValidatorByCompany:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: Company token
 *         in: header
 *         required: true  
 *       - name: validatorId  
 *         description: validatorId i.e _id
 *         in: query
 *         required: true  
 *       - name: contractId  
 *         description: contractId i.e _id
 *         in: query
 *         required: true  
 *     responses:
 *       200:
 *         description: Validator selected successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
 router.get('/selectValidatorByCompany', auth.verifyToken, userController.selectValidatorByCompany)


/**
 * @swagger
 * /api/v1/user/acceptMilestoneByValidator:
 *  put:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: Validator token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: contractShare _id 
 *         in: formData
 *         required: true
 *       - name: milestoneId
 *         description: milestoneId 
 *         in: formData
 *         required: true
 *       - name: comment
 *         description: comment 
 *         in: formData
 *         required: true
 *    responses:
 *       200:
 *         description: Milestone accepted successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
 router.put('/acceptMilestoneByValidator', auth.verifyToken, userController.acceptMilestoneByValidator);

/**
 * @swagger
 * /api/v1/user/rejectMilestoneByValidator:
 *  put:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: Validator token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: contractShare _id 
 *         in: formData
 *         required: true
 *       - name: milestoneId
 *         description: milestoneId 
 *         in: formData
 *         required: true
 *       - name: comment
 *         description: comment 
 *         in: formData
 *         required: true
 *    responses:
 *       200:
 *         description: Milestone accepted successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
 router.put('/rejectMilestoneByValidator', auth.verifyToken, userController.rejectMilestoneByValidator);

/**
 * @swagger
 * /api/v1/user/listValidatorContract:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: validator token
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Data is get successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

 router.get('/listValidatorContract',auth.verifyToken, userController.listValidatorContract)

/**
 * @swagger
 * /api/v1/user/viewValidatorContract:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         description: contract _id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Data is get successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

 router.get('/viewValidatorContract', userController.viewValidatorContract)

/**
 * @swagger
 * /api/v1/user/listMilestoneForValidator:
 *   get:
 *     tags:
 *       - USER
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: Validator token
 *         in: header
 *         required: true 
 *       - name: contractId  
 *         description: contractId
 *         in: query
 *         required: true   
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listMilestoneForValidator', auth.verifyToken, userController.listMilestoneForValidator)
/**
 * @swagger
 * /api/v1/user/activeContract:
 *  get:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *    responses:
 *       200:
 *         description: Milestone complete successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
 router.get('/activeContract',auth.verifyToken,userController.activeContract)
 /**
 * @swagger
 * /api/v1/user/completeContract:
 *  get:
 *    tags:
 *       - VALIDATION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *    responses:
 *       200:
 *         description: Milestone complete successfully.
 *       409:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!
 */
  router.get('/completeContract',auth.verifyToken,userController.completeContract)

module.exports = router;
