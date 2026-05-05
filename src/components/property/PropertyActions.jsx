 import { useEffect, useRef, useState } from 'react';
 import { toast } from 'react-toastify';
 
 const PropertyActions = ({ property, onLikeToggle, isLiked, likeLoading }) => {
   const [shareOpen, setShareOpen] = useState(false);
   const shareRef = useRef(null);
 
   const propertyUrl = typeof window !== 'undefined' 
     ? `${window.location.origin}/property/${property?.id}` 
     : '';
   const shareText = `Check out this property: ${property?.title || 'Property'} on 360Ghar`;
 
   const copyLink = async () => {
     try {
       await navigator.clipboard.writeText(propertyUrl);
       toast.success('Link copied to clipboard!');
       setShareOpen(false);
     } catch {
       toast.error('Failed to copy link');
     }
   };
 
   const shareWhatsApp = () => {
     const utmUrl = `${propertyUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=property_share`;
     const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + utmUrl)}`;
     window.open(url, '_blank', 'noopener,noreferrer');
     setShareOpen(false);
   };
 
   const shareFacebook = () => {
     const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
     window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
     setShareOpen(false);
   };
 
   const shareTwitter = () => {
     const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`;
     window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
     setShareOpen(false);
   };
 
   const printPage = () => {
     window.print();
   };

   useEffect(() => {
     const handleClickOutside = (event) => {
       if (shareRef.current && !shareRef.current.contains(event.target)) {
         setShareOpen(false);
       }
     };

     const handleEscape = (event) => {
       if (event.key === 'Escape') {
         setShareOpen(false);
       }
     };

     document.addEventListener('mousedown', handleClickOutside);
     document.addEventListener('keydown', handleEscape);

     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
       document.removeEventListener('keydown', handleEscape);
     };
   }, []);
 
   return (
     <div className="property-actions d-flex align-items-center gap-2 flex-wrap">
       <button
         type="button"
         className={`btn btn-sm ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
         onClick={onLikeToggle}
         disabled={likeLoading}
         title={isLiked ? 'Remove from saved' : 'Save property'}
       >
         <i className={`fas fa-heart ${likeLoading ? 'fa-pulse' : ''}`}></i>
         <span className="ms-1 d-none d-sm-inline">{isLiked ? 'Saved' : 'Save'}</span>
       </button>
 
       <div className="dropdown" ref={shareRef}>
         <button
           type="button"
           className="btn btn-sm btn-outline-primary"
           onClick={() => setShareOpen(!shareOpen)}
           title="Share property"
           aria-expanded={shareOpen}
           aria-controls="property-share-menu"
         >
           <i className="fas fa-share-alt"></i>
           <span className="ms-1 d-none d-sm-inline">Share</span>
         </button>
         {shareOpen && (
           <div className="dropdown-menu show share-dropdown" id="property-share-menu" role="menu">
             <button className="dropdown-item" onClick={shareWhatsApp} role="menuitem">
               <i className="fab fa-whatsapp text-success me-2"></i> WhatsApp
             </button>
             <button className="dropdown-item" onClick={shareFacebook} role="menuitem">
               <i className="fab fa-facebook text-primary me-2"></i> Facebook
             </button>
             <button className="dropdown-item" onClick={shareTwitter} role="menuitem">
               <i className="fab fa-twitter text-info me-2"></i> Twitter
             </button>
             <hr className="dropdown-divider" />
             <button className="dropdown-item" onClick={copyLink} role="menuitem">
               <i className="fas fa-link me-2"></i> Copy Link
             </button>
           </div>
         )}
       </div>
 
       <button
         type="button"
         className="btn btn-sm btn-outline-secondary d-none d-md-inline-flex"
         onClick={printPage}
         title="Print property details"
       >
         <i className="fas fa-print"></i>
         <span className="ms-1 d-none d-md-inline">Print</span>
       </button>
     </div>
   );
 };
 
 export default PropertyActions;
