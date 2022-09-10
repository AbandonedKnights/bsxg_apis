const fetch = require('cross-fetch');
const { generateReferalCode, distributeReferal, distributeAirdrop } = require('./functions');
const { validateUserId } = require('./validator');
async function uploadImage(data_stream, is_base64, file_name) {
    const mime = require('mime');
    const fs = require('fs');
    try {
        var decodedImg = is_base64?decodeBase64Image(data_stream):data_stream;
        var imageBuffer = decodedImg.data;
        var type = decodedImg.mimetype;
        var extension = mime.getExtension(type);
        const newname = file_name.split('/').join('');
        var fileName = newname+"-image." + extension;
        try {
            fs.writeFileSync("./src/d/images/" + fileName, imageBuffer, 'utf8');
        } catch (err) {
            console.log("Error: ", err.message)
            return undefined;
        }
        const file_path = `/images/${fileName}`;
        return file_path;
    } catch (error) {
        return undefined;
    }
}

async function uploadImageAdmin(data_stream, is_base64, file_name) {
    const fs = require('fs');
    try {
        var decodedImg = is_base64?decodeBase64Image(data_stream):data_stream;
        var imageBuffer = decodedImg.data;
        try {
            fs.writeFileSync("./src/theme/img/" + file_name, imageBuffer, 'utf8');
        } catch (err) {
            console.log("Error: ", err.message)
            return undefined;
        }
        return file_name;
    } catch (error) {
        return undefined;
    }
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}



/**
 * 
 * 
 * New auto KYC
 * 
 * 
 */


async function verifiePan(panno) {
    try {
        if (panno) {
            /**
             * need to hit https://kyc-api.surepass.io for varification
             * return {
             *  1: success,
             *  2: invalid,
             *  3: not found,
             *  4: some error occured
             * }
             */
            let result = await fetch(`https://kyc-api.surepass.io/api/v1/pan/pan`, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "Authorization":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY0MTI4OTg5NiwianRpIjoiMmFmODgwMWUtNTU0NC00NDMzLWJlNWYtOGU5ZmFlNThhNDQ4IiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmJpdGZsYXNoQGFhZGhhYXJhcGkuaW8iLCJuYmYiOjE2NDEyODk4OTYsImV4cCI6MTk1NjY0OTg5NiwidXNlcl9jbGFpbXMiOnsic2NvcGVzIjpbInJlYWQiXX19.8-DTl7BMrqnimNXINKxRymjLp7tEyR96T4jLIG67STg",
                  "cache-control": "no-cache",
                  "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                  id_number: panno
                }),
            });
            let fresult = await result.json();
            if (fresult.status_code == 200) {
                return 1;
            } else {
                return 2;
            }
        } else {
            return 3;
        }
    } catch (error) {
        console.log("Error in verifiePan: ", error.message);
        return 4;
    }
}

async function takeAadharNoToGenerateOTP(aadharno) {
    try {
        if (aadharno) {
            /**
             * need to hit https://kyc-api.aadhaarkyc.io for varification
             * return {
             *  client_id: success,
             *  2: invalid,
             *  3: not found,
             *  4: some error occured
             * }
             */
            let result = await fetch(`https://kyc-api.aadhaarkyc.io/api/v1/aadhaar-v2/generate-otp`, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "Authorization":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY0MTI4OTg5NiwianRpIjoiMmFmODgwMWUtNTU0NC00NDMzLWJlNWYtOGU5ZmFlNThhNDQ4IiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmJpdGZsYXNoQGFhZGhhYXJhcGkuaW8iLCJuYmYiOjE2NDEyODk4OTYsImV4cCI6MTk1NjY0OTg5NiwidXNlcl9jbGFpbXMiOnsic2NvcGVzIjpbInJlYWQiXX19.8-DTl7BMrqnimNXINKxRymjLp7tEyR96T4jLIG67STg",
                  "cache-control": "no-cache",
                  "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                  async: true,
                  id_number: aadharno
                }),
            });
            let fresult = await result.json();
            console.log(fresult);
            if (fresult.status_code == 200) {
                let client_id = fresult.data.client_id;
                return client_id;
            } else {
                return 2;
            }
        } else {
            return 3;
        }
    } catch (error) {
        console.log("Error in takeAadharNoToGenerateOTP: ", error.message);
        return 4;
    }
}

