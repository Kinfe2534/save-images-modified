setTimeout(function(){
window.open("https://amazon.com","_self");
},4000);
$(window).on('load', function() {
    // code here
    console.log("fully loaded from win open");
    injectWraper();
   });