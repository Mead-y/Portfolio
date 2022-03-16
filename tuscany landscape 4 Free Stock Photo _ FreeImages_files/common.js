const mainContainer = document.getElementById('main-container');
const headerNav = document.getElementById('header-nav');

function hideElement(ev){
    if ((ev.target.id == "toggler") || (ev.target.id == "left-menu-options")) {
        var elem = document.getElementById("left-menu-options");
        var elem1 = document.getElementById("slide");
        var body = document.body;

        elem.classList.toggle("overflow-hidden");
        body.classList.toggle("overflow-hidden");
        body.classList.toggle("md:overflow-auto");

        if (elem.classList.contains("h-0")) {
            elem.classList.remove("h-0");
            elem.classList.add("h-screen");
        } else {
            elem.classList.remove("h-screen");
            elem.classList.add("h-0");
        }

        elem.classList.toggle("bg-secondary");
        elem1.classList.toggle("-translate-x-full");
        
    } else {
        ev.stopPropagation();
    }
}

function hideDropdown(ev) {
    if(window.innerWidth<768) { 
        var id = ev.target.id
        if (id.substring(id.length - 6) == ("-arrow"))
        id = id.substring(0, id.length - 6);
        var idArrow = id + "-arrow";
        id = id + "-dropdown";
        var elem = document.getElementById(id);
        var elemArrow = document.getElementById(idArrow);
        if (elem != null) {
            if (elemArrow != null) {
                elemArrow.classList.toggle("rotate-180");
            } 
            if (elem.classList.contains("hidden")) {
                elem.classList.remove("hidden");
                elem.classList.add("md:hidden");
            } else {
                elem.classList.add("hidden");
                elem.classList.remove("md:hidden");
            }
        } else {
            ev.stopPropagation();
        }
    }
}

function hideLanguages() {
    var elem = document.getElementById("languages-dropdown");
    elem.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("footer-language").addEventListener("click", function() {
        toggleLanguagesModal();
    });
    
    document.getElementById("btn-close-languages-modal").addEventListener("click", function() {
        toggleLanguagesModal();
    });

    // Close languages modal when clicked oustide of it
    document.getElementById('languages-modal').addEventListener('click', function (e) {
        var languagesModalNav = document.getElementById('languages-modal-nav');
        if (!languagesModalNav.contains(e.target)) {
            toggleLanguagesModal();
        }
    })

    document.getElementById('btn-header-languages').addEventListener('click', function () { 
        if (window.innerWidth < 768) {
            toggleLanguagesModal();
        }
    })
})

function toggleLanguagesModal() {
    var languagesModal = document.getElementById('languages-modal');
    languagesModal.classList.toggle("hidden")
    
    if (document.body.style.overflow == 'hidden') {
        document.body.style.overflow = 'auto';
    } else {
        document.body.style.overflow = 'hidden';
    }
}


document.addEventListener('scroll', function () {
    if (document.getElementById('search-header').dataset.headerTransparent == 1) {
        if (window.scrollY < 5)  {
            // Set bg-transparent
            document.getElementById('search-header').classList.replace('bg-white', 'bg-transparent')
            document.getElementById('search-header').classList.remove('shadow-lg')
            document.getElementById('logo-header').classList.add('invert')
            
        } else {
            // Set bg-white
            document.getElementById('search-header').classList.replace('bg-transparent','bg-white')
            document.getElementById('search-header').classList.add('shadow-lg')
            document.getElementById('logo-header').classList.remove('invert')
        }
    }
})
