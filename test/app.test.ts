import request from "supertest";
import app from "../src/app";
import mongoose from 'mongoose';
import { MONGODB_URI } from '../src/utils/secrets';
import logger, { timeNow } from "../src/utils/logger";
import { expect } from 'chai';
const PORT = 5900;

describe("Database hitting tests", () => {
    beforeAll((done) => {
        mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(response => {
                logger.debug("DB_API Started at port for testing environment" + PORT + " -> " + timeNow);
                app.listen(5900, done);
            })
            .catch(err => {
                logger.debug("Connection ERROR " + PORT + " -> " + timeNow);
                console.log(err);
            })
    });

    describe(`GET random URL /RANDOM-URL`, () => {
        it("Should return 404", () => {
            request(app).get("/random").expect(404)
        })
    });

    describe("GET PROPERTIES FROM DB", () => {
        it("SHOULD RETURN ALL ADMIN PROPERTIES", (done) => {
            request(app)
                .get("/admin/getProperties")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
        it("SHOULD GET ALL APARTMENTS", (done) => {
            request(app)
                .get("/admin/getAllApartments/1")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
        it("SHOULD GET ALL LANDS", (done) => {
            request(app)
                .get("/admin/getAllLands/1")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
        it("SHOULD GET ALL HOUSES", (done) => {
            request(app)
                .get("/admin/getAllHouses/1")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    });

    describe("GET PROPERTIES WITH WTONG SHORT ID", () => {
        it("SHOULD RETURN 500 FOR WRONG SHORT ID", (done) => {
            request(app)
                .get("/admin/getApartment/randomShortId")
                .expect('Content-Type', /json/)
                .expect(500)
                .end(function (err, res) {
                    expect(res.error).not.to.be.undefined;
                    return done();
                });
        });
    })

    describe("VERIFY ADMIN AUTHENTICATION", () => {
        it("should return an error if password is missing", (done) => {
            request(app)
                .post("/admin/login")
                .send({ email: "email@email.com" })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    });

    describe("USER ROUTES", () => {
        it("SHOULD GET ALL APARTMENTS", (done) => {
            request(app)
                .get("/admin/getAllSubmitedProperites")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    return done();
                });
        });
    })
})
