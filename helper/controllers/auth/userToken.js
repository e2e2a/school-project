const UserToken = require('../../../models/userToken');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);


async function userToken(user) {
    const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
    const verificationCode = sixDigitCode();

    const userToken = new UserToken({
        userId: user._id,
        token: registrationToken,
        verificationCode: verificationCode,
        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000) // 5 mins expiration
    });
    await userToken.save();
    return userToken;
}

async function userTokenUpdate(user) {
    
    const checkUserToken = await UserToken.findOne({ userId: user._id })
    if(!checkUserToken){
        const newUserToken = await userToken(user);
        return newUserToken;
    }
    const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
    const verificationCode = sixDigitCode();

    const updatedToken  = {
        token: registrationToken,
        verificationCode: verificationCode,
        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000)
    };
    await UserToken.findOneAndUpdate({ userId: user._id }, updatedToken, { new: true })
    return updatedToken ;
}

module.exports = {
    userToken,
    userTokenUpdate
};
