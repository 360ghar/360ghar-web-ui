 import { useMemo, useState } from 'react';
 import Header from '../../common/Header';
 import Footer from '../../common/Footer';
 import MobileMenu from '../../common/MobileMenu';
 import OffCanvas from '../../common/OffCanvas';
 
 import SEO from '../../common/SEO';
 import Cta from '../../components/ui/Cta';
 import { siteMetadata } from '../../seo/siteMetadata';
 import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
 
 const AreaCalculator = () => {
     const [superArea, setSuperArea] = useState(1000);
     const [loading, setLoading] = useState(30);
     const { carpetArea, builtUpArea } = useMemo(() => {
         const calculatedCarpet = superArea * ((100 - loading) / 100);
         const calculatedBuiltUp = calculatedCarpet * 1.15;

         return {
             carpetArea: Math.round(calculatedCarpet),
             builtUpArea: Math.min(Math.round(calculatedBuiltUp), superArea),
         };
     }, [superArea, loading]);
 
     return (
         <>
             <SEO
                title="Carpet Area Calculator India | RERA Super Built-up vs Carpet Area | 360Ghar"
                description="Calculate actual Carpet Area from Super Built-up Area using our RERA-compliant calculator. Understand loading factor and usable space for properties in Gurugram and Delhi NCR."
                keywords="carpet area calculator India, super built up area vs carpet area, RERA area calculator, loading factor calculator, apartment area calculator, flat size calculator, 360ghar tools"
                 canonical="/area-calculator"
                 image={siteMetadata.defaultOgImage}
                 type="website"
                 structuredData={[
                    generateToolSchema(
                        toolSchemas.areaCalculator.name,
                        toolSchemas.areaCalculator.description,
                        toolSchemas.areaCalculator.keywords,
                        toolSchemas.areaCalculator.category
                    ),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                        { name: toolSchemas.areaCalculator.name, url: 'https://360ghar.com/area-calculator' }
                    ])
                 ]}
             />

             <OffCanvas />
             <MobileMenu />
 
             <main className="body-bg">
                 <Header />
 
                 <section className="padding-y-50">
                     <div className="container">
                         <div className="row justify-content-center">
                             <div className="col-lg-10">
                                 <div className="row g-4">
                                     <div className="col-lg-5">
                                         <div className="calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                                             <h4 className="mb-4">Enter Property Details</h4>
                                             
                                             <div className="mb-3">
                                                 <label className="form-label">Super Built-up Area (Sq. Ft.)</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={superArea}
                                                     onChange={(e) => setSuperArea(Number(e.target.value))}
                                                 />
                                                 <small className="text-muted">Total area advertised by builder</small>
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">Loading Factor (%)</label>
                                                 <div className="d-flex align-items-center gap-2">
                                                     <input 
                                                         type="range" 
                                                         className="form-range flex-grow-1" 
                                                         min="15" 
                                                         max="50" 
                                                         value={loading}
                                                         onChange={(e) => setLoading(Number(e.target.value))}
                                                     />
                                                     <span className="fw-bold" style={{width: '50px'}}>{loading}%</span>
                                                 </div>
                                                 <small className="text-muted">Standard loading is 25-35%</small>
                                             </div>
                                         </div>
                                     </div>
 
                                     <div className="col-lg-7">
                                         <div className="results-card bg-white p-4 rounded-3 shadow-sm h-100">
                                             <h4 className="mb-4">Area Breakdown</h4>
                                             
                                             <div className="mb-4 p-3 rounded-3" style={{backgroundColor: '#fff5eb'}}>
                                                 <label className="text-success fw-bold small">ESTIMATED CARPET AREA (Usable Space)</label>
                                                 <div className="display-6 fw-bold text-dark">{carpetArea} <span className="fs-5 text-muted">Sq. Ft.</span></div>
                                                 <div className="small text-muted mt-1">
                                                     This is the actual area you can use within the walls.
                                                 </div>
                                             </div>
 
                                             <div className="row g-3">
                                                 <div className="col-md-6">
                                                     <div className="p-3 bg-light rounded-3">
                                                         <label className="text-muted small fw-bold">BUILT-UP AREA (Approx)</label>
                                                         <div className="fs-4 fw-bold">{builtUpArea} <span className="fs-6">Sq. Ft.</span></div>
                                                         <small className="text-muted">Includes walls & balconies</small>
                                                     </div>
                                                 </div>
                                                 <div className="col-md-6">
                                                     <div className="p-3 bg-light rounded-3">
                                                         <label className="text-muted small fw-bold">COMMON AREA (Loading)</label>
                                                         <div className="fs-4 fw-bold">{superArea - carpetArea} <span className="fs-6">Sq. Ft.</span></div>
                                                         <small className="text-muted">Lobby, stairs, lift, etc.</small>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
 
                                 <div className="mt-5">
                                     <h3 className="mb-3">Understanding the Terms</h3>
                                     <div className="row g-4">
                                         <div className="col-md-4">
                                             <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                 <h5 className="text-main">Carpet Area</h5>
                                                 <p className="small mb-0">The area enclosed within the walls, actual usable floor area. According to RERA, it excludes external walls, service shafts, balconies, and open terraces.</p>
                                             </div>
                                         </div>
                                         <div className="col-md-4">
                                             <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                 <h5 className="text-main">Built-up Area</h5>
                                                 <p className="small mb-0">Carpet Area + Area of walls + Area of balconies. This is typically 10-15% more than the carpet area.</p>
                                             </div>
                                         </div>
                                         <div className="col-md-4">
                                             <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                 <h5 className="text-main">Super Built-up Area</h5>
                                                 <p className="small mb-0">Built-up Area + Proportionate share of common areas (lobby, lifts, stairs, amenities). This is what you usually pay for.</p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </section>
 
                 <Cta ctaClass="" />

                 <Footer />
             </main>
         </>
     );
 };
 
 export default AreaCalculator;
