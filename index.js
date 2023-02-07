const express = require('express');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require("cors");
require('dotenv').config();
const fs = require('fs');
const path = require('path');
var WebSocketServer = require("ws").Server;
const { exec } = require("child_process");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const TaskRunner = require('concurrent-tasks');
const Queue = require('bull');
mongoose.set('strictQuery', true);


mongoose.connect('mongodb://localhost:3000/?authMechanism=DEFAULT').then(()=>{console.log('db conected')});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password : { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const app = express();

// const runner = new TaskRunner();
// runner.setConcurrency(5);

app.use(bodyparser.json());
app.use(cors());
app.use('/style.css',express.static(__dirname + '/style.css'));
app.use('/client.js',express.static(__dirname + '/client.js'));


const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`);
})


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post("/register", async (req, res) => {
    //introducir en base de datos y que no este ya
    let userIn = await User.find({ name: req.body.name}).count();
    if(userIn == 0){
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        const user = new User({name : req.body.name,  password});
        user.save();
        res.send({correct: ' '});
    }else{
        res.send('Name used');
    }
});

app.post("/login", async (req, res) => {
    // Validaciond e existencia
    const user = await User.findOne({name: req.body.name});
    if(!user) return res.send({error: 'Usuario no encontrado'});

    // Validacion de password en la base de datos
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.send({error: 'Contraseña invalida'});

    // create token
    const token = jwt.sign({
        name: req.body.name,
        password: req.body.password
    }, process.env.TOKEN_SECRET, {
        expiresIn: "600s" 
    });

    res.header('auth-token', token).json({
        error: null,
        data: { token }
    });

    
});


const wss = new WebSocketServer({ server: server, path: '/request' });

wss.on('connection', (ws, req) => {
    console.log('conection established');

    const queue = new Queue('regex Calculator', {
        redis: { host: "127.0.0.1", port: 1000 }
      });

      queue.process( async (job, done) => { // don't forget to remove the done callback!
        let expression = job.data;
        expression = expression.expression;
        fs.writeFile('entrada.txt', 'Evaluar[' + expression + '];', (err) => {
            // In case of a error throw err.
            if (err) throw err;
        })
        exec("node ./parser.js", (error, stdout, stderr) => {
            if (error) {
                console.log('error: ' + error.message);
                done();
                return;
            }
            if (stderr) {
                console.log('stderr: ' + stderr);
                ws.send(stderr);
                done();
                return ;
            }
            console.log(stdout);
            ws.send(stdout);
            done();
        });
});

queue.on('completed', (job, result) => {
    console.log(`Job completed with result ${result}`);
})

  ws.on('message', (data) => {
    data = JSON.parse(data);
    if(data.token){
        jwt.verify(data.token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                client.send("Error: Your token is no longer valid. Please reauthenticate.");
                client.close();
            }
        })
    }else{
        client.close();
    }
    
    if(data.expression){
        const validate = async () => {
            await queue.add({ expression : data.expression});
        } 

        void validate();
    }
});
});