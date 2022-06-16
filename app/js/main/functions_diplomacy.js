
 

function $(selector)
{ 
    return document.querySelector(selector); 
}
 

function show_wars()
{
    open_modal('#war_list');
}

function show_vassals()
{
    open_modal('#vassal_list');
}

function send_pact(id,state_id)
{
    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=diplomacy&do=send_pact&id=${id}&state_id=${state_id}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status') && data.status )
                         $('#pact_close'+id).classList.remove('d-none');
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
    
}

function close_pact(id,state_id)
{
    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=diplomacy&do=close_pact&id=${id}&state_id=${state_id}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status') && data.status )
                         $('#pact_close'+id).classList.add('d-none');
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
    
}