const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.status(404).send('<h1>Page not found</h1>');
});
const port = 3000;
app.listen(port, () => console.log(
    `Example app listening at http://localhost:${port}`,
  ));

