module.exports = (req, res, next) => {
    if (req.user && req.user.role === 'secretary') {
        next();
    } else {
        res.status(403).send('Access Denied: Secretary only');
    }
};
