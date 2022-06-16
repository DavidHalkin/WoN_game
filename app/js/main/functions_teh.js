
 
function $(selector)
{ 
    return document.querySelector(selector); 
}

function $$(selector)
{
    return document.querySelectorAll(selector); 
}
 
function teh_title(title)
{
    $('#teh_title').innerHTML=title;
}

function study(id)
{
    if ($('#paper'+id)!=null && $('#paper'+id).checked )
         paper =  1;
    else paper=0;

    fetch(`/ajax?c=teh&do=study&new_teh=${id}&paper=${paper}`, {
        method: 'GET', // POST, PUT, ...
        headers: {
            "Content-Type": "application/json",
            // и/или другие заголовки если надо
        },
        // body: JSON.stringify(someObject) // раскоментировать эту строку если нужно отправляеть запрос с JSON-ом
    })
    .then(res => {
        if (res.ok) {
            res.json().then(data => {  
                if (data.hasOwnProperty('label') && $('#label'+id)!=null)
                    $('#label'+id).innerHTML=data.label;
                if (data.hasOwnProperty('time') && $('#time'+id)!=null)
                    $('#time'+id).innerHTML=data.time;
                if (data.hasOwnProperty('time_end') && $('#time'+id)!=null)
                    $('#time'+id).setAttribute('data-end',data.time_end);
                  
                teh_list();
            });
        } else {
            console.log('Ответ от сервера не OK (отличный от 200).');
        }
    });
}

function teh_list()
{
    new Generator({
        container: $('#query_teh_list'),
        init_url: `/ajax?c=teh&do=query_tehs`
    });


    const thumbs = $$('.query_teh');

    [...thumbs].forEach(thumb => {      
        thumb.addEventListener('select:update', teh_list);
    });
}
 
teh_list();

