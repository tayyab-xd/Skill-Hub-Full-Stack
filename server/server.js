const express = require('express');
const bodyParser = require('body-parser');
const database=require('./config/db')
const userRoute=require('./routes/userRoute')
const gigRoute=require('./routes/gigRoutes')
const adminRoute=require('./routes/adminRoutes')
const courseRoute=require('./routes/courseRoute')
const http = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const cors=require('cors')
const path=require('path')
const webSocket=require('./config/webSocket')
const app = express();

const server = http.createServer(app);

app.use(cors())
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/' 
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user',userRoute)
app.use('/course',courseRoute)
app.use('/gig',gigRoute)
app.use('/admin',adminRoute)
webSocket(server);

server.listen(process.env.PORT || 3000);