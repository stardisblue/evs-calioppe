
import moment from 'moment'
import 'moment/locale/fr';

moment.locale('fr')
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

export default function (chanson: CleanedFileMeta) {
    const { title, date, path, slug, years, evs } = chanson

    const $article = document.createElement('article')
    $article.classList.add('ph2', 'mv2', 'w-50-ns', 'w-100', 'flex', 'items-center')
    $article.id = 'a--' + slug

    const anchor = document.createElement('i')
    anchor.classList.add('anchor', 'self-start')
    anchor.id = slug
    $article.appendChild(anchor)

    const $date = document.createElement('div')
    $date.classList.add('code', 'mr0', 'rotate-270', 'b')
    $date.innerHTML = years.join('<br/>')
    $article.appendChild($date)

    const $contPDF = document.createElement('a')
    $contPDF.classList.add('b--light-blue', 'bl', 'pl2', "bw1", 'self-stretch', 'flex', 'flex-column', 'items-center', 'justify-center', 'link', 'dark-blue', 'dim')
    $contPDF.href = path.slice(1)
    $contPDF.title = 'Télécharger'
    $contPDF.download = 'Télécharger'

    const pdfIcon = document.createElement('span')
    pdfIcon.classList.add('far', 'fa-file-pdf', 'mr2', 'f1', 'f2-m')

    const download = document.createElement('p')
    download.classList.add('mt2', 'f6', 'f7-m')
    download.innerHTML = 'Télécharger'

    $contPDF.appendChild(pdfIcon)
    $contPDF.appendChild(download)
    $article.appendChild($contPDF)

    const $cont = document.createElement('div')
    $cont.classList.add('flex', 'flex-column', 'flex-auto', 'self-stretch', 'justify-between')

    const $h2 = document.createElement('a')
    $h2.href = path.slice(1)
    $h2.title = 'Télécharger'
    $h2.classList.add('f4', 'f5-m', 'mb3', 'mv0', 'link', 'black', 'dim')
    $h2.innerHTML = (evs ? '<small class="br-pill bw1 mr2 pv1 ph2 bg-green b">EVS</small>' : '') + title
    $h2.id = 't--' + slug
    $h2.download = ''

    const p = document.createElement('p')
    p.classList.add('f6', 'f7-m', 'i', 'mb0', 'tr')

    $cont.appendChild($h2)
    $cont.appendChild(p)
    $article.appendChild($cont)

    const permalien = document.createElement('a')
    permalien.classList.add('link', 'blue', 'dim', 'mr2')
    permalien.href = '#' + slug
    permalien.innerHTML = '<i class="fas fa-link"></i>'
    p.appendChild(permalien)

    if (date) {
        const dateSpan = document.createElement('em')
        dateSpan.classList.add('date')
        dateSpan.innerHTML = 'ajouté le ' + moment(date).format('LLL') + '. '
        p.appendChild(dateSpan)
    }

    return $article
}