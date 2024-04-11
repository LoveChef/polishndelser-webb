const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
//const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));

//app.use('/admin', adminRoutes);
app.use(express.static('public'));

app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).send('<h1>Page not found</h1>');
});
const port = 3000;
app.listen(port, () => console.log(
    `Example app listening at http://localhost:${port}`,
  ));

