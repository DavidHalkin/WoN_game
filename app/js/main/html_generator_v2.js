window.Generator = function (settings) {

    const { container, init_url, not_init=false, scroll=false } = settings;

    fetch(init_url, {
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
                    // data — это распарсеный JSON в виде JS объекта
                    insertComponents(data);
                });
            } else {
                console.log('Ответ от сервера не OK (отличный от 200).');
            }
        });

        function insertComponents(data) {

            // допустип data выглядит так:
            //
            // {
            //     elements: [...]
            // }
            //
            // тогда:

            if (data?.constructor.name !== 'Object')
            {
                console.error('Невалидный JSON:');
                console.info(data);
                return;
            }

            if (data.hasOwnProperty('elements'))
            {
                data.elements.forEach(component => {
                   
                        if (document.querySelector(component.name))
                        {
                            if (component.param== 'text')
                            document.querySelector(component.name).innerHTML=component.text;
                            else if (component.param== 'remove')
                            document.querySelector(component.name).removeAttribute(component.text);
                            else if (component.param== 'value')
                            document.querySelector(component.name).value=component.text;
                            else if (component.param=='add_class')
                                document.querySelector(component.name).classList.add( component.text);
                            else if (component.param=='remove_class')
                                document.querySelector(component.name).classList.remove( component.text);
                            else
                            document.querySelector(component.name).setAttribute(component.param, component.text);
                        }
                        else  console.log('not find '+component.name);

                });
               
            }
            

            if (data.hasOwnProperty('components'))
            {
                var select = 0; 
                container.innerHTML = '';
                data.components.forEach(component => {
                    const html = components.html(component);
                    if (html) {
                        container.innerHTML += html;
                    } else {
                        console.warn(`Компонент с названием "${component.type}" не найден.`)
                    }

                    if (component.type=='drop-list') select=1; 
                });

                if (!not_init)
                {
                    if (select)
                        new Select(container.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);
                    else
                        initAll();
                }
                if (scroll)
                { 
                    const maxScroll = container.scrollHeight - container.clientHeight;
                    container.scroll(0, maxScroll);
                }
                
            }




        }


}

function close_modal(id='.modal_container')
{
    document.querySelector(id).classList.add('d-none');
}

function open_modal(id='.modal_container')
{
    document.querySelector(id).classList.remove('d-none');
}