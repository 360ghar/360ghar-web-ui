import { counterThreeContents } from '../../data/HomeThreeData';
import CounterThreeItem from './CounterThreeItem';

import CounterBg from '/assets/images/thumbs/counter-bg.png';

import LazyImage from '../../common/ui/LazyImage';
const CounterThree = () => {
    return (
        <>
            <section className="counter-three padding-y-120">
                <LazyImage src={CounterBg} alt="Decorative counter section background" className="counter-three__bg"/>
                <div className="container container-two">
                    <div className="counter-three-wrapper">
                        {
                            counterThreeContents.map((counterThreeItem, counterThreeItemIndex) => {
                                return (
                                    <CounterThreeItem counterThreeItem={counterThreeItem} key={counterThreeItemIndex}/>
                                )
                            })
                        }

                    </div>
                </div>
            </section>      
        </>
    );
};

export default CounterThree;