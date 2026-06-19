import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { absoluteUrl } from '../../seo/siteMetadata';
import { I18nLink } from '../../i18n/I18nLink';

/**
 * Functional Pagination component with crawlable links
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} maxVisiblePages - Maximum visible page numbers (default: 5)
 */
const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, maxVisiblePages = 5 }) => {
    const location = useLocation();
    const { t } = useTranslation('common');
    const [jumpValue, setJumpValue] = useState('');

    // Generate page URL with ?page=N query param
    const getPageUrl = (page) => {
        const params = new URLSearchParams(location.search);
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', page.toString());
        }
        const qs = params.toString();
        return `${location.pathname}${qs ? `?${qs}` : ''}`;
    };

    // Compute prev/next URLs for SEO
    const prevLink = currentPage > 1 ? absoluteUrl(getPageUrl(currentPage - 1)) : null;
    const nextLink = currentPage < totalPages ? absoluteUrl(getPageUrl(currentPage + 1)) : null;

    // Generate page numbers to display
    const pageNumbers = useMemo(() => {
        const pages = [];

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, currentPage - halfVisible);
            let endPage = Math.min(totalPages, currentPage + halfVisible);

            if (currentPage <= halfVisible) {
                endPage = maxVisiblePages;
            }

            if (currentPage > totalPages - halfVisible) {
                startPage = totalPages - maxVisiblePages + 1;
            }

            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('ellipsis-start');
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push('ellipsis-end');
                }
                if (!pages.includes(totalPages)) {
                    pages.push(totalPages);
                }
            }
        }

        return pages;
    }, [currentPage, totalPages, maxVisiblePages]);

    // Don't render if there's only one page or no pages
    if (totalPages <= 1) {
        return null;
    }

    const handlePageClick = (e, page) => {
        if (page !== currentPage && onPageChange) {
            onPageChange(page);
        }
    };

    // UX FIX (audit 5.6): "jump to page" input for large result sets.
    const handleJumpToPage = (e) => {
        e.preventDefault();
        const page = parseInt(jumpValue, 10);
        if (
            Number.isInteger(page) &&
            page >= 1 &&
            page <= totalPages &&
            page !== currentPage &&
            onPageChange
        ) {
            onPageChange(page);
        }
        setJumpValue('');
    };

    return (
        <>
            {/* SEO: rel prev/next for pagination */}
            {prevLink && <link rel="prev" href={prevLink} />}
            {nextLink && <link rel="next" href={nextLink} />}
            <nav aria-label={t('pagination.navAriaLabel')} className="mt-4">
            <ul className="pagination common-pagination justify-content-center">
                {/* Previous Button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    {currentPage > 1 ? (
                        <I18nLink
                            className="page-link"
                            to={getPageUrl(currentPage - 1)}
                            onClick={(e) => handlePageClick(e, currentPage - 1)}
                            aria-label={t('pagination.previousPage')}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </I18nLink>
                    ) : (
                        <span className="page-link" aria-label={t('pagination.previousPage')} aria-disabled="true">
                            <i className="fas fa-chevron-left"></i>
                        </span>
                    )}
                </li>

                {/* Page Numbers */}
                {pageNumbers.map((page) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                            <li key={page} className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        );
                    }

                    const isActive = currentPage === page;
                    return (
                        <li
                            key={page}
                            className={`page-item ${isActive ? 'active' : ''}`}
                        >
                            <I18nLink
                                className="page-link"
                                to={getPageUrl(page)}
                                onClick={(e) => handlePageClick(e, page)}
                                aria-label={t('pagination.pageAriaLabel', { page })}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {page}
                            </I18nLink>
                        </li>
                    );
                })}

                {/* Next Button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    {currentPage < totalPages ? (
                        <I18nLink
                            className="page-link"
                            to={getPageUrl(currentPage + 1)}
                            onClick={(e) => handlePageClick(e, currentPage + 1)}
                            aria-label={t('pagination.nextPage')}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </I18nLink>
                    ) : (
                        <span className="page-link" aria-label={t('pagination.nextPage')} aria-disabled="true">
                            <i className="fas fa-chevron-right"></i>
                        </span>
                    )}
                </li>
            </ul>

            {/* UX FIX (audit 5.6): jump-to-page input for large result sets */}
            {totalPages > maxVisiblePages && (
                <form className="pagination-jump mt-3 d-flex align-items-center justify-content-center gap-2" onSubmit={handleJumpToPage}>
                    <label className="text-muted small mb-0" htmlFor="pagination-jump-input">
                        {t('pagination.jumpToLabel')}
                    </label>
                    <input
                        id="pagination-jump-input"
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: '80px' }}
                        min="1"
                        max={totalPages}
                        value={jumpValue}
                        onChange={(e) => setJumpValue(e.target.value)}
                        aria-label={t('pagination.jumpToAriaLabel')}
                        placeholder={String(currentPage)}
                    />
                    <button type="submit" className="btn btn-outline-main btn-sm">
                        {t('pagination.jumpToBtn')}
                    </button>
                </form>
            )}
        </nav>
        </>
    );
};

export default Pagination;
