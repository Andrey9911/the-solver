document.querySelector('a').addEventListener('click', e => {
    e.preventDefault();
    console.log(e.target.href);
    route(e.target.href)
})
const __dirname = import.meta.dirname;

const routers = {
    '/': 'index.html',
    '/decision': 'scr/html/solver.html',
    '/balance': 'scr/html/balance.html'
}
export function route(path)
{
   window.history.pushState({}, '', path)
//    console.log();
    includePattern();
}
async function includePattern()
{
    let path = window.location.pathname;
    let content = await fetch(__dirname + "/" + routers[path]).then(data => data.status);
    return content;
}