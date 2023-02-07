var fs = require('fs'); 
var parser = require('./gramatica');

let number = Math.random() * (5000 - 1000) + 1000;
setTimeout(evaluateExpression, number);


function evaluateExpression(){
    fs.readFile('./entrada.txt', (err, data) => {
        if (err) throw err;
        var expected = parser.parse(data.toString());
        if(expected != true){
            //  console.log(expected);
            var messagetoSend = expected.replace(/(?:\r\n|\r|\n)/g, '<br>');
            console.log(messagetoSend);
        }
    });
}