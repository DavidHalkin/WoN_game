
  
let socket = new WebSocket((window.location.protocol === 'https:' ? 'wss' : 'ws')+"://"+window.location.hostname+":8443/");

socket.onopen = function(e) {
  console.log("[open] Соединение установлено"); 
};

socket.onmessage = function(event) {
    console.log(`[message] Данные получены с сервера: ${event.data}`);

    //Эта моя функция, она есть на каждой странице в /js/main/function_chat.js, необходима для работы чата
    if (data.hasOwnProperty('renew_chat') &&   (typeof window[chat_renew])=='function')
    {
        chat_renew(data.renew_chat);
    }
    //тут пишешь то что для карты нужно
    if (data.hasOwnProperty('renew_map') &&   (typeof window[renew_map])=='function')
    {
        
    }

    if (data.hasOwnProperty('renew_battle') &&   (typeof window[renew_battle])=='function')
    {
        renew_battle();
    }

    if (data.hasOwnProperty('new_url') )
    {
      window.open(data.new_url, "_blank");
    }

   
    
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
  } else { 
    console.log(`[close] Соединение прервано  код=${event.code} причина=${event.reason}`);
  }
};

socket.onerror = function(error) {
    console.log(`[error] ${error.message}`);
};