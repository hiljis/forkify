import View from './View.js';
// import icons from '../img/icons.svg'; // Parcel 1
import icons from 'url:../../img/icons.svg'; // Parcel 2

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler) {
        this._parentElement.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn--inline');
            if (!btn) return;

            const goToPage = Number(btn.dataset.goto);
            handler(goToPage);
        });
    };

    _generateMarkup() {
        const currPage = this._data.currentPage;
        const numPages = this._data.numPages;

        // Page 1, and there are other pages
        if (currPage === 1 && numPages > 1) {
            return `${this._generateMarkupButtonNext(currPage)}`;
        }

        // Last page
        if (currPage === numPages && numPages > 1) {
            return `${this._generateMarkupButtonPrev(currPage)}`;
        }

        // Other page
        if (currPage > 1 && currPage < numPages) {
            return `${this._generateMarkupButtonPrev(currPage)}${this._generateMarkupButtonNext(currPage)}`;
        }

        // Page 1, and there are NO other pages
        return ``;
    };

    _generateMarkupButtonPrev(currPage) {
        return `
            <button class="btn--inline pagination__btn--prev" data-goto="${currPage - 1}">
                <svg class="search__icon">
                    <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${currPage - 1}</span>
            </button>
        `;
    };

    _generateMarkupButtonNext(currPage) {
        return `
            <button class="btn--inline pagination__btn--next" data-goto="${currPage + 1}">
                <span>Page ${currPage + 1}</span>
                <svg class="search__icon">
                    <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
        `;
    };
}

export default new PaginationView();