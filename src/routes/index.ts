import { Router } from 'express';
import * as userCtrl from '../controllers/user';
import * as adminCtrl from '../controllers/admin';
import * as adminAuthCtrl from '../controllers/admin/auth';
import * as adminApartmentsCtrl from '../controllers/admin/apartments';
import * as adminHousesCtrl from '../controllers/admin/houses';
import * as adminLandsCtrl from '../controllers/admin/lands';
import { uploadMulter, sendUploadToGCS } from '../middleware/gcsStorage';
import { isAuth } from '../middleware/isAuth';
const router = Router();


/**mvc landing page */
router.get("/featured");

router.get("/listings/:transactionType-:propertyType");
/**
 * mvc listings
 */
// get apartments/:transactionType
// get houses/:transactionType
// get land/:transactionType

/**
 * user routes
 */
// TODO add token validation
router.post("/user/submitProperty", isAuth, uploadMulter.array("images", 20), sendUploadToGCS, userCtrl.submitUserProperty);
router.post("/user/signup", userCtrl.postSignup);
router.post("/user/login", userCtrl.postLogin);
router.post("/user/forgotPassword", userCtrl.postForgotPassword);
router.post("/user/resetPassword", userCtrl.postResetPassword);

/**
 * Admin routes
 */
router.post("/admin/signup", adminAuthCtrl.signup);
router.post("/admin/login", adminAuthCtrl.login);
//  router.post("/admin/forgotPassword", userCtrl.postForgotPassword);
//  router.post("/admin/resetPassword", userCtrl.postResetPassword);

/**
 * Admin actions on user properties
 */
router.get("/admin/getAllSubmitedProperites", adminCtrl.getAllSubmitedProperties);
router.get("/admin/getOneSubmitedProperty/:shortId", adminCtrl.getOneSubmitedProperty);
router.delete("/admin/removeOneSubmitedProperty/:shortId/:gcsSubfolderId", adminCtrl.removeOneSubmitedProperty);
router.get("/admin/mockPropertiesCreation", adminCtrl.mockPropertiesCreation);
router.get("/admin/mockApartments", adminCtrl.mockApartments);
router.get("/admin/mockHouses", adminCtrl.mockHouses);
router.get("/admin/mockLands", adminCtrl.mockLands);

/**
 * Admin actions on admin properties
 */

router.get("/admin/getProperties", adminCtrl.getAllAdminProperties);
router.get("/admin/getFeaturedProperties", adminCtrl.getFeaturedProperties);
router.get("/admin/getApartment/:shortId", adminApartmentsCtrl.getOne);
router.get("/admin/getAllApartments/:transactionType", adminApartmentsCtrl.getAll);
router.post("/admin/addApartment", isAuth, uploadMulter.array("images", 20), sendUploadToGCS, adminApartmentsCtrl.add);
router.put("/admin/updateApartment/:shortId",uploadMulter.array("images", 20), adminApartmentsCtrl.update);
router.delete("/admin/removeApartment/:shortId", adminApartmentsCtrl.remove);

router.get("/admin/getHouse/:shortId", adminHousesCtrl.getOne);
router.get("/admin/getAllHouses/:transactionType", adminHousesCtrl.getAll);
router.post("/admin/addHouse", isAuth, uploadMulter.array("images", 20), sendUploadToGCS, adminHousesCtrl.add);
router.put("/admin/updateHouse/:shortId", uploadMulter.array("images", 20), adminHousesCtrl.update);
router.delete("/admin/removeHouse/:shortId", adminHousesCtrl.remove);

router.get("/admin/getLand/:shortId", adminLandsCtrl.getOne);
router.get("/admin/getAllLands/:transactionType", adminLandsCtrl.getAll);
router.post("/admin/addLand", isAuth, uploadMulter.array("images", 20), sendUploadToGCS, adminLandsCtrl.add);
router.put("/admin/updateLand/:shortId", uploadMulter.array("images", 20), adminLandsCtrl.update);
router.delete("/admin/removeLand/:shortId", adminLandsCtrl.remove);


export default router;
