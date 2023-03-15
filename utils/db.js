const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/du');


//// Menambah 1 data
//const contact1 = new Contact({
//    nama: 'Dias',
//    nohp: '08123434333',
//    email: 'utsmand91@gmail.com'
//})

//// Simpan ke collection
//contact1.save().then((contact) => console.log(contact))