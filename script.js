// variables nécessaires pour le menu buger
const burgerBtn =document.getElementById('burger');
const nav =document.getElementById('nav');
const overlay =document.getElementById('overlay');
//variables nécessaires pour la liste de jeu dans la page d'accueil
/*let */


burgerBtn.addEventListener('click', ()=>{
    toggle();
});
overlay.addEventListener('click', ()=>{
    toggle();
});

function toggle (){
    burgerBtn.classList.toggle('is-open');
    nav.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
}