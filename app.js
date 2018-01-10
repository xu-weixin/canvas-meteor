const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', (req, res) => {
	res.end('Hello, ' + req.body.email);
});

app.listen(3000, () => console.log('Server is listening on port 3000...'));
