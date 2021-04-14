import { Router } from 'express';
import * as userCtrl from '../controllers/user';
const router = Router();


/**homepage featured */
router.get("/featured");

router.get("/listings/:transactionType-:propertyType");

/**
 * user routes
 */
// TODO add token validation
router.post("/user/submitProperty", userCtrl.submitUserProperty);
router.post("/user/signup", userCtrl.postSignup);
router.post("/user/login", userCtrl.postLogin);
router.post("/user/forgotPassword", userCtrl.postForgotPassword);
router.post("/user/resetPassword", userCtrl.postResetPassword);


export default router;
