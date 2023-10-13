var cryptosData = getCryptosDataFromCookies() || [];
var lastValues = {};
var timer_sec = 15;

function getCryptosDataFromCookies() {
    var cookieData = document.cookie.replace(/(?:(?:^|.*;\s*)cryptosData\s*=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieData ? JSON.parse(decodeURIComponent(cookieData)) : null;
}

function setCryptosDataToCookies(data) {
    document.cookie = `cryptosData=${encodeURIComponent(JSON.stringify(data))}; expires=Sun, 31 Dec 2023 23:59:59 UTC; path=/`;
}

function upgradeValues() {
    updateValues();
    setInterval(function () {
        timer_sec--;
        $('#timer_sec').text(timer_sec);
        if (timer_sec <= 0) {
            updateValues();
            timer_sec = 20;
        }
    }, 1000);
}

$(document).ready(function () {
    cryptosData.forEach(function (crypto) {
        addCryptosPanel(crypto);
    });

    updateValues();

    $('#add-crypto-form').submit(function (e) {
        e.preventDefault();
        var newCrypto = $('#new-crypto').val().toUpperCase();
        if (!cryptosData.includes(newCrypto)) {
            cryptosData.push(newCrypto);
            setCryptosDataToCookies(cryptosData);
            addCryptosPanel(newCrypto);
        }
        $('#new-crypto').val('');
        updateValues();
    });

    $('#cryptos-panel').on('click', '.remove-btn', function () {
        var cryptoRemove = $(this).data('crypto');
        cryptosData = cryptosData.filter(c => c !== cryptoRemove);
        setCryptosDataToCookies(cryptosData);
        $(`#${cryptoRemove}`).remove();
    });

    upgradeValues();
});

function addCryptosPanel(crypto) {
    $(`#cryptos-panel`).append(`<div id="${crypto}" class="crypto-tab"><div class="content"><h2>${crypto}</h2><p id="${crypto}-value"><p/><p id="${crypto}-change"></p><button class="remove-btn btn btn-outline-secondary m-1" data-crypto="${crypto}">Remove</button></div></div>`)
}

function updateValues() {
    cryptosData.forEach(function (crypto) {
        $.ajax({
            url: '/get_data',
            type: 'POST',
            data: JSON.stringify({ 'crypto': crypto }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                var changePercent = ((data.close_value - data.open_value) / data.open_value) * 100;
                var colorClass;
                if (changePercent <= -2) {
                    colorClass = 'dark-red'
                } else if (changePercent < 0) {
                    colorClass = 'red'
                } else if (changePercent == 0) {
                    colorClass = 'gray'
                } else if (changePercent <= 2) {
                    colorClass = 'green'
                } else {
                    colorClass = 'dark-green'
                }

                $(`#${crypto}-value`).text(`$${data.close_value.toFixed(2)}`);
                $(`#${crypto}-change`).text(`${changePercent.toFixed(2)}%`);
                $(`#${crypto}-value`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                $(`#${crypto}-change`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                
                var flashClass;
                if (lastValues[crypto] > data.close_value) {
                    flashClass = 'red-flash';
                } else if (lastValues[crypto] < data.close_value) {
                    flashClass = 'green-flash';
                } else {
                    flashClass = 'gray-flash';
                }
                lastValues[crypto] = data.close_value

                $(`#${crypto}`).addClass(flashClass)
                setTimeout(function () {
                    $(`#${crypto}`).removeClass(flashClass)
                }, 1000);
                setCryptosDataToCookies(cryptosData);
            }
        });
    });
}

