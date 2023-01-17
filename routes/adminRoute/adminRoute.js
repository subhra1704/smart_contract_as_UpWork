const router = require('express').Router();
const adminController = require('../../controller/adminController');
const helperController = require('../../controller/helper')
const auth = require('../../middleware/auth');



/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     tags:
 *       - ADMIN
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

router.post('/login', adminController.login)


/**
 * @swagger
 * /api/v1/admin/resetPassword:
 *   post:
 *     tags:
 *       - ADMIN
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
 *         description: Your password is updated successfully.
 *       404:
 *         description: This user does not exist.
 *       402:
 *         description : Password not matched. 
 *       500:
 *         description: Internal Server Error
 */

router.post('/resetPassword', adminController.resetPassword)
/**
 * @swagger
 * /api/v1/admin/forgotPassword:
 *   post:
 *     tags:
 *       - ADMIN
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
 *         description: A Otp has been sent to your registered ID.
 *       404:
 *         description: Provided mobileNumber is not registered.
 *       500:
 *         description: Internal Server Error
 */

router.post('/forgotPassword', adminController.forgotPassword)



/**
 * @swagger
 * /api/v1/admin/getProfile:
 *   get:
 *     tags:
 *       - ADMIN
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: false
 *     responses:
 *       200:
 *         description: Requested data found successfully
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/getProfile', auth.verifyToken, adminController.getProfile)


/**
 * @swagger
 * /api/v1/admin/editProfile:
 *   put:
 *     tags:
 *       - ADMIN
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
 *     responses:
 *       200:
 *         description: Successfully updated.
 *       409:
 *         description: Not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
router.put('/editProfile', auth.verifyToken, adminController.editProfile)


/**
 * @swagger
 * /api/v1/admin/viewUser:
 *   post:
 *     tags:
 *       - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: userId
 *         description: _id
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: successfully
 *       404:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.post('/viewUser', auth.verifyToken, adminController.viewUser);

/**
 * @swagger
 * /api/v1/admin/listUsers:
 *   post:
 *     tags:
 *        - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: type
 *         description: type
 *         in: formData
 *         required: false
 *       - name: search
 *         description: search
 *         in: formData
 *         required: false
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
 *     responses:
 *       200:
 *         description: Details have been fetched successfully.
 *       404:
 *         description: Data deleted sucessfully.
 *       400:
 *         description: Fields are required.
 *       500:
 *         description: Internal Server Error
 */

router.post('/listUsers', auth.verifyToken, adminController.userList)
/**
* @swagger
* /api/v1/admin/editUser:
*   put:
*     tags:
*       - ADMIN_USER SECTION
*     description: Check for Social existence and give the access Token
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*       - name: name
*         description: name
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
*       - name: image
*         description: image
*         in: formData
*         required: false
*       - name: password
*         description: password
*         in: formData
*         required: false
*       - name: dateOfBirth
*         description: dateOfBirth
*         in: formData
*         required: false
*       - name: userId
*         description: userId
*         in: formData
*         required: false
*     responses:
*       200:
*         description: User updated successfully
*       404:
*         description: Invalid credentials
*       500:
*         description: Internal Server Error
*/
router.put('/editUser', auth.verifyToken, adminController.editUser)

/**
 * @swagger
 * /api/v1/admin/blockUnblockUser:
 *   post:
 *     tags:
 *       - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
*       - name: _id
 *         description: _id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Upadted data found.
 *       404:
 *         description: Requested data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */

router.post('/blockUnblockUser', auth.verifyToken, adminController.blockUnblockUser)


/**
 * @swagger
 * /api/v1/admin/editSubscription:
 *   post:
 *     tags:
 *       - ADMIN_PLAN_MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: subscriptionId
 *         description: subscriptionId
 *         in: formData
 *         required: true
 *       - name: planName
 *         description: planName
 *         in: formData
 *         required: true
 *       - name: cost
 *         description: cost
 *         in: formData
 *         required: true
 *       - name: planType
 *         description: planType i.e [FREE,PRO,EXCLUSIVE]
 *         in: formData
 *         required: true
 *       - name: image
 *         description: image
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully updated
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

router.post('/editSubscription', auth.verifyToken, adminController.editSubscription)

/**
 * @swagger
 * /api/v1/admin/deleteSubscription:
 *   delete:
 *     tags:
 *       - ADMIN_PLAN_MANAGEMENT
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: planId
 *         description: planId
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

router.delete('/deleteSubscription', auth.verifyToken, adminController.deleteSubscription)

/**
 * @swagger
 * /api/v1/admin/subscriptionList:
 *   post:
 *     tags:
 *       - ADMIN_PLAN_MANAGEMENT
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
 *         description: Requested data found
 *       404:
 *         description: Requested data not found
 *       500:
 *         description: Internal Server Error
 */

