const nodemailer = require('nodemailer');
/**
 * transapoter is an object, will be used in sending email from our server
 */
 let transporter = nodemailer.createTransport({
    host: "smtp.mailazy.com",
    port: 587,
    auth: {
      user: "cbht0jq2ieb86503e17gfzHCHBhfJd",
      pass: "LOHjPWcRcQFLnVrAAGXjVyeLIOH.vKdrWzen4o6cqTjxi4CTtJ",
    },
    authMethod: "LOGIN",
    secureConnection: true,
    requiresAuth: true,
    requireTLS: true
  });

function sendMail(data) {
    try {
        const { to, subject } = data;
        let info = {
            from:"no_reply@ctpay.cloud",
            to: to,
            // cc: data.cc ? data.cc : '',
            // bcc: data.bcc ? data.bcc : '',
            subject: subject,
            text: data.text ? data.text : '',
            html: data.html ? data.html : ''
            // attachments: data.attachments ? data.attachments : '',
            // sender: data.sender ? data.sender : testAccount.user,
        };
        transporter.sendMail(info, (function (error, data) {
            if (error) {
                console.log("error occurs", error)
            } else {
                console.log("email sent", data)
            }
        }));
    } catch (error) {
        console.log("Error: from utils > mailer.js > sendMail: ", error.message);
    }
}


function sendOTP(to, otp) {
    const subject = "BSXG Account Varification Code";
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateOtpHTML(otp, to, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, 1);
    sendMail({ to, subject, html});
}

function sendOTPinrx(to, otp) {
    const subject = "BSXG Account Varification Code";
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateOtpHTML(otp, to, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, 1);
    sendMail({ to, subject, html});
}

function sendWithdrawLink(to, transectionId, amount, symbol, toAddress='', remark, temp) {
    const subject = `Confirm Your Withdrawal Request for ${amount} ${symbol}`;
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateWithdrawHTML(transectionId, to, amount, symbol, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, toAddress, remark, temp);
    sendMail({ to, subject, html});
}
function sendWithdrawOTP(to, otp, amount, symbol, toAddress='', remark, temp) {
    const subject = `Confirm Your Withdrawal Request for ${amount} ${symbol}`;
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateWithdrawEmailHTML(otp, amount, symbol, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, toAddress, remark, temp);
    sendMail({ to, subject, html});
}
function sendDepositStatus(to, amount, remark, temp) {
    const subject = `Deposit Update Request for ${amount} INR`;
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateDepositStatusHTML(to, amount, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, remark, temp);
    sendMail({ to, subject, html});
}
function sendWithdrawStatus(to, amount, remark, temp) {
    const subject = `Withdraw Update Request for ${amount} INR`;
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateWithdrawStatusHTML(to, amount, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, remark, temp);
    sendMail({ to, subject, html});
}
function sendKYCEmail(to, msg_status,msg) {
    const subject = "BSXG KYC Verification";
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateKYCHTML(msg, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, msg_status);
    sendMail({ to, subject, html});
}
function sendBankVerificationEmail(to, msg_status,msg) {
    const subject = "BSXG Bank Verification";
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateBankHTML(msg, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, msg_status);
    sendMail({ to, subject, html});
}

