var productsContainer = document.querySelector('.products');
var productElements = productsContainer.getElementsByClassName('product');
var timeout;

productsContainer.addEventListener('dragstart', function(elem) {
    elem.target.classList.add('selected');
})

productsContainer.addEventListener('dragend', function(elem) {
    elem.target.classList.remove('selected');
    productPositionSend();
});

productsContainer.addEventListener('dragover', function(elem) {
    elem.preventDefault();
    var activeElement = productsContainer.querySelector('.selected');
    var currentElement = elem.target || elem.srcElement;
    var isMoveable = activeElement !== currentElement && currentElement.classList.contains('product');
    if (!isMoveable) {
        return;
    }
    var nextElement = (currentElement === activeElement.nextElementSibling) ? currentElement.nextElementSibling : currentElement;
    productsContainer.insertBefore(activeElement, nextElement);
});

for (var product of productElements) {
    product.addEventListener('click', function(event){
        if (event.target.dataset.editable === undefined) {
            return;
        }
        var key = getRandomString(32);
        event.target.dataset.key = key;
        var modalString = `
<div class="modal" data-key-modal="${key}" data-product-id-modal="${event.target.parentElement.dataset.productId}" style="top:${event.clientY}px;left:${event.clientX}px">
    <div class="modalString" contenteditable="true">${event.target.innerText}</div>
    <button class="modalSend">Готово</button>
</div>
        `;
        removeModals('.modal');
        document.body.insertAdjacentHTML('beforeend', modalString);
        document.querySelector('.modalSend').addEventListener('click', function(event) {
            var newText = event.target.parentNode.querySelector('.modalString').innerText.trim();
            if (newText.length === 0 || !newText.trim()) {
                return;
            }
            try {
                document.querySelector(`[data-key="${event.target.parentNode.dataset.keyModal}"]`).innerText = newText;
                modalSend(event);
            } catch (e) {
                if (e instanceof TypeError) {
                    console.log('Устаревшее модальное окно.');
                }
                removeModals('.modal');
            }
        });
    });
}
document.addEventListener('click', function(event) {
    if (!(event.target.classList.contains('product__name') || event.target.classList.contains('modal') || event.target.classList.contains('modalString') || event.target.classList.contains('modalSend'))) {
        setTimeout(function(){
            
            removeModals('.modal');
        })
    }
});

var menu = document.querySelector('.menu');
var menuFirstItems = document.querySelectorAll('.menu > .menu__inner > .menu__item')
menu.addEventListener('mouseover', function(){
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        document.querySelector('.menu > .menu__inner').style.display = 'block';
    }, 400);
});
menu.addEventListener('mouseout', function(){
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        document.querySelector('.menu > .menu__inner').style.display = 'none';
    }, 800);
});

// тут отправляются id и новое имя одного товара (currentElement - событие клика)
function modalSend(currentElement) {
    var parentElement = currentElement.toElement.parentElement;
    if (parentElement.classList.contains('modal')) {
        var xhr = getXmlHttp();
        var json = JSON.stringify({
            controller: 'products',
            mode: 'update',
            product_id: parentElement.dataset.productIdModal,
            product_name: parentElement.querySelector('.modalString').innerText
        });
        xhr.open("POST", '/submit', true)
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        console.log(json)
        // xhr.send(json);
    }
    removeModals('.modal');
}

// тут отправляются текущие позиции товаров (в таком же порядке как и на странице)
function productPositionSend() {
    var positions = {};
    for (var i = 0; i < productElements.length; i++) {
        positions[i] = {
            product_id: Number(productElements[i].dataset.productId),
            position: i
        }
    }
    var xhr = getXmlHttp();
    var json = JSON.stringify(positions);
    xhr.open("POST", '/submit', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    console.log(json)
    // xhr.send(json);
}
function removeModals(selector) {
    var modals = document.querySelectorAll(selector);
    for (var modal of modals) {
        modal.remove();
    }
}
function getRandomString(length) {
    var s = '';
    do {
        s += Math.random().toString(36).substr(2);
    } while (s.length < length);
    s = s.substr(0, length);
    return s;
}
function getXmlHttp() {
    var xmlHttp = null;
    if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlHttp;
}
