import { useState }  from 'react';
import FaqItem from '../components/ui/FaqItem';
import { faqs } from '../data/HomeThreeData';

const FaqAccordion = (props) => {

    const [activeAccordion, setActiveAccordion] = useState(null); 
    
    const handleAccordionClick = (faqId) => {
        setActiveAccordion(activeAccordion === faqId ? null : faqId); 
    }
    
    return (
        <>
            <div className={`common-accordion accordion ${props.accordionClass}`}>
                {
                    faqs.map((faq, faqIndex) => {
                        return (
                            <FaqItem 
                                itemClass={props.itemClass}
                                faq={faq} 
                                key={faqIndex}   
                                faqIndex={faqIndex}
                                activeAccordion={activeAccordion}
                                handleAccordionClick={handleAccordionClick}
                            />
                        )
                    })
                }
            </div>   
        </>
    );
};

export default FaqAccordion;