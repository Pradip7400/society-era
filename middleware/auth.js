function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') return next();
    res.status(403).send("Access Denied: Admins only");
}

function isSecretary(req, res, next) {
    if (req.session.user && req.session.user.role === 'secretary') return next();
    res.status(403).send("Access Denied: Secretaries only");
}

function isAdminOrSecretary(req, res, next) {
    const user = req.session.user;
    if (!user) return res.redirect("/login");
    if (user.role === 'admin' || user.role === 'secretary'|| user.role === 'member') return next();
    res.status(403).send("Access Denied: Only Admins or Secretary or member can access this.");
}

function isLoggedIn(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

function isSelfOrAdmin(req, res, next) {
    const loggedInUser = req.session.user;
    const memberId = req.params.id;

    if (loggedInUser && (loggedInUser.role === "admin" || loggedInUser._id == memberId)) {
        return next();
    }

    res.status(403).send("Access Denied");
}

// ✅ NEW: Allow members, admins, and secretaries to submit complaints
function canSubmitComplaint(req, res, next) {
    const user = req.session.user;
    if (!user) {
        console.log("User not logged in");
        return res.redirect("/login");
    }

    const allowedRoles = ["admin", "secretary", "member"];
    if (allowedRoles.includes(user.role)) return next();

    res.status(403).send("Access Denied: Only registered users can submit complaints.");
}



module.exports = {
    isAdmin,
    isSecretary,
    isAdminOrSecretary,
    isLoggedIn,
    isSelfOrAdmin,
    canSubmitComplaint // ✅ export the new middleware
};
