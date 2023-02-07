<h1>HECHO</h1>
Implementado un proxy por el cual pasan primero las peticiones y las redirige a las rutas servidor. Cuando te conectas a localhost se abre la interfaz gráfica, lo primero que ves es un login el cual solo podrás hacer si antes estas registrado en una base de datos en mongodb, si no te vas al formulario de registro, tras registrarse ya puedes hacer login. Cuando haces login se abre un websocket y el cliente obtiene un json web token el cual el servidor comprobará si es el correcto en cada mensaje del cliente, si no lo es cerrará la conexión. Si todo va bien llegará a la interfaz de comprobación de expresiones regulares en la cual tienes 5 oportunidades de usarla y una cola de tareas implementada, ésta te dirá si su expresion está bien formada o no y su fallo.  

<h1>FALTA</h1>
Certificados<br>
Microservicios<br>
