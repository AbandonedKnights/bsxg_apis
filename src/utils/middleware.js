/**
 * Order related Middleware functions
 */
const { validateUserId, validateCurrency, validateAmount, validatePrice } = require("./validator");

// Please look in to this function> I have created validateUserId() function asyncronus
function orderValidator(req, res, next) {
    // console.log("Called mdw")
    // code for checking currenct user have perticular balance or not
    const body      = req.body ? req.body : {};
    const user_id   = body.user_id ? body.user_id : undefined;
    const currency  = body.currency_type ? body.currency_type : undefined;
    const compare_currency = body.compare_currency ? body.compare_currency : undefined;
    const volume    = body.volume ? parseFloat(body.volume) : 0;
    const price     = body.raw_price ? parseFloat(body.raw_price) : 0;
    try {
        if ((validateUserId(user_id) &&
        validateCurrency(currency) &&
        validateCurrency(compare_currency) &&
        validateAmount(volume) &&
        validatePrice(price))
    ) {
        console.log('All clear!', req.url)
        next();
    } else {
        console.log(validateUserId(user_id),currency, validateCurrency(currency), validateCurrency(compare_currency), validateAmount(volume), validatePrice(price))
        return res.json({
            status: 400,
            error: true,
            message: 'Invalid Request',
            data: req.body
        })
    }
    } catch (error) {
        console.log("Error: from:src>utils>middleware.js>orderValidator: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: 'Invalid Request',
            data: req.body
        })
    }
}





/**
 * User Related Middleware function
 */
function validateEmail(req, res, next) {
    if (req.body && req.body.email) {
        if (!isValidEmail(req.body.email)) {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid Email"
            })
        }
        next();
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid Email"
        })
    }
}

function validateEmailOrMobile(req, res, next) {
    const email = req.body && req.body.email ? req.body.email : false;
    const mobile = req.body && req.body.mobile ? req.body.mobile : false;  
     
    if(email || mobile) {
        if((email && mobile) && (!isValidEmail(email) && mobile.length != 10)) {
            return res.status(400).json({message: "OTP verification failed, invalid credentials."})    
        } else if(email && !isValidEmail(email)) {
            return res.status(400).json({message: "OTP verification failed, invalid credentials."})    
        } else if(mobile && mobile.length != 10) {
            return res.status(400).json({message: "OTP verification failed, invalid credentials."})
        } else {
            next();
        }
    } else {
        return res.status(400).json({message: "OTP verification failed, invalid credentials."})
    }
}

function validatePassword(req, res, next) {
    if (req.body && req.body.password) {
        if (!isValidPassword(req.body.password)) {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid Password*"
            })
        }
        next();
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid Password"
        })
    }
}
function validateConfirmPassword(req, res, next) {
    if (req.body && req.body.password && req.body.confirm_password) {
        if (isValidPassword(req.body.password) && req.body.password == req.body.confirm_password) {
            next();
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Confirmation Password Didn't Match"
            })
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Confirmation Password Didn't Match"
        })
    }
}

