import { Request } from "express";
import multer from "multer";
import { GCS_BUCKET, GCLOUD_PROJECT_ID } from '../utils/secrets';
import { IRequestPayload } from "../interfaces/IRequestPayload";
import logger, { timeNow } from "../utils/logger";
import path from 'path';
import { nanoid } from 'nanoid';
enum EgcsFolders {
    admin = "userProperties",
    user = "adminProperties"
};

const serviceKey = path.join(process.cwd(), "config", "keys.json");
console.log(serviceKey);
import { Storage } from '@google-cloud/storage';
import { sendJSONresponse } from "../utils/sendjsonresponse";
// TODO search other ways of accessing cloud storage besides service accounts
//TODO add the keys from keys.json to .env and from them create the file at runtime
const storage = new Storage({
    keyFilename: serviceKey,
    projectId: GCLOUD_PROJECT_ID
});
const bucket = storage.bucket(GCS_BUCKET);

const fileFilter = (req: Request, file: { mimetype: string; }, cb: (arg0: null, arg1: boolean) => void) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        console.log("Not an image");
        cb(null, false);
    }
};


function getPublicUrl(filename: any) {
    return `https://storage.googleapis.com/${GCS_BUCKET}/${filename}`;
};

export const uploadMulter = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 7 * 1024 * 1024, // no larger than 7mb
    },
});

// TODO all the upload method should be moved to db_api
export const sendUploadToGCS = (req: IRequestPayload, res: any, next: any) => {
    if (!req.files && !req.body) {
        return next();
    };

    let bucketFolder = EgcsFolders.user;
    if (typeof req.payload === "undefined") {
        //@ts-ignore
        req.payload = {};
    };

    if (typeof req.payload.isAdmin !== "undefined" && req.payload.isAdmin) {
        bucketFolder = EgcsFolders.admin;
    }

    /**
     * subdirectory will be a unique id created when images are uploaded, it will reference the submited GCS images
     */
    let subdirectory = nanoid(7);

    if (!subdirectory) {
        return res.status(401).json({ message: "No id generated" })
    }
    /**
     * add uploaded images urls and send them to Property Schema
     */
    let uploadedImagesUrls: string[] = [];
    let promises: Array<Promise<any>> = [];
    Array.prototype.forEach.call(req.files, ((image: any, index: any) => {
        const gcsname = `${bucketFolder}/${subdirectory}/${Date.now()}_${image.originalname}`;
        uploadedImagesUrls.push(gcsname);
        const file = bucket.file(gcsname);
        const promise = new Promise((resolve, reject) => {
            file.createWriteStream({
                metadata: {
                    contentType: image.mimetype
                }
            })
                .on('error', (err) => {
                    image.cloudStorageError = err;
                    next(err);
                })
                .on('finish', async () => {
                    try {
                        image.cloudStorageObject = gcsname;
                        // this is causing an error
                        // await file.makePublic();
                        image.cloudStoragePublicUrl = getPublicUrl(gcsname);
                        resolve("Upload success");
                    } catch (err) {
                        logger.debug("Upload to GCS Failed -> " + new Date().toTimeString())
                        reject(err)
                    }

                })
                .end(image.buffer);
        })
        promises.push(promise);
    }))

    Promise.all(promises)
        .then(data => {
            promises = [];
            req.payload.imagesUrls = uploadedImagesUrls;
            //TODO it's not the best way to do this 
            req.payload.subdirectoryId = subdirectory;
            next();
        })
        .catch(next);
}


export const removeSubmitedImages = (subfolderId: string, isAdminFolder: boolean) => {
    const folder = isAdminFolder ? EgcsFolders.admin : EgcsFolders.user;
    return new Promise((resolve, reject) => {
        if (subfolderId) {
            //TODO if subfolderID is undefined no error will be thrown so be carefull
            // because response will be 200 even if nothing is deleted
            bucket.deleteFiles({ prefix: `${folder}/${subfolderId}` }, function (err) {
                if (err) {
                    logger.debug("Error deleting gcs images -> removeUserSubmitedImages " + timeNow + " " + err);
                    reject(err);
                }

                resolve("success");
            })
        } else {
            reject("Can't find subfolderId")
        }
    })
}