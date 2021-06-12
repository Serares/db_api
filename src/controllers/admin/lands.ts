import { Request, Response, NextFunction } from 'express';
import { sendJSONresponse } from '../../utils/sendJsonResponse';
import { LandModel } from '../../models/properties/Land';
import { IRequestPayload } from '../../interfaces/IRequestPayload';
import { Admin } from '../../models/users/Admin';
import { EPropertyTypes } from '../../interfaces/EPropertyTypes';
import { addImagesForPutRequest, removeImagesByName, removeSubmitedImages } from '../../middleware/gcsStorage';
import logger, { timeNow } from '../../utils/logger';

/**
 * @route GET /admin/getLand/:shortId
 */
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let property = await LandModel.findOne({ shortId: req.params.shortId }).populate("postedBy");

        sendJSONresponse(res, 200, property);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route GET /getAllLands/:transactionType
 */
 export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectionFields = ["thumbnail", "propertyType", "title", "address", "price", "transactionType", "shortId", "features.usableArea"]
        let property = await LandModel.find({ transactionType: Number(req.params.transactionType) }).select(projectionFields);

        sendJSONresponse(res, 200, property);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route POST /admin/addLand
 */
export const add = async (req: IRequestPayload, res: Response, next: NextFunction) => {
    try {
        if (!req.body && !req.files) {
            return sendJSONresponse(res, 401, { message: "No request body" });
        }
        const adminEmail = req.payload.email;
        const admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
            return sendJSONresponse(res, 404, { message: `Can't find admin with this email ` + adminEmail })
        };
        const coords = JSON.parse(req.body.coords);

        let newProperty = new LandModel({
            title: req.body.title,
            description: req.body.description,
            address: req.body.address,
            price: req.body.price,
            imagesUrls: req.payload.imagesUrls,
            thumbnail: req.payload.imagesUrls[0],
            coords: [Number(coords.lng), Number(coords.lat)],
            transactionType: Number(req.body.transactionType),
            postedBy: admin._id,
            gcsSubfolderId: req.payload.subdirectoryId,
            isFeatured: req.body.isFeatured || false,
            features: {
                usableArea: req.body.usableArea,
                totalUsableArea: req.body.totalUsableArea,
            }
        });
        await newProperty.save();
        await admin.addSubmitedProperty(newProperty);

        sendJSONresponse(res, 200, { message: "Land added success!" });
    } catch (err) {
        await removeSubmitedImages(req.payload.subdirectoryId, true);
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route PUT /admin/updateLand/:shortId
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
    //TODO update images also
    try {
        if (!req.body) {
            return sendJSONresponse(res, 401, { message: "No request body" });
        };
        const propertyShortId = req.params.shortId;
        if (!propertyShortId) {
            return sendJSONresponse(res, 401, "No short id found");
        }

        const coords = JSON.parse(req.body.coords);
        const foundProperty = await LandModel.findOne({ shortId: propertyShortId });
        if (!foundProperty) {
            logger.debug("Error updating apartment" + timeNow)
            return sendJSONresponse(res, 401, "Can't find property")
        };

        foundProperty.title = req.body.title;
        foundProperty.description = req.body.description;
        foundProperty.address = req.body.address;
        foundProperty.price = req.body.price;
        foundProperty.coords = [Number(coords.lng), Number(coords.lat)];
        foundProperty.transactionType = Number(req.body.transactionType);
        foundProperty.isFeatured = req.body.isFeatured ? true : false;
        foundProperty.features.usableArea = req.body.usableArea;
        foundProperty.features.totalUsableArea = req.body.totalUsableArea;
         // first save for all fields that have been modified except imagesUrls
        // when saving fields are also validated by schema
        await foundProperty.save();

        if (req.body.deletedImages) {
            let arrayOfDeletedImages: Array<string> = [];
            // meaning only one image has been deleted
            if (typeof req.body.deletedImages === "string") {
                arrayOfDeletedImages.push(req.body.deletedImages)
            } else if (typeof req.body.deletedImages === "object" && req.body.deletedImages.length > 0) {
                arrayOfDeletedImages = [...req.body.deletedImages];
            };
            
            await foundProperty.removeImages(arrayOfDeletedImages);
            await removeImagesByName(arrayOfDeletedImages);
        }

        if (req.files && req.files.length > 0) {
            // Newly added urls images to GCS need to be added to property imagesUrls also
            const newUploadedImagesUrls = await addImagesForPutRequest(foundProperty.gcsSubfolderId, req.files);
            await foundProperty.addNewImagesUrls(newUploadedImagesUrls);
        }

        foundProperty.thumbnail = foundProperty.imagesUrls[0];
        await foundProperty.save();

        sendJSONresponse(res, 200, { message: "Apartment updated success!" });

    } catch (err) {
        logger.debug("Error for PUT request on Apartment " + timeNow + " " + err);
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route DELETE /admin/removeLand/:shortId
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shortId = req.params.shortId;
        let land = await LandModel.findOne({ shortId });
        if (land) {
            const admin = await Admin.findOne({ _id: land.postedBy });
            admin.removeSubmitedProperty(land._id, EPropertyTypes.LANDANDCOMMERCIAL);
            await removeSubmitedImages(land.gcsSubfolderId, true);
            await land.remove();
            sendJSONresponse(res, 200, { message: "Land with " + shortId + " removed from db" });
        }
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};
