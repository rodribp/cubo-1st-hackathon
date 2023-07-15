//Component to manage logic of apis

//creating global variables for api requests
const DOMAIN_URL = 'https://eae4-201-159-113-196.ngrok-free.app/';

const ADMIN_URL = DOMAIN_URL + 'api/v1/';
const ADMIN_KEY = '7eb51a6a4b20486fbe76e5c0686a4f1e';
const ADMIN_ID = '031e0e39187846c5b4253b7c71ec8ed6';

const LNURLP_URL = DOMAIN_URL + 'lnurlp/api/v1/links';


var invoiceHash1 = '';
var invoiceHash2 = '';
var formUser = document.getElementById('create-user-form');

//get data from lnbits api
const apiRequestGet = async (action, usr) => {
    let key = '';
    let url = '';

    switch (usr) {
        case 1:
            key = ADMIN_KEY;
            url = ADMIN_URL;
            break;
        case 2:
            key = ADMIN_KEY;
            url = LNURLP_URL;
            break;
        default: 
            console.log('Specify an announced kind of user')
            break;
    }

    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key,
            'ngrok-skip-browser-warning': true,
        }
    }

    const response = await fetch(url + action, options);
    const json = await response.json();

    if (json.error) {
        console.log(json.error);
    }

    return json;
}

//post requests for lnbits api
const apiRequestPost = async (action, body) => {
    let key = ADMIN_KEY;
    let url = ADMIN_URL;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key
        },
        body: JSON.stringify(body)
    }

    const response = await fetch(url + action, options);
    const json = await response.json();

    if (json.error) {
        console.log(json.error);
    }

    return json;
}


const setQrCode = (idElement, paramText, paramWidth, paramHeight) => {
    new QRCode(idElement, {text: paramText, width: paramWidth, height: paramHeight});
}


//function to get lnurl of user
const getLnurlp = async (idElement, paramWidth, paramHeight) => {
    let data = await apiRequestGet('', 2);

    setQrCode(idElement, data[0].lnurl, paramWidth, paramHeight);

    return data[0].lnurl;
}

const createInvoice = async (amt, msg) => {
    let response = await apiRequestPost('payments', {amount: amt, lnurl_callback: null, memo: msg, out: false, unit: 'sat'});

    return response;
}

document.addEventListener('DOMContentLoaded', async (e) => {
    let lnurl = await getLnurlp('qr-code1', 125, 125);
    let invoice1 = await createInvoice(10, 'Payment for content!');
    let invoice2 = await createInvoice(10, 'Payment for content!');
    setQrCode('qr-code2', invoice1.payment_request, 200, 200);
    setQrCode('qr-code3', invoice2.payment_request, 200, 200);

    invoiceHash1 = invoice1.payment_hash;
    invoiceHash2 = invoice2.payment_hash;
    const interval = setInterval(verifyInvoice, 5000);
});

const verifyInvoice = async () => {
    let data1 = await apiRequestGet('payments/' + invoiceHash1, 1);
    let data2 = await apiRequestGet('payments/' + invoiceHash2, 1);

    if (data1.paid) {
        document.getElementById('content1').innerHTML = content1;
    }

    if(data2.paid) {
        document.getElementById('content2').innerHTML = content2;
    }
}