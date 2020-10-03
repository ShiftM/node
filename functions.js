
function insertComment()
{
    var xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = function(){
    //     if(this.readyState == 4 && this.status == 200)
    //     {
    //     var result = this.responseText;
    //     console.log(result);
    //     loadComments();
    //     } 
    // }

    var email = document.getElementById('exampleInputEmail1').value;
    var password = document.getElementById('exampleInputPassword1').value;

    xhttp.open("POST", "/insert", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send('{"email":"'+email+'", "password":"'+password+'"}');
}

