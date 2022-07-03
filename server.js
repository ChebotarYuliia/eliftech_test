const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const public = path.join(__dirname, '/');

app.get('/', function (req, res) {
    res.sendFile(path.join(public, 'index.html'));
});
app.use('/', express.static(public));

app.listen(port, () => console.log(`listening on port ${port}!`));