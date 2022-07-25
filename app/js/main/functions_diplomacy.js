
 let let_pact_id=0;
 let let_state_id=0;

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
    if ($('#pact'+id).classList.contains('disabled')) return false;
    let_pact_id=id;
    let_state_id=state_id;

    ui.confirm.ask({
        question: page_data.confirm.quest,
        confirm: page_data.confirm.y,
        cancel: page_data.confirm.n
    }, confirm_pact);
    
}

function show_pacts(pact_id)
{
    new Generator({
        container: $('#main_modal #modal_content'),
        init_url: `/ajax?c=diplomacy&do=pact_list&pact_id=${pact_id}`
    }); 

    open_modal('#main_modal'); 
}

function confirm_pact(result)
{
    if (!result) return false;

    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=diplomacy&do=send_pact&id=${let_pact_id}&state_id=${let_state_id}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status') && data.status )
                         $('#pact_close'+let_pact_id).classList.remove('d-none');

                    open_modal('#main_modal');
                    $('#main_modal #modal_title').innerHTML=data.title;
                    $('#main_modal #modal_content').innerHTML=data.text;
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
                     {
                        if ($('#pact_close'+id)) $('#pact_close'+id).classList.add('d-none');
                        if ($('#pact_close'+id+'_'+state_id)) $('#pact_close'+id+'_'+state_id).classList.add('d-none');
                     }
                         
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
    
}