
 

function $(selector)
{ 
    return document.querySelector(selector); 
}
 
function renew_profit()
{
    new Generator({
        container: $('#profit'),
        init_url: `/ajax?c=finance&do=profit`
    });
}

function renew_fin(type,val)
{
    fetch(`/ajax?c=finance&do=set_fin&type=${type}&val=${val}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json", 
        }, 
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => { 
                if (data.hasOwnProperty('val'))
                    $('#fin_'+type).innerHTML=data.val;
                
                renew_profit();
                     
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });
}

renew_profit();