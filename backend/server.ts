const WebSocket = require('ws');  
const wss = new WebSocket.Server({ port: 8080 });  

wss.on('connection', (ws) => {  
  console.log('Новое подключение!');  
  ws.on('message', (message) => {  
    // Здесь будет логика шифрования/маршрутизации  
    wss.clients.forEach(client => client.send(message));  
  });  
});  