function sendEmailMessage(subject, to,msg, temp) {
    const logo_url = 'https://bsxg.io/images/logo.png';
    const website_url = 'https://bsxg.io/';
    const website_name = 'BSXG';
    const organisation_addr = '';
    const title = 'bsxg.io';
    const html = generateMessageHTML(msg, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, temp);
    sendMail({ to, subject, html});
}
function generateMessageHTML(msg, info, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>${msg}</p>
                        <p>Thank you</p>
                        <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
            default :
                html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                        <div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                                <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                            </div>
                            <p style="font-size:1.1em">Hi,</p>
                            <p>This mail send By ${info&&info.name?info.name:''}.</p>
                            <p>Thank you</p>
                            <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                <p>${info&&info.title?info.title:''}</p>
                                ${info&&info.address?info.address:''}
                            </div>
                        </div>
                    </div>`;
                break;
    }
    return html;
}
function generateDepositStatusHTML(info, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                </div>
                <p style="font-size:1.1em">Your Deposit is successfully Updated.</p>
                <p>Remark:${remark}</p>
                <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>${info&&info.title?info.title:''}</p>
                    ${info&&info.address?info.address:''}
                </div>
            </div>
        </div>`;
            break;
        case 2:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                </div>
                <p style="font-size:1.1em">You have requested Deposit update. <br /> Your Record is not proper please send Correct Record.</p>
                <p>Remark:${remark}</p>
                <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>${info&&info.title?info.title:''}</p>
                    ${info&&info.address?info.address:''}
                </div>
            </div>
        </div>`
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}
function generateWithdrawStatusHTML(info, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="https://ctskola.com/theme/img/logo.png" style="max-height: 30px;" /></a>
                </div>
                <p style="font-size:1.1em">Your Withdrawal is successfully Updated</p>
                <p>Remark:${remark}</p>
                <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>${info&&info.title?info.title:''}</p>
                    ${info&&info.address?info.address:''}
                </div>
            </div>
        </div>`;
            break;
        case 2:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="https://ctskola.com/theme/img/logo.png" style="max-height: 30px;" /></a>
                </div>
                <p style="font-size:1.1em">You have requested Withdraw update. <br /> Your Record is not proper please send Correct Record.</p>
                <p>Remark:${remark}</p>
                <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>${info&&info.title?info.title:''}</p>
                    ${info&&info.address?info.address:''}
                </div>
            </div>
        </div>`
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}
function generateKYCHTML(msg, info, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>You KYC is Approved.</p>
                        <p>Thank you</p>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
        case 2:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                </div>
                <p style="font-size:1.1em">Hi,</p>
                <p>Your KYC is Not Approved and Admin is write this message. ${msg}</p>
                <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>${info&&info.title?info.title:''}</p>
                    ${info&&info.address?info.address:''}
                </div>
            </div>
        </div>`
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>BSXG Inc</p>
                            <p>211002 STPI Prayagraj</p>
                            <p>Uttar Pradesh, India</p>
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}
function generateBankHTML(msg, info, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Your Bank Verification is Approved.</p>
                        <p>Thank you</p>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
        case 2:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                </div>
                <p style="font-size:1.1em">Hi,</p>
                <p>Your Bank Verification is Not Approved and Admin is write this message. ${msg}</p>
                <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>${info&&info.title?info.title:''}</p>
                    ${info&&info.address?info.address:''}
                </div>
            </div>
        </div>`
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>BSXG Inc</p>
                            <p>211002 STPI Prayagraj</p>
                            <p>Uttar Pradesh, India</p>
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}
function generateOtpHTML(otp, to, info, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
        case 2:
            html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                    <html>
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title></title>
                        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik">
                        <style type="text/css">
                        @media screen {
                                @font-face {
                                    font-family: 'Rubik';
                                    font-style: normal;
                                    font-weight: 400;
                                    src: url(https://fonts.gstatic.com/s/rubik/v11/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0Uz.woff) format('woff');
                                }
                                }
                                /* A simple css reset */
                                @media only screen and (max-width: 620px) {
                                .wrapper .section {
                                    width: 100%;
                                }
                                .wrapper .column {
                                    width: 100%;
                                    display: block;
                                }
                                }
                        </style>
                    </head>
                    <body style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;"/>
                    </p>
                        <table width="100%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                        <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                            <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                            <td class="wrapper" width="600" align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;padding-left:10px;padding-right:10px;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                <table class="section header" cellpadding="0" cellspacing="0" width="600" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:initial;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <td class="column" style="padding:0;margin:0;border: 1px solid #c3cdc9;border-radius:8px;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                        <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                        <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                            <td align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;padding-top: 64px;">
                                            <img src="https://bsxg.io/images/logo.png" style="filter: invert(1); padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width:100%;display:block;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 161px;">
                                            <h2 style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: center; padding-top: 32px; padding-bottom: 3px;">One-Time Password (OTP)</h2>
                                            <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;margin-bottom: 48px;">
                                                <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                                <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                                    <td style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                                    <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                                                        display: inline-block;
                                                        border-radius: 50%;
                                                        width: 18px;
                                                        height: 18px;
                                                        padding: 8px;
                                                        background: #c3cdc9;
                                                        font-size: 16px;
                                                        text-align: center;
                                                        line-height: 17px;">$</p>
                                                    </td>
                                                    <td style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;vertical-align: middle;">
                                                    <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;padding: 0;">&nbsp;&nbsp;BSXG</p>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                            <td align="left" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;border-top: 1px solid #c3cdc9; 
                                            padding: 46px 54px 64px;">
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; font-weight: 600;text-align: left;">
                                                Hello, 
                                            </p>
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: left;">
                                                Enter the following OTP to finish your signup procedure.
                                            </p>
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;font-weight: 600;font-size:24px;text-align: center;">
                                                ${otp}
                                            </p>
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: left;">
                                                Your OTP is only valid within five (5) minutes. Please do not share this code with anyone.
                                            </p>
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: left;">
                                                
                                                <br>
                                                <span style="font-weight:600">Thank you</span>
                                            </p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <td class="column" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 100%; border-bottom: 1px solid #c3cdc9;">
                                        <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                        <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                            <td align="center" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;font-size: 14px; padding-top: 32px;">This message was sent to <a href="#" style="font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">${to}</a>.</p>
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;font-size: 14px; padding-bottom: 32px;">
                                                For any concerns, please visit our <a href="https://bsxg.io/">website</a>.
                                            </p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <td class="column" style="padding: 0 135px;;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 100%; margin-top: 32px; margin-bottom: 14px;" align="center">
                                        <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                        <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                            <td width="40%" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                                <a href="https://bsxg.io/" target="_blank">
                                                    <img src="https://bsxg.io/images/logo.png" style="filter: invert(1);padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;width:100%;display:block;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 122px; margin:auto;"/>
                                                </a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <td class="column" style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                    <table style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;width: 100%;">
                                        <tbody style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                        <tr style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">
                                            <td style="padding:0;margin:0;border:none;border-spacing:0px;border-collapse:collapse;vertical-align:top;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;text-align: center; font-size: 14px;">
                                            <p style="margin:0;padding:0;padding-bottom:20px;line-height:1.6;font-family:'Rubik';color:#2d4f43;font-family:'Rubik', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;">211002, STPI Building, Teliyarganj, Prayagraj, Uttar Pradesh, India</p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                </table>
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </body>
                </html>`
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>BSXG Inc</p>
                            <p>211002 STPI Prayagraj</p>
                            <p>Uttar Pradesh, India</p>
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}

