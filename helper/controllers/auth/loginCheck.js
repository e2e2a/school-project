let activeUserCount = 0;

async function checkActiveUsers(req, res, next) {
    const maxUsers = 20;
    if (activeUserCount < maxUsers) {
        activeUserCount++;
        next();
    } else {
        req.flash('error', 'Users are overloaded. Please try again for a couple of minutes.');
        return res.redirect('/');
    }
};

async function decreaseActiveUsers(req, res, next) {
    activeUserCount--;
    next();
};

module.exports = {
    checkActiveUsers,
    activeUserCount,
    decreaseActiveUsers
}