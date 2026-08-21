// variables nécessaires pour le menu buger
const burgerBtn =document.getElementById('burger');
const nav =document.getElementById('nav');
const overlay =document.getElementById('overlay');
let personnages = document.querySelectorAll(".unPersonnage");
let personnageSelectionne= document.querySelector("#personnageSelectionne");
let nomPersonnageJeuUn= document.querySelector("#nomPersonnageJeuUn");
let descriptionPersonnageJeuUn= document.querySelector("#descriptionPersonnageJeuUn");
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

function donnerEvenement(){
    personnages.forEach((personnage)=>{
       personnage.addEventListener("click", (event) =>{
        let idPersonnage = event.target.id;    
        console.log(idPersonnage);
        switch(idPersonnage){
            case "FALL":
                personnageSelectionne.src="Images/jeuUn-F-Incomplet.png";
                nomPersonnageJeuUn.textContent=idPersonnage;
                descriptionPersonnageJeuUn.textContent=personnage.alt;
            break;
            case "Frieden":
                personnageSelectionne.src="Images/jeuUn-Fr-Incomplet.png";
                nomPersonnageJeuUn.textContent=idPersonnage;
                descriptionPersonnageJeuUn.textContent=personnage.alt;
            break;
            case "Leo":
                personnageSelectionne.src="Images/jeuUn-L-Incomplet.png";
                nomPersonnageJeuUn.textContent=idPersonnage;
                descriptionPersonnageJeuUn.textContent=personnage.alt;
            break;
            case "Coisabafe":
                personnageSelectionne.src="Images/jeuUn-C-Incomplet.png";
                nomPersonnageJeuUn.textContent=idPersonnage;
                descriptionPersonnageJeuUn.textContent=personnage.alt;
            break;
        }
       });
    });
}

donnerEvenement();