function validateKycType(req, res, next) {
    const kyc_type = req.body ? req.body.kyc_type ? req.body.kyc_type.trim() : undefined : undefined;
    if (kyc_type) {
        if (kyc_type.toLowerCase() === 'individual' || kyc_type.toLowerCase() === 'corporate') {
            next();
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid kyc type"
            })
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid kyc type"
        })
    }
}
function validateName(req, res, next) {
    const fname = req.body ? req.body.first_name ? req.body.first_name.trim() : undefined : undefined;
    const mname = req.body ? req.body.middle_name ? req.body.middle_name.trim() : undefined : undefined;
    const lname = req.body ? req.body.last_name ? req.body.last_name.trim() : undefined : undefined;
    if (fname && isValidName(fname)) {
        if (mname && !isValidName(mname)) {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid middle name"
            })
        }
        if (lname && !isValidName(lname)) {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid last name"
            })
        }
        next();
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid first name"
        })
    }
}
function validateDateOfBirth(req, res, next) {
    const dob = req.body ? req.body.date_of_birth ? req.body.date_of_birth : undefined : undefined;
    // console.log(req.body, dob);
    if (dob && parseInt(dob)) {
        if (imI18(dob)) {
            next();
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "To compleate KYC one must should be more than 18 years old"
            })
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid date of birth"
        })
    }
}
function validateAddress(req, res, next) {
    const addr = req.body ? req.body.address ? req.body.address.trim() : undefined : undefined;
    if (addr) {
        if (isValidAddress(addr)) {
            next();
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid address"
            })
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid address"
        })
    }
}
function validateCountry(req, res, next) {
    const country = req.body ? req.body.country ? req.body.country.trim() : undefined : undefined;
    if (country) {
        if (isValidPlace(country)) {
            next();
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid country"
        })
    }
}
function validateCity(req, res, next) {
    const city = req.body ? req.body.city ? req.body.city.trim() : undefined : undefined;
    if (city) {
        if (isValidPlace(city)) {
            next();
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid city"
        })
    }
}
function validateState(req, res, next) {
    const state = req.body ? req.body.state ? req.body.state.trim() : undefined : undefined;
    if (state) {
        if (isValidPlace(state)) {
            next();
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid state"
        })
    }
}
function validateZipcode(req, res, next) {
    const zipcode = req.body ? req.body.pincode ? req.body.pincode.trim() : undefined : undefined;
    if (zipcode) {
        if (isValidZipCode(zipcode)) {
            next();
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid pincode"
            })
        }
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid pincode"
        })
    }
}
function validateConfirmPassword(req, res, next) {
    next();
}
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function isValidPassword(password) {
    const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,26}$/;
    return re.test(password);
}
function isValidName(name) {
    const re = /^[A-Za-z\s]+$/;
    return re.test(name)&&name.length>=3&&name.length<=25;
}
function imI18(date) {
    var moment = require('moment');
    var eighteenYearsAgo = moment().subtract(18, "years");
    var birthday = moment(date);

    if (!birthday.isValid()) {
        return false;
    }
    else if (eighteenYearsAgo.isAfter(birthday)) {
        return true;
    }
    else {
        return false;
    }
}
function isValidAddress(address) {
    const re = /^[a-zA-Z0-9\s, '-]+$/;
    return re.test(address) && address.length >= 3 && address.length <= 100;
}
function isValidPlace(place) {
    const re = /^[a-zA-Z0-9\s]+$/;
    return re.test(place) && place.length >= 3 && place.length <= 25;
}
function isValidZipCode(zipcode) {
    const re = /^[0-9]+$/;
    return re.test(zipcode);
}

async function checkForKnownIp(req, res, next) {
    const LoginInfo = require('../models/login_info');
    try {
        /**
         * ! 1. chech if ip exiest in database
         * ! 2. if yes then next()
         * ! 3. if no then return error
         */
        /**
         * ? gather user system, browser, and ip info from request
         */
        
        /**
         * ^ inf its existence in database
         */

        /**
         * * make responce on result
         */
    } catch (error) {
        console.log("Error from checkForKnownIp (middleware)", error.message)
        return res.json({
            status: 400,
            message: "Something went wrong please try again!"
        })
    }
}
async function validateTokenAuth(req, res, next) {
    const { decrypt } = require('./functions.js');
    const LoginInfo = require('../models/login_info');
    try {
        const ipaddr = req.header("x-forwarded-for") || req.connection.remoteAddress;
        const sys_info = req.headers["sec-ch-ua-platform"];
        const dat = req.headers["sec-ch-ua"];
        const reg = /"[a-zA-Z "]*/i;
        const browser_info = dat ? dat.match(reg).toString() : "NA";
        let origin = req.get('origin');
        origin = origin ? origin : "chintu";
        const token_id = req.body && req.body.token ? req.body.token : undefined;
        const user_id = req.body && req.body.user_id ? req.body.user_id : undefined;
        // console.log("Token info: ", {
        //     ipaddr,
        //     sys_info,
        //     browser_info,
        //     origin,
        //     token_id,
        //     user_id
        // } )
        if (user_id && token_id) {
            let decrypted_text = decrypt(token_id);
            if (decrypted_text) {
                let wspaced = decrypted_text.replace(/#/g, ' ');
                let first_split = wspaced.split('+');
                let one = first_split[0];
                let browser = first_split[1];
                let ip = first_split[2];
                let two = first_split[3];
                let time = first_split[4];
                let sone = one.split('/');
                let ct = sone[0];
                let os = sone[1];
                let stwo = two.split("*");
                let ui = stwo[0];
                let og = stwo[1];
                if (
                    ct == ':secure' &&
                    ipaddr == ip &&
                    sys_info == os &&
                    browser_info == browser &&
                    origin == og &&
                    user_id == ui
                ) {
                    let token_from_db = await LoginInfo.findOne({
                        user_id: user_id,
                        access_token: token_id
                    });
                    if (token_from_db) {
                        let timestamp = token_from_db.timestamp ? token_from_db.timestamp : undefined;
                        let oneweek = 604800000;
                        if (timestamp) {
                            let d = timestamp + oneweek;
                            if (new Date().getTime() > d) {
                                await LoginInfo.deleteOne({
                                    user_id: user_id,
                                    access_token: token_id
                                });
                                return res.json({
                                    status: 401,
                                    error: true,
                                    message: "Please login first!"
                                })
                            } else {
                                next();
                            }
                        } else {
                            return res.json({
                                status: 401,
                                error: true,
                                message: "Please login first!"
                            })
                        }
                    } else {
                        return res.json({
                            status: 401,
                            error: true,
                            message: "Please login first!"
                        })
                    }
                } else {
                    return res.json({
                        status: 401,
                        error: true,
                        message: "Please login first!"
                    })
                }
            } else {
                return res.json({
                    status: 401,
                    error: true,
                    message: "Please login first!"
                })
            }
        } else {
            return res.json({
                status: 401,
                error: true,
                message: "Please login first!"
            })
        }
    } catch (error) {
        console.log("Error from validateTokenAuth: ", error.message)
    }
}
async function validateLogin(req, res, next) {
    try {
        var session = req.session;
        var host = req.get('host');
        var origin = req.get('origin');
        console.log(">>>>>>>>>>>> ", host, origin);
        console.log("Session: ", session);
        if (session) {
            let user_id = req.body && req.body.user_id ? req.body.user_id : undefined;
            if (user_id) {
                if (validateUserId(user_id) && session.user_id == user_id) {
                    next();
                } else {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Invalid request"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request!!*"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request!*"
            })
        }
    } catch (error) {
        console.log("Error in validateLogin: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong!*"
        })
    }
}
module.exports = {
    orderValidator,
    validatePassword,
    validateEmail,
    validateConfirmPassword,
    validateKycType,
    validateName,
    validateDateOfBirth,
    validateAddress,
    validateCountry,
    validateCity,
    validateState,
    validateZipcode,
    validateLogin,
    validateTokenAuth,
    validateEmailOrMobile
}