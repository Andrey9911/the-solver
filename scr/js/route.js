document.querySelector('a').addEventListener('click', e => {
    e.preventDefault();
    console.log(e.target.href);
    route(e.target.href)

    
})

const routers = {
    '/': 'index.html',
    '/decision': 'src/html/solver.html',
    '/balance': 'src/html/balance.html'
}
function route(p)
{
   window.history.pushState({}, '', p)
//    console.log();
    includePattern();
}
async function includePattern()
{
    let path = window.location.pathname;
    let content = await fetch(routers[path]).then(data => data.text());
    document.querySelector('.container').innerHTML = content;
}