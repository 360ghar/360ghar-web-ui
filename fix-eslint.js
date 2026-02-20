import fs from 'fs';

const replacements = [
    { file: 'src/common/CustomRangeSlider.jsx', search: 'import React, { useCallback, useEffect, useState, useRef } from "react";', replace: 'import { useCallback, useEffect, useState, useRef } from "react";' },
    { file: 'src/common/Header.jsx', search: 'const Header = ({ headerClass, leftMenu, rightMenu, logoBlack, logoWhite, headerLogo, headerMenusClass, btnClass, btnLink, btnText, spanClass, showContactNumber = true, ...otherProps }) => {', replace: 'const Header = ({ headerClass, leftMenu, rightMenu, logoBlack, logoWhite, headerLogo, headerMenusClass, btnLink, btnText, spanClass, showContactNumber = true }) => {' },
    { file: 'src/common/LazyToast.jsx', search: 'export const LazyToastContainer = () =>', replace: '// eslint-disable-next-line react-refresh/only-export-components\nexport const LazyToastContainer = () =>' },
    { file: 'src/common/MobileMenu.jsx', search: 'import { Link, useLocation } from "react-router-dom";\nimport Button from "../components/ui/Button";', replace: 'import { Link, useLocation } from "react-router-dom";' },
    { file: 'src/common/Pagination.jsx', search: '          {getPageNumbers().map((pageNumber, index) => (', replace: '          {getPageNumbers().map((pageNumber) => (' },
    { file: 'src/common/SEO.jsx', search: 'export const absoluteUrl = (path) => {', replace: '// eslint-disable-next-line react-refresh/only-export-components\nexport const absoluteUrl = (path) => {' },
    { file: 'src/common/SearchSidebar.jsx', search: 'import React, { useState } from \'react\'', replace: 'import React from \'react\'' },
    { file: 'src/common/SimplifiedFilter.jsx', search: '  const [filtersChanged, setFiltersChanged] = useState(false);', replace: '  const [, setFiltersChanged] = useState(false);' },
    { file: 'src/components/account/AccountPaymentTab.jsx', search: '  const [quantities, setQuantities] = useState({\n    classic: 0,\n    premium: 0\n  });', replace: '  const [quantities] = useState({\n    classic: 0,\n    premium: 0\n  });' },
    { file: 'src/components/account/AccountProfileTab.jsx', search: 'const AccountProfileTab = () => {\n  const [showPassword, setShowPassword] = useState(false);', replace: 'const AccountProfileTab = () => {' },
    { file: 'src/components/design/DesignGallery.jsx', search: 'export const GALLERY_IMAGES = [', replace: '// eslint-disable-next-line react-refresh/only-export-components\nexport const GALLERY_IMAGES = [' },
    { file: 'src/components/design/DesignLoadingState.jsx', search: 'export const LOADING_STEPS = [', replace: '// eslint-disable-next-line react-refresh/only-export-components\nexport const LOADING_STEPS = [' },
    { file: 'src/components/design/RoomTypeSelector.jsx', search: 'export const ROOM_TYPES = [', replace: '// eslint-disable-next-line react-refresh/only-export-components\nexport const ROOM_TYPES = [' },
    { file: 'src/components/design/StylePresetSelector.jsx', search: 'export const STYLE_PRESETS = [', replace: '// eslint-disable-next-line react-refresh/only-export-components\nexport const STYLE_PRESETS = [' },
    { file: 'src/components/forms/ValidationForm.jsx', search: 'import { toast, ToastContainer } from \'react-toastify\';', replace: 'import { toast } from \'react-toastify\';' },
    { file: 'src/components/layout/Message.jsx', search: 'import { toast } from \'react-toastify\';', replace: '' },
    { file: 'src/components/property-filters/PropertyFilters.jsx', search: 'import React, { useState, useEffect } from \'react\';\nimport { useNavigate, useLocation } from \'react-router-dom\';', replace: 'import { useState, useEffect } from \'react\';\nimport { useNavigate } from \'react-router-dom\';' },
    { file: 'src/components/property-filters/PropertyFilters.jsx', search: '  const location = useLocation();', replace: '' },
    { file: 'src/components/property/PropertyItem.jsx', search: '  const { id, title, defaultOgImage, location, price, type, amenities, beds, baths, sqft, desc } = item;', replace: '  const { id, title, defaultOgImage, location, price, type, amenities, beds, baths, sqft } = item;' },
    { file: 'src/components/property/PropertyPageSection.jsx', search: '  const handlePageChange = (url) => {', replace: '  const handlePageChange = () => {' },
    { file: 'src/components/ui/CounterItem.jsx', search: 'import React, { useState } from \'react\';', replace: 'import React from \'react\';' },
    { file: 'src/components/vastu/FloorPlanSummary.jsx', search: '  const { check_results, overall_score, total_checks, passed_checks, rooms, bathrooms, balconies } = results;', replace: '  const { check_results, overall_score, total_checks, passed_checks, rooms, bathrooms } = results;' },
    { file: 'src/pages/blogs/BlogDetails.jsx', search: '    const { title } = useParams();', replace: '    useParams();' },
    { file: 'src/store/visitStore.js', search: 'export const useVisitStore = create((set, get) => ({', replace: 'export const useVisitStore = create((set) => ({' },
];

for (const { file, search, replace } of replacements) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes(search)) {
            content = content.replace(search, replace);
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed ${file}`);
        } else {
            console.log(`Search string not found in ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
}
