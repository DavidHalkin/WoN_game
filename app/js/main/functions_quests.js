 

function $(selector)
{ 
    return document.querySelector(selector); 
}
 

function quest(id)
{
    open_modal();

    new Generator({
        container: $('#modal_content'),
        init_url: `/ajax?c=quests&do=open_quest&id=${id}`
    });

     
}
 