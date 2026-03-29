import { counterFourContents } from '../../data/OthersPageData';
import CounterFourItem from './CounterFourItem';

const CounterFour = () => {
    return (
        <section className="counter-four bg-white padding-y-120">
            <div className="container container-two">
                <div className="counter-three-wrapper">
                    {
                        counterFourContents.map((counterFourItem, counterFourItemIndex) => {
                            return (
                                <CounterFourItem counterFourItem={counterFourItem} key={counterFourItemIndex}/>
                            )
                        })
                    }
                </div>
            </div>
        </section>   
    );
};

export default CounterFour;