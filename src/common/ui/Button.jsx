import { Link } from 'react-router-dom';

const Button = (props) => {
    const linkProps = {
        to: props.btnLink,
        className: `btn ${props.btnClass}`,
        ...(props.ariaLabel && { 'aria-label': props.ariaLabel }),
    };

    return (
        <Link {...linkProps}>
            {props.btnText}
            <span className={`icon ${props.spanClass}`}> <i className={`${props.iconClass}`}></i> </span>
        </Link>
    );
};

export default Button;