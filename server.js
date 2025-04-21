require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const flash = require('connect-flash');

const servicesRoutes = require("./routes/services");
const noticesRoutes = require("./routes/notices");
const emergencyRoutes = require("./routes/emergency");
const memberRoutes = require("./routes/members");
const profileRoutes = require("./routes/profile");
const complaintsRoutes = require("./routes/complaints");
const authMiddleware = require('./middleware/auth'); // auth middleware
const User = require("./models/user");
const Complaint = require('./models/Complaints');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());

mongoose.connect("mongodb://127.0.0.1:27017/society-era")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

app.use(session({
    secret: "society_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/society-era" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/services", servicesRoutes);
app.use("/notices", noticesRoutes);
app.use("/emergency", emergencyRoutes);
app.use("/members", memberRoutes);
app.use("/profile", profileRoutes);
app.use("/complaints", complaintsRoutes);

app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/homepage");
    }
    res.redirect("/login");
});

app.get("/signup", (req, res) => {
    res.render("signup", { errorMessage: null });
});

app.post("/signup", async (req, res) => {
    try {
        const { username, house_no, password, mobile, email } = req.body;
        const [wing, flatNumber] = house_no.split("-");

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { errorMessage: "Email already registered!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            house_no,
            wing,
            flatNumber,
            password: hashedPassword,
            mobile,
            email,
            role: "member" // Default role on signup
        });

        await newUser.save();
        res.status(302).redirect("/login");
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).send("Error signing up. Please try again.");
    }
});

app.get("/login", (req, res) => {
    res.render("login", { errorMessage: null });
});

app.post("/login", async (req, res) => {
    try {
        const { username, house_no, password } = req.body;
        const user = await User.findOne({ username, house_no });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("login", { errorMessage: "Invalid credentials!" });
        }

        req.session.user = user;
        res.redirect("/homepage");
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Error logging in. Please try again.");
    }
});

app.get("/homepage", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("homepage", { user: req.session.user });
});

// 🔹 Get complaints page — Admin or Secretary only
app.get('/complaints', authMiddleware.isAdminOrSecretary, async (req, res) => {
    try {
        const complaints = await Complaint.find();
        const user = req.session.user;
        res.render('complaints', {
            complaints,
            user
        });
    } catch (err) {
        console.error("Error loading complaints:", err);
        res.status(500).send("Server Error");
    }
});

// 🔹 Post a new complaint — Any logged-in member
app.post('/complaints', authMiddleware.isLoggedIn, async (req, res) => {
    try {
        const { title, description } = req.body;
        const user = req.session.user;

        const newComplaint = new Complaint({
            title,
            description,
            userId: user._id
        });

        await newComplaint.save();
        res.redirect('/complaints');
    } catch (err) {
        console.error("Error saving complaint:", err);
        res.status(500).send("Error saving complaint. Please try again.");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
