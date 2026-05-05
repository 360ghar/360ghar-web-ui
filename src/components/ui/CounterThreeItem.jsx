import CountUp from 'react-countup';

import LazyImage from '../../common/ui/LazyImage';
const CounterThreeItem = ({ counterThreeItem }) => {
    const {icon, number, text} = counterThreeItem; 
    
    return (
        <>
         <div className="counter-three-item flx-align">
            <span className="counter-three-item__icon">
                <LazyImage src={icon} alt={`${text} icon`}/>
            </span>
            <div className="counter-three-item__content">
                <h2 className="counter-three-item__number">
                    <CountUp end={parseInt(number)} duration={6} delay={0.2} />
                </h2>
                <span className="counter-three-item__text fw-light">{text}</span>
            </div>
        </div>   
        </>
    );
};

export default CounterThreeItem;