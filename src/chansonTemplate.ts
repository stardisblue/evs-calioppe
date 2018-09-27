
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

    const section = document.createElement('section')
    section.classList.add('ph2', 'mv2', 'w-50-ns', 'w-100', 'flex', 'items-center')
    section.id = slug

    const $date = document.createElement('div')
    $date.classList.add('code', 'mr0', 'rotate-270', 'b')
    $date.innerHTML = years.join('<br/>')
    section.appendChild($date)



    const $contPDF = document.createElement('div')
    $contPDF.classList.add('b--light-blue', 'bl', 'pl2', "bw1", 'self-stretch', 'flex', 'items-center')

    const pdfIcon = document.createElement('a')
    pdfIcon.classList.add('link', 'dark-blue', 'far', 'fa-file-pdf', 'mr2', 'f2')
    pdfIcon.href = path.slice(1)
    pdfIcon.title = 'Télécharger'
    pdfIcon.download = ''

    $contPDF.appendChild(pdfIcon)
    section.appendChild($contPDF)

    const $cont = document.createElement('div')
    $cont.classList.add('flex', 'flex-column', 'flex-auto', 'self-stretch', 'justify-between')

    const $h2 = document.createElement('p')
    $h2.classList.add('f4', 'mb3', 'mv0', 'anchor')
    $h2.innerHTML = (evs ? '<small class="br-pill bw1 mr2 pv1 ph2 bg-green b">EVS</small>' : '') + title
    $h2.id = 't--' + slug

    const p = document.createElement('p')
    p.classList.add('f6', 'i', 'mb0', 'tr')

    $cont.appendChild($h2)
    $cont.appendChild(p)
    section.appendChild($cont)

    const permalien = document.createElement('a')
    permalien.classList.add('link', 'blue', 'dim', 'mr2')
    permalien.href = '#t--' + slug
    permalien.innerHTML = '<i class="fas fa-link"></i>'
    p.appendChild(permalien)

    if (date) {
        const dateSpan = document.createElement('em')
        dateSpan.classList.add('date')
        dateSpan.innerHTML = 'ajouté le ' + moment(date).format('LLL') + '. '
        p.appendChild(dateSpan)
    }

    return section
}