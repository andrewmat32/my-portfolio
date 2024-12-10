// document.addEventListener( 'DOMContentLoaded', function() {
//     var containers = document.querySelectorAll('[]');
//     var cursor = document.querySelector('.cursor');
//
//     document.addEventListener('mousemove', function(e) {
//         cursor.style.left = e.clientX + 'px';
//         cursor.style.top = e.clientY + 'px';
//     });
//
//     containers.forEach(function(container) {
//         container.addEventListener('mouseenter', function(){
//             cursor.style.display = "block";
//             cursor.style.height = "80px";
//             cursor.style.width = "80px";
//             cursor.style.left = "-50%";
//             cursor.style.top = "-50%";
//             cursor.style.transition = "0.1s";
//         });
//         container.addEventListener('mouseleave', function(){
//             cursor.style.display = "none";
//             cursor.style.height = "0px";
//             cursor.style.width = "0px";
//             cursor.style.left = "-50%";
//             cursor.style.top = "-50%";
//             cursor.style.transition = "0.1s";
//         });
//     });
//
// });

document.addEventListener( "DOMContentLoaded", () =>
{
    handleSkills();
    handleProjectContent();

} );


function handleProjectContent()
{
    const projects = document.querySelectorAll( "[data-project-tab]" );
    projects.forEach( project =>
    {
        project.addEventListener( "click", () =>
        {
            project.parentElement.parentElement.classList.toggle( "active" );
        } );
    } );
}


function handleSkills()
{
    const body = document.body;
    const overlay = document.createElement( "div" );
    overlay.id = "skill-overlay";
    document.body.appendChild( overlay );

    overlay.addEventListener( "click", () =>
    {
        overlay.style.display = "none";
        body.style.overflow = "visible";
    } );

    document.querySelectorAll( "[data-skill-id]" ).forEach( skill =>
    {
        skill.addEventListener( "click", () =>
        {
            const skillId = skill.getAttribute( "data-skill-id" );
            const skillName = skill.textContent;

            overlay.innerHTML = `
                <div class="skillname">
                    <span class="h1">${ skillName }</span>
                    <p>${ document.getElementById( skillId ).innerHTML }</p>
                </div>
            `;
            overlay.style.display = "flex";
            body.style.overflow = "hidden";
        } );
    } );
}


window.onscroll = function()
{
    window.onscroll = function()
    {
        scrollFunction()
    };
};

function toggleScroll( burgerMenu )
{
    if( burgerMenu.classList.contains( 'opened' ) )
    {
        document.body.classList.add( 'no-scroll' ); // Stop scrolling
    }
    else
    {
        document.body.classList.remove( 'no-scroll' ); // Allow scrolling
    }
}

function toggleBurgerMenu()
{
    const burgerMenu = document.querySelector( '.burger-menu' );
    burgerMenu.classList.toggle( 'opened' );
    toggleScroll( burgerMenu );
}


function topFunction()
{
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function scrollFunction()
{
    let mybutton = document.getElementById( "toTop" );
    if( document.body.scrollTop > 20 || document.documentElement.scrollTop > 20 )
    {
        mybutton.classList.remove( "hidden" );
    }
    else
    {
        mybutton.classList.add( "hidden" );
    }
}
