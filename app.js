const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

require('./utils/db')
const Contact = require('./models/contact')

const app = express()
const port = 3000

// setup ejs
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// konfigurasi flash
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash());

// Halaman Home
app.get('/', (_req, res) => {
    const mahasiswa = [
        {
            nama: 'Rizki',
            email: 'rizki@gmail.com'
        },
        {
            nama: 'Joni',
            email: 'joni@gmail.com'
        },
        {
            nama: 'Rizal',
            email: 'rizaldi@gmail.com'
        },
    ]

    //* render ejs file from the views folder
    res.render('index', {
        nama: 'Dias Utsman',
        title: 'Halaman Home',
        layout: 'layouts/main-layout',
        mahasiswa
    })
})

// Halaman About
app.get('/about', (_req, res) => {
    //* render ejs file from the views folder
    res.render('about', {
        title: 'Halaman About',
        layout: 'layouts/main-layout',
    })
})

// Halaman Contact
app.get('/contact', async (req, res) => {
    //Contact.find().then((contact) => {
    //    res.send(contact)
    //})

    const contacts = await Contact.find()

    //* render ejs file from the views folder
    res.render('contact', {
        title: 'Halaman Contact',
        layout: 'layouts/main-layout',
        contacts,
        msg: req.flash('msg')
    })
})

// halaman form tambah data kontak
app.get('/contact/add', (_req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
    })
})

// proses tambah data contact
app.post('/contact', [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value })
        if (duplikat) {
            throw new Error('Nama contact sudah digunakan!')
        }
        return true
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'No HP tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title: 'Form Tambah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (_error, _result) => {
            // kirimkan flash message
            req.flash('msg', 'Data contact berhasil ditambahkan!')
            res.redirect('/contact')
        })
    }

})

app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((_result) => {
        req.flash('msg', 'Data contact berhasil dihapus!')
        res.redirect('/contact')
    })
})

// halaman form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })

    res.render('edit-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        contact
    })
})

// proses ubah data
app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value })
        if (value !== req.body.oldNama && duplikat) {
            throw new Error('Nama contact sudah digunakan!')
        }
        return true
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'No HP tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        res.render('edit-contact', {
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body
        })
    } else {
        Contact.updateOne(
            { _id: req.body._id },
            {
                $set: {
                    nama: req.body.nama,
                    nohp: req.body.nohp,
                    email: req.body.email
                }
            }
        ).then((_result) => {
            req.flash('msg', 'Data contact berhasil diubah!')
            res.redirect('/contact')
        })

    }

})

// Halaman Detail
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })

    //* render ejs file from the views folder
    res.render('detail', {
        title: 'Halaman Detail Contact',
        layout: 'layouts/main-layout',
        contact
    })
})

app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`)
})