router.post('/subscriptionList', auth.verifyToken, adminController.subscriptionList)


/**
 * @swagger
 * /api/v1/admin/addNotification:
 *   post:
 *     tags:
 *       - ADMIN_NOTIFICATION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: formData
 *         required: true   
 *       - name: title
 *         description: title
 *         in: formData
 *         required: true 
 *       - name: description
 *         description: description
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
router.post('/addNotification', auth.verifyToken, adminController.addNotification)
/**
 * @swagger
 * /api/v1/admin/viewNotification/{notificationId}:
 *   get:
 *     tags:
 *       - ADMIN
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

router.get('/viewNotification/:notificationId', auth.verifyToken, adminController.viewNotification)

/**
 * @swagger
 * /api/v1/admin/notificationList:
 *   get:
 *     tags:
 *       - ADMIN_NOTIFICATION
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
router.get('/notificationList', adminController.notificationList)


/**
 * @swagger
 * /api/v1/admin/deleteNotification:
 *   get:
 *     tags:
 *       - ADMIN_NOTIFICATION
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
 *         description: Notification fetched successfully.
 *       400:
 *         description: Data Not Found.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.delete('/deleteNotification', adminController.deleteNotification)

// /**
//  * @swagger
//  * /api/v1/admin/addFaq:
//  *   post:
//  *     tags:
//  *       - ADMIN
//  *     description: Check for Social existence and give the access Token 
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: token
//  *         description: token
//  *         in: header
//  *         required: true
//  *       - name: question   
//  *         description: question
//  *         in: formData
//  *         required: true
//  *       - name: answer
//  *         description: answer
//  *         in: formData
//  *         required: true *       
//  *     responses:
//  *       200:
//  *         description: Data is saved successfully
//  *       404:
//  *         description: Requested data not found
//  *       500:
//  *         description: Internal Server Error
//  */
// router.post('/addFaq', auth.verifyToken, adminController.addFaq);

// /**
//  * @swagger
//  * /api/v1/admin/viewFaq/{faqId}:
//  *   get:
//  *     tags:
//  *       - ADMIN
//  *     description: Check for Social existence and give the access Token 
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: token
//  *         description: token
//  *         in: header
//  *         required: true
//  *       - name: faqId
//  *         description: faqId
//  *         in: path
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: Requested data found successfully
//  *       404:
//  *         description: Requested data not found
//  *       500:
//  *         description: Internal Server Error
//  */
// router.get('/viewFaq/:faqId', auth.verifyToken, adminController.viewFaq);


/**
 * @swagger
 * /api/v1/admin/viewTransaction:
 *  get:
 *    tags:
 *       - ADMIN TRANSACTION MANAGEMENT
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
router.get('/viewTransaction', auth.verifyToken, adminController.viewTransaction)

/**
 * @swagger
 * /api/v1/admin/transactionList:
 *  post:
 *    tags:
 *       - ADMIN TRANSACTION MANAGEMENT
 *    produces:
 *      - application/json
 *    parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: search
 *         description: search
 *         in: formData
 *         required: false
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
router.post('/transactionList', auth.verifyToken, adminController.transactionList)


/**
 * @swagger
 * /api/v1/admin/listContractForCompany:
 *   get:
 *     tags:
 *        - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:  
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true 
 *       - name: userId  
 *         description: userId i.e CompanyUser 
 *         in: query
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
 *         description: Data fetched successfully.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listContractForCompany', auth.verifyToken, adminController.listContractForCompany)

/**
 * @swagger
 * /api/v1/admin/listMilestoneForCompany:
 *   get:
 *     tags:
 *       - ADMIN_USER SECTION
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
router.get('/listMilestoneForCompany', auth.verifyToken, adminController.listMilestoneForCompany)



/**
 * @swagger
 * /api/v1/admin/listContractForUser:
 *   get:
 *     tags:
 *        - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:  
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true 
 *       - name: userId  
 *         description: userId 
 *         in: query
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
 *         description: Data fetched successfully.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listContractForUser', auth.verifyToken, adminController.listContractForUser)



/**
 * @swagger
 * /api/v1/admin/listMilestoneForUser:
 *   get:
 *     tags:
 *       - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: token
 *         in: header
 *         required: true  
 *       - name: contractId  
 *         description: contractId
 *         in: query
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
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.get('/listMilestoneForUser', auth.verifyToken, adminController.listMilestoneForUser)







router.get('/completeMilestonelist', adminController.completeMilestonelist)
router.get('/fundRequestList', auth.verifyToken, adminController.fundRequestList)
router.post('/viewFundRequest', auth.verifyToken, adminController.viewFundRequest)


router.get('/deleteAdmin', adminController.deleteAdmin);


//  router.get('/viewTransaction',adminController.viewTransaction);

//  router.delete('/deleteTransaction',adminController.deleteTransaction);


/**
 * @swagger
 * /api/v1/admin/addValidator:
 *   post:
 *     tags:
 *       - ADMIN_USER SECTION
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
 *         required: true
 *       - name: lastName
 *         description: lastName
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
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *       - name: validatorManagemen
 *         description: validatorManagemen
 *         in: formData
 *         required: false
 *       - name: clientManagement
 *         description: clientManagement
 *         in: formData
 *         required: false
 *       - name: dashboardManagement
 *         description: dashboardManagement
 *         in: formData
 *         required: false
 *       - name: contractManagement
 *         description: contractManagement
 *         in: formData
 *         required: false
 *       - name: notificationManagement
 *         description: notificationManagement
 *         in: formData
 *         required: false
 *       - name: staticContentManagement
 *         description: staticContentManagement
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Validator added Successfully.
 *       404:
 *         description: Requested data not found.
 *       402:
 *         description: Something went wrong.
 *       500:
 *         description: Internal Server Error
 */

