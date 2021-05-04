import { Request, Response, NextFunction } from 'express';
import { sendJSONresponse } from '../../utils/sendJsonResponse';
import { ApartmentModel } from '../../models/properties/Apartment';
import { IRequestPayload } from '../../interfaces/IRequestPayload';
import { Admin } from '../../models/users/Admin';
import { EPropertyTypes } from '../../interfaces/EPropertyTypes';
import { removeSubmitedImages } from '../../middleware/gcsStorage';
import logger, { timeNow } from '../../utils/logger';

/**
 * @route GET /admin/getApartment/:shortId
 */
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.shortId) {
            return sendJSONresponse(res, 401, "No short id found");
        }
        let property = await ApartmentModel.findOne({ shortId: req.params.shortId }).populate("postedBy");

        sendJSONresponse(res, 200, property);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route GET /admin/getAllApartments/:transactionType
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectionFields = ["thumbnail", "propertyType", "title", "address", "price", "transactionType", "shortId", "features.usableArea", "features.rooms"]
        let property = await ApartmentModel.find({ transactionType: Number(req.params.transactionType) }).select(projectionFields);

        sendJSONresponse(res, 200, property);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route POST /admin/addApartment
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

        let newProperty = new ApartmentModel({
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
            isFeatured: req.body.isFeatured,
            features: {
                rooms: req.body.rooms,
                buildingType: req.body.buildingType,
                partitioning: req.body.partitioning,
                floor: req.body.floor,
                comfort: req.body.comfort,
                usableArea: req.body.usableArea,
                totalUsableArea: req.body.totalUsableArea,
                constructionYear: req.body.constructionYear,
                structure: req.body.structure
            },
            utilities: {
                general: req.body.general,
                heatingSystem: req.body.heatingSystem,
                conditioning: req.body.conditioning
            },
            amenities: {
                building: req.body.building
            }
        });
        await newProperty.save();
        await admin.addSubmitedProperty(newProperty);

        sendJSONresponse(res, 200, { message: "Apartment added success!" });
    } catch (err) {
        await removeSubmitedImages(req.payload.subdirectoryId, true);
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route PUT /admin/updateApartment/:shortId
 */
export const update = async (req: IRequestPayload, res: Response, next: NextFunction) => {
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
        const foundProperty = await ApartmentModel.findOne({ shortId: propertyShortId });
        if (!foundProperty) {
            logger.debug("Error updating apartment" + timeNow)
            return sendJSONresponse(res, 401, "Can't find property")
        };

        foundProperty.title = req.body.title;
        foundProperty.description = req.body.description;
        foundProperty.address = req.body.address;
        foundProperty.price = req.body.price;
        foundProperty.coords = [Number(coords.lng), Number(coords.lat)];
        foundProperty.isFeatured = req.body.isFeatured ? true : false;
        foundProperty.transactionType = Number(req.body.transactionType);
        foundProperty.features.rooms = req.body.rooms;
        foundProperty.features.buildingType = req.body.buildingType;
        foundProperty.features.partitioning = req.body.partitioning;
        foundProperty.features.floor = req.body.floor;
        foundProperty.features.comfort = req.body.comfort;
        foundProperty.features.usableArea = req.body.usableArea;
        foundProperty.features.totalUsableArea = req.body.totalUsableArea;
        foundProperty.features.constructionYear = req.body.constructionYear;
        foundProperty.features.structure = req.body.structure;
        foundProperty.utilities.general = req.body.general;
        foundProperty.utilities.heatingSystem = req.body.heatingSystem;
        foundProperty.utilities.conditioning = req.body.conditioning;
        foundProperty.amenities.building = req.body.building;
        await foundProperty.save();

        sendJSONresponse(res, 200, { message: "Apartment added success!" });
    } catch (err) {
        //TODO remove gcsimages on error
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route DELETE /admin/removeApartment/:shortId
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shortId = req.params.shortId;
        let apartment = await ApartmentModel.findOne({ shortId });
        if (apartment) {
            const admin = await Admin.findOne({ _id: apartment.postedBy });
            admin.removeSubmitedProperty(apartment._id, EPropertyTypes.APARTMENT);
            await removeSubmitedImages(apartment.gcsSubfolderId, true);
            await apartment.remove();
            sendJSONresponse(res, 200, { message: "Apartment with " + shortId + " removed from db" });
        }
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};