async function verifieAadhar(clientid, mobileno, otp) {
    try {
        if (clientid && mobileno && otp) {
            /**
             * need to hit https://kyc-api.aadhaarkyc.io for varification
             * return {
             *  fresult: success,
             *  2: invalid,
             *  3: not found,
             *  4: some error occured
             * }
             */
            let result = await fetch(`https://kyc-api.aadhaarkyc.io/api/v1/aadhaar-v2/submit-otp`, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "Authorization":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY0MTI4OTg5NiwianRpIjoiMmFmODgwMWUtNTU0NC00NDMzLWJlNWYtOGU5ZmFlNThhNDQ4IiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2LmJpdGZsYXNoQGFhZGhhYXJhcGkuaW8iLCJuYmYiOjE2NDEyODk4OTYsImV4cCI6MTk1NjY0OTg5NiwidXNlcl9jbGFpbXMiOnsic2NvcGVzIjpbInJlYWQiXX19.8-DTl7BMrqnimNXINKxRymjLp7tEyR96T4jLIG67STg",
                  "cache-control": "no-cache",
                  "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                  client_id: clientid,
                  otp: otp,
                  mobile_number: mobileno
                }),
            });
            let fresult = await result.json();
            if (fresult.status_code == 200) {
                return fresult;
            } else {
                return 2;
            }
        } else {
            return 3;
        }
    } catch (error) {
        console.log("Error from verifieAadhar: ", error.message);
        return 4;
    }
}

async function storePanNo(panno, user_id) {
    const PendingKYC = require('../models/pending_kyc');
    try {
        if (panno && user_id && validateUserId(user_id)) {
            let user_data = await PendingKYC.findOne({user_id: user_id});
            if (user_data) {
                await PendingKYC.updateOne({_id: user_data._id}, {
                    $set: {
                        doc_2_no: panno
                    }
                })
                return true;
            } else {
                await PendingKYC.create({
                    doc_2_no: panno,
                    user_id: user_id
                })
                return true;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in store panno: ", error.message);
        return false;
    }
}
async function storeKYCinfo(info, user_id, mobile_no) {
    const PendingKYC = require('../models/pending_kyc');
    const Users = require('../models/user');
    try {
        if (user_id && validateUserId(user_id)) {
            if (info) {
                let user_info = await Users.findOne({user_id: user_id});
                if (user_info) {
                    await PendingKYC.updateOne({user_id: user_id}, {
                        $set: {
                            first_name: info.full_name,
                            date_of_birth: new Date(info.dob).getTime(),
                            email: user_info.email,
                            address: (info.address.house?info.address.house:'')+" "+(info.address.vtc?info.address.vtc:'')+" "+(info.address.po?info.address.po:'')+" "+(info.address.landmark?info.address.landmark:'')+" "+(info.address.loc?info.address.loc:''),
                            state: info.address.state,
                            city: info.address.dist,
                            country: info.address.country,
                            zip_code: info.zip,
                            added_on: Date.now(),
                            doc_1_type: 'aadhar',
                            doc_1_no: info.aadhaar_number,
                            doc_1_s: `data:image/png;base64,${info.profile_image}`,
                            status: 1,
                            mobile_no: mobile_no,
                            auto_verify:true,
                            auditing_date: Date.now(),
                            auditor_msg: "Auto Verified from https://kyc-api.aadhaarkyc.io"
                        }
                    });
                    await Users.updateOne({user_id: user_id}, {
                        $set: {
                            is_kyc_verified: 1
                        }
                    });
                    await generateReferalCode(user_id);
                    await distributeReferal(user_id);
                    await distributeAirdrop(user_id);
                    return info;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in store panno: ", error.message);
        return false;
    }
}
module.exports = {
    uploadImage,
    uploadImageAdmin,
    verifiePan,
    takeAadharNoToGenerateOTP,
    verifieAadhar,
    storePanNo,
    storeKYCinfo
}