let pact_id=0;
let char_id=0;
 
function $(selector)
{ 
    return document.querySelector(selector); 
}

function marry(char_id=0)
{
    //откріть окно
    new Generator({
        container: $('#modal_content'),
        init_url: `/ajax?c=dinasty&do=marry_list`
    }); 

    open_modal(); 
}
 

function send_pact(id,cid)
{
    //if ($('#pact'+id) && $('#pact'+id).classList.contains('disabled')) return false;
    pact_id=id;
    char_id=cid;

    ui.confirm.ask({
        question: page_data.confirm.quest,
        confirm: page_data.confirm.y,
        cancel: page_data.confirm.n
    }, confirm_pact);
    
}

function confirm_pact(result)
{
    if (!result) return false;

    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=dinasty&do=send_pact&id=${pact_id}&char_id=${char_id}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status')   )
                     {
                        if ( data.status) $('#pact'+pact_id).classList.add('disabled');
                        open_modal();
                        $('#modal_title').innerHTML=data.title;
                        $('#modal_content').innerHTML=data.text;
                        

                     }
                        
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
}