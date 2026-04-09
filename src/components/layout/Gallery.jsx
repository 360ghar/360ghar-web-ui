import { galleries } from '../../data/HomeTwoData';
import { I18nLink } from '../../i18n/I18nLink';
import SectionHeading from '../../common/ui/SectionHeading';

import LazyImage from '../../common/ui/LazyImage';
const Gallery = () => {
    
    return (
        <section className="gallery-section padding-y-60">
            <div className="container container-two">
                
                <SectionHeading
                    headingClass=""  
                    subtitle="Our Gallery"
                    subtitleClass="" 
                    title="Unlocking the door to your a the new home" 
                    renderDesc={false}
                    desc=""
                    renderButton={false}
                    buttonClass="btn-main"
                    buttonText="View More"
                />

                <div className="row gy-4">
                    {
                        galleries.map((gallery, galleryIndex) => {
                            return (            
                                <div className={` ${galleryIndex === 1 || galleryIndex === 2 ? 'col-lg-8 col-sm-7 col-xs-6' : 'col-lg-4 col-sm-5 col-xs-6'}`} key={galleryIndex}>
                                    <div className="gallery-thumb">
                                        <LazyImage src={gallery.image} alt={gallery.title || 'Gallery image'} className="cover-img" width={400} height={300}/>
                                        <I18nLink to={gallery.image} className="gallery-thumb__link gallery-popup">
                                            {gallery.icon}
                                        </I18nLink>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </section>
    );
};

export default Gallery;






// import React, { useState } from 'react';
// import SectionHeading from '../../common/ui/SectionHeading';
// import Lightbox from "react-image-lightbox";

// const Gallery = () => {

//     const [photoIndex, setPhotoIndex] = useState(0);
//     const [isOpen, setIsOpen] = useState(false);
//     const images = [
//       {
//         image: "01",
//         bigImage: "/assets/images/thumbs/gallery1.png",
//         category: "Web Design",
//         title: "Design is a creative part",
//       },
//       {
//         image: "02",
//         bigImage: "/assets/images/thumbs/gallery2.png",
//         category: "Mobile App",
//         title: "The service provide for designer",
//       },
//       {
//         image: "03",
//         bigImage: "/assets/images/thumbs/gallery3.png",
//         category: "Web Design",
//         title: "Mobile App landing Design",
//       },
//       {
//         image: "04",
//         bigImage: "/assets/images/thumbs/gallery4.png",
//         category: "Mobile App",
//         title: "Logo Design creativity",
//       },
//       {
//         image: "05",
//         bigImage: "/assets/images/thumbs/gallery5.png",
//         category: "Web Design",
//         title: "T-shirt design is the part of design",
//       },
//       {
//         image: "06",
//         bigImage: "/assets/images/thumbs/gallery6.png",
//         category: "Logo Design",
//         title: "Getting tickets to the big show",
//       },
//     ];
    
//     return (
//         <section className="gallery-section padding-y-60">
//             <div className="container container-two">
                
//                 <SectionHeading
//                     headingClass=""  
//                     subtitle="Our Gallery"
//                     subtitleClass="" 
//                     title="Unlocking the door to your a the new home" 
//                     renderDesc={false}
//                     desc=""
//                     renderButton={false}
//                     buttonClass="btn-main"
//                     buttonText="View More"
//                 />

//                 <div className="row gy-4">
//                     <div className="position">
//                         {images.map((e, index) => (
//                         <div className="imgFile">
//                             {isOpen && (
//                             <Lightbox
//                                 mainSrc={images[photoIndex].bigImage}
//                                 nextSrc={images[(photoIndex + 1) % images.length]}
//                                 prevSrc={
//                                 images[(photoIndex + images.length - 1) % images.length]
//                                 }
//                                 onCloseRequest={() => {
//                                 setIsOpen(false);
//                                 }}
//                                 onMovePrevRequest={() =>
//                                 setPhotoIndex(
//                                     (photoIndex + images.length - 1) % images.length
//                                 )
//                                 }
//                                 onMoveNextRequest={() =>
//                                 setPhotoIndex((photoIndex + 1) % images.length)
//                                 }
//                             />
//                             )}

//                             <LazyImage
//                             onClick={() => {
//                                 setIsOpen(true);
//                             }}
//                             src={e.bigImage}
//                             alt=""
//                             />
//                         </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Gallery;
