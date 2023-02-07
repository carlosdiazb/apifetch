var button = document.getElementById('button-login');
var button3 = document.getElementById('button-register');
var button2 = document.getElementById('button-expression');
var n, p;
var expression = document.getElementById('expression')
var token;
var ws;

async function login(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function init() {
    await login('http://localhost:3002/login', {
        name: n.value,
        password: p.value
    }).then(res => {
        if(res.data.token){
            token = res.data.token;
            if(token && n.value && p.value ){
                document.getElementById('login').style.display = 'none';
                document.getElementById('container').style.display = 'block';
                openWsConnection();
            }
        }else{
            let error = document.getElementById('error-log');
            error.innerHTML = 'Invalid data, try again or go to the register if you are not register';
            error.style.display = 'block';
        }
    }).catch(res => {
            let error = document.getElementById('error-log');
            error.innerHTML = 'Invalid data, try again or go to the register if you are not register';
            error.style.display = 'block';
    });
}

button.addEventListener('click', () =>{
    n = document.getElementById('name');
    p = document.getElementById('password');
    init();
})

async function register(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function initRegister() {
    if(n.value && p.value ){
        await register('http://localhost:3002/register', {
            name: n.value,
            password: p.value
        }).then(res => {
            let error = document.getElementById('error-reg'); 
            error.innerHTML = 'You have register correctly, now you can login';
            error.classList.toggle('correct');
            error.style.display = 'block';
        }).catch(error => {
            let er = document.getElementById('error-reg'); 
            er.innerHTML = 'Username used, please take another one';
            er.style.display = 'block';
            if(er.classList.remove('correct')){
                er.classList.toggle('correct');
            }
        });
    }else{
        let isP = document.getElementById('input');
        if(!isP){
            let p = document.createElement('p');
            p.innerHTML = 'Fill the inputs';
            p.id = 'input';
            document.getElementById('register').appendChild(p);
        }
    }
}

button3.addEventListener('click', () =>{
    n = document.getElementById('name2');
    p = document.getElementById('password2');
    initRegister();
})

function openWsConnection(){
    ws = new WebSocket("ws://localhost:3001/request");

    ws.onopen = (event) => {
        console.log("WebSocket connection established.");
    }

    // Display any new messages received in the `messageDiv`.
    ws.onmessage = (event) => {
        document.getElementById('check').style.display = 'none';
        document.getElementById('expression-value').style.display = 'block';
        document.getElementById('expression-value').innerHTML = event.data;
        console.log(event.data);
    }

    ws.onerror = (event) => {
        console.log("WebSocket error received: ", event);
    }

    ws.onclose = (event) => {
        console.log("WebSocket connection closed.");
    }
}


button2.addEventListener('click', () => {
    let msg = { 
        expression : expression.value,
        token : token
    }
    ws.send(JSON.stringify(msg));
    document.getElementById('check').style.display = 'block';
    let attemps = document.getElementById('attemps').innerHTML;
    attemps = parseInt(attemps);
    if(attemps > 0){
        attemps--;
        document.getElementById('attemps').innerHTML = attemps;
    }else{
        document.getElementById('check').style.display = 'none';
        document.getElementById('attemps0').innerHTML = 'No attemps left, login again if you want to continue using the calculator';
        document.getElementById('attemps0').style.display = 'block';
        ws.close();
    }
})

document.getElementById('register-href').addEventListener('click', () => {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
})

document.getElementById('button-back').addEventListener('click', () => {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
})