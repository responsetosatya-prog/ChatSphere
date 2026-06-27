/* ===================================================
   ChatSphere - main.js
   Main UI Functions
=================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initNavbar();

    initMobileMenu();

    initSmoothScroll();

    initHeroButtons();

    initBackToTop();

});

/* ===========================================
   Sticky Navbar
=========================================== */

function initNavbar(){

    const header = document.querySelector(".header");

    window.addEventListener("scroll",()=>{

        if(window.scrollY > 40){

            header.style.background = "rgba(10,15,30,.92)";
            header.style.backdropFilter = "blur(20px)";
            header.style.boxShadow = "0 15px 35px rgba(0,0,0,.35)";

        }else{

            header.style.background = "rgba(10,15,30,.55)";
            header.style.boxShadow = "none";

        }

    });

}

/* ===========================================
   Mobile Menu
=========================================== */

function initMobileMenu(){

    const button = document.querySelector(".mobile-menu-btn");

    const nav = document.querySelector(".nav-links");

    if(!button || !nav) return;

    button.addEventListener("click",()=>{

        nav.classList.toggle("mobile-open");

        if(nav.classList.contains("mobile-open")){

            button.innerHTML = "✕";

        }else{

            button.innerHTML = "☰";

        }

    });

}

/* ===========================================
   Smooth Scroll
=========================================== */

function initSmoothScroll(){

    document.querySelectorAll('a[href^="#"]').forEach(link=>{

        link.addEventListener("click",function(e){

            const target = document.querySelector(this.getAttribute("href"));

            if(!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior:"smooth"

            });

        });

    });

}

/* ===========================================
   Hero Buttons
=========================================== */

function initHeroButtons(){

    const buttons = document.querySelectorAll(".btn");

    buttons.forEach(button=>{

        button.addEventListener("mouseenter",()=>{

            button.style.transform = "translateY(-4px) scale(1.02)";

        });

        button.addEventListener("mouseleave",()=>{

            button.style.transform = "";

        });

    });

}

/* ===========================================
   Back To Top Button
=========================================== */

function initBackToTop(){

    const topButton = document.createElement("button");

    topButton.innerHTML = "↑";

    topButton.className = "backToTop";

    document.body.appendChild(topButton);

    Object.assign(topButton.style,{

        position:"fixed",
        right:"25px",
        bottom:"25px",
        width:"55px",
        height:"55px",
        border:"none",
        borderRadius:"50%",
        cursor:"pointer",
        fontSize:"22px",
        color:"#fff",
        background:"linear-gradient(135deg,#6D5DFC,#8A7DFF)",
        boxShadow:"0 15px 30px rgba(0,0,0,.35)",
        display:"none",
        zIndex:"9999",
        transition:"0.3s"

    });

    window.addEventListener("scroll",()=>{

        if(window.scrollY > 500){

            topButton.style.display = "block";

        }else{

            topButton.style.display = "none";

        }

    });

    topButton.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/* ===========================================
   Console Message
=========================================== */

console.log(
"%c🚀 Welcome to ChatSphere",
"font-size:20px;color:#8A7DFF;font-weight:bold;"
);

console.log(
"%cDeveloped with ❤️",
"font-size:14px;color:white;"
);
