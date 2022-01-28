const authorModel = require("../model/authorModel.js");
const jwt = require("jsonwebtoken");
const validator = require("../utils/validator");
const secretKey = "Project1-Blog_Publishing";

//Creating Author documents by validating the details.
const createAuthor = async function (req, res) {
  try {
    // Request body verifying
    let requestBody = req.body;

    if (!validator.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameter, please provide author Detaills",
        });
    }

    //Extract body params
    const { fname, lname, title, email, password } = requestBody;

    // Validation started & detecting here the falsy values .
    if (!validator.isValid(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "First name is required" });
    }
    if (!validator.isValid(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Last name is required" });
    }
    if (!validator.isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    }
    if (!validator.isValidTitle(title)) {
      return res
        .status(400)
        .send({
          status: false,
          message: `Title should be among Mr, Mrs and Miss`,
        });
    }
    if (!validator.isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: `Email is required` });
    }

    //Email validation whether it is entered perfectly or not.
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      res
        .status(400)
        .send({
          status: false,
          message: `Email should be a valid email address`,
        });
      return;
    }

    if (!validator.isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: `Password is required` });
    }
    const isEmailAlredyUsed = await authorModel.findOne({ email });
    if (isEmailAlredyUsed) {
      return res
        .status(400)
        .send({
          status: false,
          message: `${email} email address is already registered`,
        });
    }
    //validation Ends

    const newAuthor = await authorModel.create(requestBody);
    return res
      .status(201)
      .send({
        status: true,
        message: `Author created successfully`,
        data: newAuthor,
      });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};

//Login author Handler - Author won't be able to login with wrong credentials.
const loginAuthor = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide login details",
        });
    }

    //Extract params
    let { email, password } = requestBody;

    //Validation starts -
    if (!validator.isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: `Email is required for login` });
    }

    //Email validation whether it is entered perfectly or not.
    email = email.trim();
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      res
        .status(400)
        .send({
          status: false,
          message: `Email should be a valid email address`,
        });
      return;
    }
    if (!validator.isValid(password)) {
      //Password is entered correctly or not.
      return res
        .status(400)
        .send({ status: false, message: `Password is mandatory for login` });
    }
    //Validitions ends

    const findAuthor = await authorModel.findOne({ email, password }); //finding author details in DB to get a match of the provided Email and password.

    if (!findAuthor) {
      return res
        .status(401)
        .send({
          status: false,
          message: `Invalid login credentials. Please check the details & try again.`,
        });
    }

    //creating JWT
    let token = jwt.sign({ authorId: findAuthor._id }, secretKey);
    res.header("x-api-key", token);
    return res
      .status(200)
      .send({
        status: true,
        message: `Author login successfully`,
        data: { token },
      });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};

module.exports = {
  createAuthor,
  loginAuthor,
};
