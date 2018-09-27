import _ from 'lodash'
import chansonTemplate from './chansonTemplate';


function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

interface FileMeta {
    title: string
    name: string
    date?: string
    path?: string
    extname?: string
    slug?: string
}

interface CleanedFileMeta extends FileMeta {
    years: string[]
    month?: string
    keywords: string[]
    evs?: string
}

// ready(function () {
const files: CleanedFileMeta[][] = (function (raws: FileMeta[]) {
    return _.groupBy(_.sortBy(_.map(raws, cleanData), (f) => f.title.toLocaleLowerCase()), (f) => _.first(f.years))

    function cleanData(r: FileMeta) {
        const keywords = tokenize(r.title);
        const clean: CleanedFileMeta = {
            title: r.title,
            name: r.name,
            date: r.date,
            path: r.path,
            extname: r.extname,
            slug: r.slug,
            years: [],
            keywords: keywords,
            evs: 'evs'
        };
        let datesExtracted = false;
        let evsCheck = false;
        _.forEach(keywords, (str, index) => {
            if (!datesExtracted) {
                if (!isNaN(+str)) {
                    const num = +str;
                    if (num / 1000 >= 1)
                        clean.years.push('' + num);
                    else
                        clean.month = '' + str;
                    return;
                }
                else
                    datesExtracted = true;
            }
            if (!evsCheck) {
                clean.evs = (str === clean.evs) ? clean.evs : '';
                evsCheck = true;
            }
        });
        clean.years.sort().reverse();
        _.forEach([...clean.years, clean.month, clean.evs], (r) => {
            if (!r)
                return;
            clean.title = clean.title.replace(r, '');
        });
        clean.title = clean.title.trim();
        clean.name =
            ('(' +
                (clean.month ? clean.month + '-' : '') +
                clean.years.join(', ') + ') ') + clean.title +
            (clean.evs ? ` [${clean.evs.toLocaleUpperCase()}]` : '');
        return clean;
    }
})(window.files || [])

console.log(files)

const $main = document.getElementById('main');
const $navigation = document.querySelector('nav ul');
const $sidebar = document.getElementById('sidebar');
const $hamburger = document.getElementById('hamburger');

(function buildMenu(files, $navigation) {
    // console.log(files)
    _.forEachRight(files, (yearFiles, year) => {
        const $li = document.createElement('li')
        $li.classList.add('mv2', 'b', 'underline')
        $li.innerHTML = '' + year
        $navigation.appendChild($li)
        _.forEach(yearFiles, (file) => {
            const $li = document.createElement('li')
            $li.classList.add('mv2')
            $li.id = 'nav--' + file.slug

            const $url = document.createElement('a')
            $url.classList.add('link')
            $url.href = "#" + file.slug
            $url.innerHTML = file.name

            $li.appendChild($url)
            $navigation.appendChild($li)
        })
    })
})(files, $navigation);

(function buildChanson(files, $main) {
    _.forEachRight(files, (files, year) => {
        const $cont = document.createElement('div')
        $cont.classList.add('w-100', 'pl3')

        const $year = document.createElement('p')
        $year.classList.add('w-100', 'f2', 'code', 'mv2', 'pl1', 'bb', 'b--light-blue', 'bw1')
        $year.innerHTML = '' + year
        $cont.appendChild($year)
        $main.appendChild($cont)
        _.forEach(files, (file) => {
            // console.log(chanson.title);
            $main.appendChild(chansonTemplate(file));
        })
    });
})(files, $main);

(function search(files, $sidebar, $hamburger) {
    const $noResults = document.getElementById('nav-no-results')

    const $parents: { [key: string]: HTMLElement } = {}
    const $toc: { [key: string]: HTMLElement } = {}

    _.forEach(files, (c) => {
        $parents[c.slug] = document.getElementById('a--' + c.slug)
        $toc[c.slug] = document.getElementById('nav--' + c.slug)
    })

    const inverted: { [key: string]: string[] } = {}
    _.forEach(files, (file) => {
        _.forEach(file.keywords, (t) => {
            ; (inverted[t] || (inverted[t] = [])).push(file.slug)
        })
    })

    const searchable = _.map(inverted, (value, key) => ({ token: key, match: value }))

    function filterDisplay() {
        const tokens = tokenize(this.value)
        if (tokens.length === 0) {
            resetSearch();
            return
        }

        let results

        _.forEach(tokens, (t) => {
            const filtered = _.flatMap(
                _.filter(searchable, (s) => _.includes(s.token, t)), 'match')

            if (filtered.length === 0) {
                results = []
                return false
            }
            if (results === undefined) {
                results = filtered
                return
            }

            results = _.intersection(results, filtered)
        })

        if (results.length === 0) {
            $noResults.classList.remove('dn')
        } else {
            $noResults.classList.add('dn')
        }

        const displayable: { [key: string]: boolean } = {}
        _.forEach(files, (c) => { displayable[c.slug] = false })
        _.forEach(results, (r) => { displayable[r] = true })

        _.forEach(displayable, (display, id) => {
            const $section = $parents[id].classList
            const $item = $toc[id].classList
            if (display) {
                $section.replace('dn', 'flex')
                $item.remove('dn')
            } else {
                $section.replace('flex', 'dn')
                $item.add('dn')
            }
        })
    }

    function resetSearch() {
        _.forEach(files, (c) => {
            $parents[c.slug].classList.replace('dn', 'flex');
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
    $searchInput.addEventListener('keydown', _.debounce(filterDisplay, 300));

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
})(files, $sidebar, $hamburger);



/* - helper functions - */
function createFooter(page: number): HTMLDivElement {
    const $div = document.createElement('div')
    $div.classList.add('footer')
    $div.innerHTML = '' + page
    $div.style.bottom = (((page - 1) * -27.2) + 0.01) + 'cm'
    return $div
}

function tokenize(input) {
    return _.filter(_.split(_.deburr(input).toLocaleLowerCase(), /[^\w]+/), (t) => t.length >= 2)
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