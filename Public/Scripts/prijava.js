window.onload =function(){
    var username=document.getElementById("username")
    var password=document.getElementById("password")
    
    let dugme=document.getElementById("dugme")
    
    dugme.onclick = function(){
        
        PoziviAjax.postLogin(username.value,password.value,function(err,data){
            if(err != null){
                try {
                    const error = JSON.parse(err);
                    if(error.greska) {
                        var divElement = document.getElementById("areaBelow");
                        divElement.innerHTML = `<h2>${error.greska}<h2>`;
                    }
                } catch (e) {
                    window.alert(err);
                }
            }else{
                var message=JSON.parse(data)
                if(message.poruka=="Neuspješna prijava"){
                    var divElement=document.getElementById("areaBelow")
                    divElement.innerHTML="<h2>Neispravni podaci</h2>"
                }else{
                    window.location.href="http://localhost:3000/nekretnine.html"
                }
            }
        })
    }
}