router.post('/addValidator', auth.verifyToken, helperController.addValidator)

/**
* @swagger
* /api/v1/admin/viewValidator:
*   get:
*     tags:
*       - ADMIN_USER SECTION
*     description: Check for Social existence and give the access Token 
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*       - name: _id
*         description: _id
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
router.get('/viewValidator', auth.verifyToken, helperController.viewValidator)


/**
 * @swagger
 * /api/v1/admin/editValidator:
 *   put:
 *     tags:
 *        - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token ? admin token
 *         in: header
 *         required: true
 *       - name: _id
 *         description: _id
 *         in: formData
 *         required: true
 *       - name: firstName
 *         description: firstName
 *         in: formData
 *         required: false
 *       - name: email
 *         description: email
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
 *       - name: validatorManagement
 *         description: validatorManagement ? true || false
 *         in: formData
 *         required: false
 *       - name: dashboardManagement
 *         description: dashboardManagement ? true || false
 *         in: formData
 *         required: false
 *       - name: clientManagement
 *         description: clientManagement ? true || false
 *         in: formData
 *         required: false
 *       - name: contractManagement
 *         description: contractManagement ? true || false
 *         in: formData
 *         required: false
 *       - name: notificationManagement
 *         description: notificationManagement ? true || false
 *         in: formData
 *         required: false
 *       - name: staticContentManagement
 *         description: staticContentManagement ? true || false
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: vendor has been created successfully.
 *       404:
 *         description: Requested data not found.
 *       400:
 *         description: Fields are required.
 *       500:
 *         description: Internal Server Error
 */
router.put('/editValidator', auth.verifyToken, helperController.editValidator)

/**
 * @swagger
 * /api/v1/admin/deleteValidator:
 *   delete:
 *     tags:
 *       - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: validatorId
 *         description: _id
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

router.delete('/deleteValidator', auth.verifyToken, helperController.deleteValidator)
/**
 * @swagger
 * /api/v1/admin/listValidator:
 *   post:
 *     tags:
 *       - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: status
 *         description: status
 *         in: formData
 *         required: false
 *       - name: search
 *         description: search
 *         in: formData
 *         required: false
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
 *     responses:
 *       200:
 *         description: Data fetched successfully.
 *       500:
 *         description: Internal Server Error.
 *       501:
 *         description: Something went wrong!.
 */
router.post('/listValidator', helperController.listValidator)

/**
* @swagger
* /api/v1/admin/blockUnblockValidator:
*   get:
*     tags:
*       - ADMIN_USER SECTION
*     description: Check for Social existence and give the access Token 
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: Admin token
*         in: header
*         required: true
*       - name: validatorId
*         description: _id
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

router.get('/blockUnblockValidator', auth.verifyToken, helperController.blockUnblockValidator)



/**
* @swagger
* /api/v1/admin/dashboard:
*   get:
*     tags:
*       - ADMIN_USER SECTION
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
router.get('/dashboard', adminController.dashboard)



/**
 * @swagger
 * /api/v1/admin/viewparticularMilestone:
 *   get:
 *     tags:
 *       - ADMIN_USER SECTION
 *     description: Check for Social existence and give the access Token 
 *     produces:
 *       - application/json
 *     parameters: 
 *       - name: token  
 *         description: token
 *         in: header   
 *         required: true  
 *       - name: _id  
 *         description: milestoneId i.e contractId
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
 router.get('/viewparticularMilestone', auth.verifyToken, adminController.viewparticularMilestone)






module.exports = router;
