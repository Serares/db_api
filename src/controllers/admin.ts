import { Request, Response, NextFunction } from 'express';
import ISubmitUserProperty from '../interfaces/ISubmitUserProperty';
import ISubmitedProperty from '../interfaces/ISubmitedProperty';
import { SubmitedProperty } from '../models/properties/SubmitedProperty';
import { BasicUser, BasicUserDocument } from '../models/users/Basic';
import passport from 'passport';
import logger, { timeNow } from '../utils/logger';

// export const deleteUserSubmitedProperty = ()
