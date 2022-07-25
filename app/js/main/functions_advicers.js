
 

function $(selector)
{ 
    return document.querySelector(selector); 
}

function take_advicer(id,pers_id)
{
    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=advicers&do=take_advicer&id=${id}&pers_id=${pers_id}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status') && data.status )
                     { 
                        $('#advicer_select_'+id).classList.add('d-none'); 
                        $('#advicer_img_'+id).classList.remove('d-none'); 
                        $('#advicer_img_'+id).setAttribute('src',data.img);
                        $('#advicer_stat_'+id).innerHTML=data.stat;
                        $('#advicer_name_'+id).innerHTML=data.name;
                        $('#advicer_kick_'+id).classList.remove('d-none');   
                        $('#advicer_stat_'+id).classList.remove('d-none'); 
                        close_modal();                      
                     }
                        
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
    
}

function select_advicer(id)
{
    new Generator({
        container: $('#modal_content'),
        init_url: `/ajax?c=advicers&do=advicers_list&id=${id}`
    }); 

    open_modal(); 
}
 
function kick_advicer(id)
{
    fetch(`/ajax`, {
        method: 'POST', // POST, PUT, ...
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
        },
        body: `c=advicers&do=kick&id=${id}`
    })
        .then(res => {
            if (res.ok) {
                res.json().then(data => {
                    // data — это распарсеный JSON в виде JS объекта
                     if (data.hasOwnProperty('status') && data.status )
                     { 
                        $('#advicer_select_'+id).classList.remove('d-none'); 
                        $('#advicer_img_'+id).classList.add('d-none'); 
                        $('#advicer_stat_'+id).classList.add('d-none'); 
                        $('#advicer_kick_'+id).classList.add('d-none');      
                        
                        $('#advicer_stat_'+id).innerHTML='';
                        $('#advicer_name_'+id).innerHTML='';
                     }
                        
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });
}

 