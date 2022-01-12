const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());

app.use ((req, res, next) => {
    res.locals.url = req.originalUrl;
    res.locals.host = req.get('host');
    res.locals.protocol = req.protocol;
    next();
});

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use('/', require('./routes'));


app.use(function(req, res, next) {
    next(createError(404));
});


app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    if(res.locals){
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
    }
    // render the error page
    res.status(500).json({
        message: err.message,
        error: err
    });
});

module.exports = app;
