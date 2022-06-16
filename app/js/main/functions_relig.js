let relig_data = JSON.parse($("#relig_data").innerText);
 

function $(selector)
{ 
    return document.querySelector(selector); 
}
 

function select_relig(id,name)
{
    const thumbs = $('.relig_list').children;

    [...thumbs].forEach(thumb => {
        if (thumb.classList.contains('selected')) thumb.classList.remove('selected');
    });

    $(`#relig${id}`).classList.add('selected');

    $('#relig_name').innerHTML=name;

    new Generator({
        container: $('#relig_info'),
        init_url: `/ajax?c=relig&do=relig_info&id=${id}`
    });
}

select_relig(relig_data.id,relig_data.name);