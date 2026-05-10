import { I18nLink } from '../../i18n/I18nLink';

const Button = (props) => {
    const linkProps = {
        to: props.btnLink,
        className: `btn ${props.btnClass}`,
        ...(props.ariaLabel && { 'aria-label': props.ariaLabel }),
    };

    return (
        <I18nLink {...linkProps}>
            {props.btnText}
            <span className={`icon ${props.spanClass}`}> <i className={`${props.iconClass}`}></i> </span>
        </I18nLink>
    );
};

export default Button;