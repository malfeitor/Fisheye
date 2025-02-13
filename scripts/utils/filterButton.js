export class FilterButton {
  constructor (container, medias, mediaContainer) {
    this._container = container
    this._filters = new Map()
    this._filters.set('popularity', this._container.querySelector('#filter-popularity'))
    this._filters.set('date', this._container.querySelector('#filter-date'))
    this._filters.set('title', this._container.querySelector('#filter-title'))
    this._mediaContainer = mediaContainer
    this._medias = medias
    this._expanded = true
  }

  init () {
    this._filters.forEach((elem, name) => {
      elem.addEventListener('click', () => this.filter(name))
      elem.addEventListener('focus', () =>
        this._container.setAttribute('aria-activedescendant', elem.id))
    })
    document.addEventListener('keydown', e => {
      const index = [...this._filters.values()].indexOf(document.activeElement)
      if (index !== -1) {
        switch (e.key) {
          case 'ArrowDown':
            if (!this._expanded) {
              e.preventDefault()
              this.expand()
            } else if (index < this._filters.size - 1) {
              e.preventDefault()
              const curr = [...this._filters.values()][index + 1]
              curr.focus()
            }
            break
          case 'ArrowUp':
            if (!this._expanded) {
              e.preventDefault()
              this.expand()
            } else if (index > 0) {
              e.preventDefault()
              const curr = [...this._filters.values()][index - 1]
              curr.focus()
            }
            break
        }
      }
    }, false)
    // does a filter with the first filter
    return this.filter(this._filters.keys().next().value)
  }

  expand () {
    this._container.setAttribute('aria-expanded', true)
    this._container.setAttribute('aria-activedescendant',
      this._container.querySelector(':focus').id)
    this.showExpandedChevron()
    this._filters.forEach(element => {
      element.style.display = 'inline-flex'
    })
    this._container.classList.add('active')
    this._expanded = true
  }

  showExpandedChevron () {
    this._container.querySelector('.fa-chevron-up').classList.remove('fa-chevron-up')
    this._filters.values().next().value.querySelector('.fa-solid')
      .classList.add('fa-chevron-down')
  }

  shrink (order) {
    this._container.classList.remove('active')
    this._expanded = false
    this._container.setAttribute('aria-expanded', false)
    // foreach because can be empty
    this._container.querySelectorAll('.fa-chevron-down')
      .forEach(icon => icon.classList.remove('fa-chevron-down'))
    this._filters.forEach((filter, key) => {
      if (key !== order) {
        filter.style.display = 'none'
      } else {
        filter.querySelector('.fa-solid').classList.add('fa-chevron-up')
      }
    })
    this._container.removeAttribute('aria-activedescendant')
  }

  refreshMediaLinks () {
    for (let i = 0; i < this._medias.length; i++) {
      if (i === 0) {
        this._medias[i].previous = this._medias[this._medias.length - 1]
        this._medias[i].next = this._medias[i + 1]
      } else if (i === this._medias.length - 1) {
        this._medias[i].previous = this._medias[i - 1]
        this._medias[i].next = this._medias[0]
      } else {
        this._medias[i].previous = this._medias[i - 1]
        this._medias[i].next = this._medias[i + 1]
      }
    }
  }

  filter (order) {
    if (!this._expanded) {
      this.expand()
    } else {
      switch (order) {
        case 'popularity':
          this._medias.sort((a, b) => b.likes - a.likes)
          break
        case 'date':
          this._medias.sort((a, b) => {
            return Date.parse(a.date) - Date.parse(b.date)
          })
          break
        case 'title':
          this._medias.sort((a, b) => {
            if (a.title < b.title) return -1
            else if (a.title > b.title) return 1
            else return 0
          })
          break
        default:
          throw new Error('Unknow order')
      }
      this.shrink(order)
      this.refreshMediaLinks()
      // delete wrapper's DOM media
      while (this._mediaContainer.firstChild) {
        this._mediaContainer.removeChild(this._mediaContainer.firstChild)
      }
      this._medias.forEach(media =>
        this._mediaContainer.appendChild(media.getMediaCardDOM()))
    }
    return this._medias
  }
}
