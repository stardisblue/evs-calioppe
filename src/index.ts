import forEach from 'lodash/forEach'
import { filter, map, flatMap, includes, debounce, deburr, intersection, split } from 'lodash'
import chansonTemplate from './chansonTemplate';


function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

interface Chanson {
    title: string
    name: string
    date?: string
    path?: string
    extname?: string
    slug?: string
}

// ready(function () {
const chansons: Chanson[] = window.chansons || []
const $main = document.getElementById('main');
const $navigation = document.querySelector('nav ul');
const $sidebar = document.getElementById('sidebar');
const $hamburger = document.getElementById('hamburger');
const $footer = document.getElementById('footer');

(function buildMenu(chansons) {

    // console.log(chansons)
    forEach(chansons, (chanson) => {
        const $li = document.createElement('li')
        $li.classList.add('cf', 'mv2')
        $li.id = 'nav--' + chanson.slug

        const $url = document.createElement('a')
        $url.classList.add('fl')
        $url.href = "#" + chanson.slug
        $url.innerHTML = chanson.title + (chanson.author ? ' (' + chanson.author + ')' : '')
        $li.appendChild($url)
        $navigation.appendChild($li)
    })

    $footer.appendChild(createFooter(1))
    $footer.appendChild(createFooter(2))
})(chansons);

(function buildChanson(chansons) {
    const pages = [];

    let pageNumber = 3 // we begin at 2 because of titlePage
    forEach(chansons, (chanson) => {
        // console.log(chanson.title);
        const $chanson = chansonTemplate(chanson);

        $main.appendChild($chanson);
    });

    // ---
    // Adding pageNumber to title
    // ---
    const $menu = $navigation.getElementsByTagName('li')

    forEach($menu, ($li, i) => {
        const $p = document.createElement('i')
        $p.classList.add('fr', 'print')
        $p.innerHTML = pages[i]
        $li.appendChild($p)
    })
})(chansons);

(function search(chansons) {
    const $noResults = document.getElementById('nav-no-results')

    const $parents = {}
    const $toc = {}

    forEach(chansons, (c) => {
        $parents[c.slug] = document.getElementById('parent--' + c.slug)
        $toc[c.slug] = document.getElementById('nav--' + c.slug)
    })

    const inverted: { [key: string]: string[] } = {}
    forEach(chansons, (chanson) => {
        const tokens: string[] = tokenize(chanson.title)
        tokens.push(...tokenize(chanson.author))
        forEach(tokens, (t) => {
            ; (inverted[t] || (inverted[t] = [])).push(chanson.slug)
        })
    })

    const searchable = map(inverted, (value, key) => ({ token: key, match: value }))

    function tokenize(input) {
        return filter(split(deburr(input).toLocaleLowerCase(), /[^a-z0-9]+/), (t) => t.length >= 2)
    }

    function filterDisplay() {
        const tokens = tokenize(this.value)
        if (tokens.length === 0) {
            resetSearch();
            return
        }

        let results

        forEach(tokens, (t) => {
            const filtered = flatMap(
                filter(searchable, (s) => includes(s.token, t)), 'match')

            if (filtered.length === 0) {
                results = []
                return false
            }
            if (results === undefined) {
                results = filtered
                return
            }

            results = intersection(results, filtered)
        })

        if (results.length === 0) {
            $noResults.classList.remove('dn')
        } else {
            $noResults.classList.add('dn')
        }

        const displayable: { [key: string]: boolean } = {}
        forEach(chansons, (c) => { displayable[c.slug] = false })
        forEach(results, (r) => { displayable[r] = true })

        forEach(displayable, (display, id) => {
            const $section = $parents[id].classList
            const $item = $toc[id].classList
            if (display) {
                $section.remove('dn')
                $item.remove('dn')
            } else {
                $section.add('dn')
                $item.add('dn')
            }
        })
    }

    function resetSearch() {
        forEach(chansons, (c) => {
            $parents[c.slug].classList.remove('dn');
            $toc[c.slug].classList.remove('dn');
        });
        $noResults.classList.add('dn');
    }

    const $searchInput = document.getElementById('searchbar') as HTMLInputElement
    const $cleanSearch = document.getElementById('clean-search')
    $cleanSearch.addEventListener('click', (event) => {
        event.preventDefault()
        $searchInput.value = ''
        resetSearch()
    })
    $searchInput.addEventListener('keydown', debounce(filterDisplay, 300));

    $searchInput.addEventListener('focus', (event) => {
        event.preventDefault();
        $sidebar.classList.remove('transform-off')
        $hamburger.style.transform = 'rotate(90deg)'
    })

    // $searchInput.addEventListener('blur', (event) => {
    //     console.log(event)
    //     $hamburger.style.transform = ''
    //     $sidebar.classList.add('transform-off')
    // })
})(chansons);

/* - helper functions - */
function createContainerElement(): HTMLDivElement {
    const $container = document.createElement('div');
    $container.classList.add('page', 'cf', 'ph2-ns', 'pb15-ns', 'pb0-p', 'bb-ns-nl', 'b--gray')
    return $container
}

function createCellElement(cols): HTMLDivElement {
    const $cell = document.createElement('div')
    const percentage = cols !== 3 ? 100 / cols : 'third'
    $cell.classList.add('fl', 'w-100', 'w-' + percentage + '-ns', 'w-' + percentage + '-p', 'ph1')
    return $cell
}

function createFooter(page: number): HTMLDivElement {
    const $div = document.createElement('div')
    $div.classList.add('footer')
    $div.innerHTML = '' + page
    $div.style.bottom = (((page - 1) * -27.2) + 0.01) + 'cm'
    return $div
}

// console.log(pages)

// })


//javascript file

// slidable sidebar
$hamburger.addEventListener('click', clickHamburger)

$main.addEventListener('click', outsideClick)
document.getElementById('header').addEventListener('click', outsideClick)

function clickHamburger(event) {
    event.preventDefault();

    $sidebar.classList.toggle('transform-off')
    $hamburger.style.transform = $hamburger.style.transform ? '' : 'rotate(90deg)'
}

function outsideClick(event) {
    $hamburger.style.transform = ''
    $sidebar.classList.add('transform-off')
}