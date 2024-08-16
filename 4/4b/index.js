const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const multer = require('multer')
const db = require("./src/db.js");
const { QueryTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const session = require("express-session");
const flash = require("express-flash");
const { error } = require('console')


// set up storage and file filter
const storage =
    multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/'); // Untuk menyimpan upload file
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        })
    });

app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "view"))

app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")))
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        name: "my session",
        secret: "rahasia",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24, // 1 hari
        },
    })
)

app.use((req, res, next) => {
    res.locals.isLogin = req.session.isLogin
    next()
})

app.use(flash())

//route
app.get('/', renderIndex)
app.get("/blog-detail/:detail_id", renderDetail)
// app.get("/edit/:blog_id", renderEditBlog)
// app.get("/delete/:blog_id", renderDeleteBlog)
app.get("/add-provinsi", renderAddProvinsi)
app.get("/add-kabupaten", renderAddKabupaten)
app.get("/register", registerView)
app.get("/login", loginView)
app.get("/logout", logout)


// app.post("/blog", storage.single('image'), addBlog)
// app.post("edit/:blog_id", storage.single('image'), editBlog)
app.post("/add-provinsi", storage.single('image'), addProvinsi);
app.post("/add-kabupaten", storage.single('image'), addKabupaten);
app.post("/login", login);
app.post("/register", register);

/// ==========Register========== ///
function registerView(req, res) {
    res.render("register");
}

async function register(req, res) {
    const { name, email } = req.body
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const query = `INSERT INTO public.users(
    username, email, password) 
    VALUES ('${name}', '${email}', '${hashedPassword}') RETURNING ID;`

    try {
        const result = await db.query(query, { type: QueryTypes.INSERT })
        const newUser = result[0][0].id;

        req.session.user = { id: newUser, name: req.body.name, email: req.body.email };
        req.session.isLogin = true;
        req.session.save((err) => {
            if (err) {
                return res.redirect("/register");
            }
            res.redirect("/login");
        });

    } catch (error) {
        console.log(error)
    }
}
/// ==========Register end========== ///

/// ==========Login========== ///
function loginView(req, res) {
    res.render("login");
}

/// ==========Login========== ///
async function login(req, res) {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = $1`
    console.log("ini data server", email, password);


    const user = await db.query(query, {
        type: QueryTypes.SELECT,
        bind: [email]
    });

    if (!user) {
        req.flash("danger", "Email is not found!");
        return res.redirect("/login");
    }
    const users = user[0]

    const isPasswordValid = await bcrypt.compare(password, users.password);

    if (!isPasswordValid) {
        req.flash("danger", "Password is wrong!");
        return res.redirect("/login");
    }

    req.session.user = users
    req.session.isLogin = true;
    req.session.userId = users.id;
    req.session.save((err) => {
        if (err) {
            console.log(err)
            return res.redirect("/login")
        }
        req.flash("success", "Login berhasil!");
        res.redirect("/");

    })


}
/// ==========Login End========== ///

/// ==========Logout========== ///
async function logout(req, res) {
    try {
        req.flash("success", "Successfully logged out");
        req.session.destroy(() => {
            return res.redirect("/login");
        });
    } catch (error) {
        console.log(error);
        req.flash("danger", "Failed to Logout");
        res.redirect("/login");
    };
};
/// ==========Logout End========== ///


async function renderIndex(req, res) {
    try {
        const id = req.session.userId;
        const isLogin = req.session.isLogin;
        console.log(req.session)
        if (!isLogin) {
            return res.redirect("/register")
        };

        const provinsi = `SELECT * FROM public.provinsi WHERE user_id = $1`;
        const provinsiResult = await db.query(provinsi, {
            type: QueryTypes.SELECT,
            bind: [id]
        });

        let kabupatenResult = [];
        if (provinsiResult.length > 0) {
            const provinsiId = provinsiResult[0].id;
            const kabupatenQuery = `SELECT * FROM public.kabupaten WHERE provinsi_id = $1 ;`
            kabupatenResult = await db.query(kabupatenQuery, {
                
                type: QueryTypes.SELECT,
                bind: [provinsiId]
            });
            console.log(kabupatenResult)
        };

        res.render("index", {
            isLogin: isLogin,
            user: req.session.user,
            provinsi: provinsiResult,
            kabupaten: kabupatenResult
        })
    } catch (error) {
        console.log(error)
    }
}

function renderAddProvinsi(req, res) {
    const isLogin = req.session.isLogin
    console.log(req.session)
    if (!isLogin) {
        return res.redirect("/register")
    }
    res.render("add-provinsi")
}

function renderAddKabupaten(req, res) {
    const isLogin = req.session.isLogin
    console.log(req.session)
    if (!isLogin) {
        return res.redirect("/register")
    }
    res.render("add-kabupaten")
}

async function addProvinsi(req, res) {
    try {
        const id = req.session.userId;
        const values = [
            req.body.provinsi,
            req.body.diresmikan,
            req?.file?.filename,
            req.body.pulau,
            id
        ];
        const provinsi = `
        INSERT INTO public.provinsi(
        nama, diresmikan, photo, pulau, user_id)
        VALUES ($1, $2, $3, $4, $5);`

        await db.query(provinsi, {
            type: QueryTypes.INSERT,
            bind: values  //fungsi bind untuk menimpa values yg berisikan $
        });
        req.flash("succsess", "Provinsi add succsessfully!");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash("danger", "Provinsi failed to add succsessfully!");
        res.redirect("/add-provinsi");
    };
};

async function addKabupaten(req, res) {
    try {
        const id = req.session.userId
        const values = [
            req.body.kabupaten,
            req.body.diresmikan,
            req?.file?.filename, //mengakses nama file yang diunggah
            req.body.pulau,
            id,
        ];
        const kabupaten = `
    INSERT INTO public.kabupaten(
    nama, diresmikan, photo, provinsi, user_id)
    VALUES ($1, $2, $3, $4, $5)`

        await db.query(kabupaten, {
            type: QueryTypes.INSERT,
            bind: values
        });
        req.flash("succsess", "kabupaten add successfully!")
        res.redirect("/");
    }catch (error) {
        console.log(error)
        req.flash("danger", "kabupaten failed to add successfully!")
        res.redirect("/add-kabupaten");
    }
}

async function renderDetail(req, res) {
    try {
        const id = req.params.detail_id;
        const isLogin = req.session.isLogin;

        if(!isLogin) {
            return res.redirect("/login")
        };

        const provinsi = `SELECT * FROM public.provinsi WHERE id = $1`;
        const provinsiResult = await db.query(provinsi, {
            type: QueryTypes.SELECT,
            bind: [id]
        });

        const kabupaten = `SELECT * FROM public.kabupaten WHERE provinsi_id = $1`;
        const kabupatenResult = await db.query(kabupaten, {
            type: QueryTypes.SELECT,
            bind: [id]
        });

        res.render("blog-detail", {
            isLogin: isLogin,
            user: req.session.user,
            provinsi: provinsiResult[0],
            kabupaten: kabupatenResult
        })

    }catch (error) {
        console.log(error)
    };
};




// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})