function generateWithdrawHTML(transectionId, to, amount, symbol, info, toAddress, remark, template_no = 1) {
    let url = 'http://localhost:5000/api/';
    let inrurl = 'http://localhost:5000/api/success-inr-withdrawal';
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                        </div>
                        <p style="font-size:1.1em">You have requested withdrawal ${amount} ${symbol} to address ${toAddress} <br />Double check the address before confirming the withdrawal.</p>
                        <p>Remark:${remark}</p>
                        <a href="${url+"success-withdrawal/?transection_id="+transectionId}" class="btn" style="background-color:blue;color: #fff;height: 40px;
    width: 250px; text-decoration: none; border:1px solid #000;">APPROVE THIS WITHDRAWAL </a>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
            case 2:
                html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                        <div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                                <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                            </div>
                            <p style="font-size:1.1em">You have requested withdrawal ${amount} ${symbol}. <br />Double check the address before confirming the withdrawal.</p>
                            <p>Remark:${remark}</p>
                            <a href="${inrurl+"/?transection_id="+transectionId}" class="btn" style="background-color:blue;color: #fff;height: 40px;
        width: 250px; text-decoration: none; border:1px solid #000;">APPROVE THIS WITHDRAWAL </a>
                            <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                <p>${info&&info.title?info.title:''}</p>
                                ${info&&info.address?info.address:''}
                            </div>
                        </div>
                    </div>`;
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>BSXG Inc</p>
                            <p>211002 STPI Prayagraj</p>
                            <p>Uttar Pradesh, India</p>
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}
function generateWithdrawEmailHTML(otp, amount, symbol, info, toAddress, remark, template_no = 1) {
    let html = '';
    switch (template_no) {
        case 1:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                        </div>
                        <p style="font-size:1.1em">You have requested withdrawal ${amount} ${symbol} to address ${toAddress} <br />Double check the address before confirming the withdrawal.OTP is valid for 3 minutes</p>
                        <p>Remark:${remark}</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>${info&&info.title?info.title:''}</p>
                            ${info&&info.address?info.address:''}
                        </div>
                    </div>
                </div>`;
            break;
            case 2:
                html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                        <div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                                <a href="${info&&info.website?info.website:'#'}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="${info&&info.logo?info.logo:''}" style="max-height: 30px;" /></a>
                            </div>
                            <p style="font-size:1.1em">You have requested withdrawal ${amount} ${symbol}. <br />Double check the address before confirming the withdrawal.</p>
                            <p>Remark:${remark}</p>
                            <a href="${inrurl+"/?transection_id="+transectionId}" class="btn" style="background-color:blue;color: #fff;height: 40px;
        width: 250px; text-decoration: none; border:1px solid #000;">APPROVE THIS WITHDRAWAL </a>
                            <p style="font-size:0.9em;">Regards,<br />${info&&info.name?info.name:''}</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                <p>${info&&info.title?info.title:''}</p>
                                ${info&&info.address?info.address:''}
                            </div>
                        </div>
                    </div>`;
            break;
        default:
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BSXG</a>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing BSXG. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />BSXG</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>BSXG Inc</p>
                            <p>211002 STPI Prayagraj</p>
                            <p>Uttar Pradesh, India</p>
                        </div>
                    </div>
                </div>`;
            break;
    }
    return html;
}
module.exports = {
    sendOTP,
    sendMail,
    sendKYCEmail,
    sendBankVerificationEmail,
    sendWithdrawLink,
    sendDepositStatus,
    sendWithdrawStatus,
    sendWithdrawOTP,
    sendOTPinrx,
    sendEmailMessage
}


