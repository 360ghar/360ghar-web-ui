import { counters } from '../../data/HomeTwoData';
import CounterTwoItem from './CounterTwoItem';

const CounterTwo = () => {
    return (
        <>
            {/* ===================== Counter Two Section Start ======================= */}
            <section className="counter-two padding-y-60">
                <div className="container container-two">
                    <div className="row gy-4">
                        {
                            counters.map((counter, counterIndex) => {
                                return (
                                    <div className="col-md-3 col-6" key={counterIndex}>
                                        <CounterTwoItem counter={counter}/>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>
            {/* ===================== Counter Two Section End ======================= */}   
        </>
    );
};

export default CounterTwo;