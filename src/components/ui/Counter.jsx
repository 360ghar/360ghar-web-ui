
import { counts } from '../../data/HomeOneData';
import CounterItem from './CounterItem';


const Counter = () => {
    return (
        <>
            <section className="counter padding-y-120">
                <div className="container">
                    <div className="row gy-4">
                        {
                            counts.map((count, index) => {
                                return (
                                    <div className="col-sm-3 col-6" key={index}>
                                        <CounterItem count={count}/>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>
        </>
    );
};

export default Counter;