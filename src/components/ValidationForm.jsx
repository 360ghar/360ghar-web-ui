import React from 'react';
import { Formik, useFormik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from 'react-toastify';

const ValidationForm = (props) => {
    
    const formik = useFormik({
        initialValues: {
          name: "",
          email: "",
          address: "",
          message: "",
        },
        // Validate by Yup
        validationSchema: yup.object({
            name: yup.string().min(3, "Too Short! Must be at least 3 characters long").required(),
            address: yup.string().min(3, "Too Short! Must be at least 3 characters long").required(),
            email: yup.string().email("Your Email is not valid! Provide valid email").required(),
            message: yup .string().min(5, "Message must have minimum 5 characters"),
        }),
    
        onSubmit: (values, { resetForm }) => {
          // alert(JSON.stringify(values, null, 2));
          resetForm({ values: "" });
          toast.success("Congratulations! You Have Submitted Successfully.", {
            theme: "colored",
          });
        },
    });

    // Render Errors Code Start
    const renderNameError = formik.touched.name && formik.errors.name && (
        <span className="text-danger">{formik.errors.name}</span>
    );
    
    const renderEmailError = formik.touched.email && formik.errors.email && (
        <span className="text-danger">{formik.errors.email}</span>
    );

    const renderAddressError = formik.touched.address && formik.errors.address && (
        <span className="text-danger">{formik.errors.address}</span>
    );
    
    const renderMessageError = formik.touched.message &&
        formik.errors.message && (
        <span className="text-danger">{formik.errors.message}</span>
    );
    // Render Errors Code End
    
    return (
        <>
            <form action="#" onSubmit={formik.handleSubmit}>
                <div className="row gy-30">
                    <div className={props.colClass}>
                        {
                            props.renderLabel && (
                                <label htmlFor="name" className={`form-label ${props.labelClass}`}>Your Name</label>
                            )
                        }
                        <div className="position-relative">
                            <input 
                                type="text" 
                                placeholder="Name"
                                name='name'
                                id='name'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                                className={`${props.inputClass} ${
                                    formik.touched.name && formik.errors.name ? "is-invalid" : ""
                                }`}
                            />
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-user"></i></span>
                        </div>
                        {renderNameError}
                    </div>

                    

                    <div className={props.colClass}>
                        {
                            props.renderLabel && (
                                <label htmlFor="email" className={`form-label ${props.labelClass}`}>Your Email</label>
                            )
                        }
                        <div className="position-relative">
                            <input 
                                type="email" 
                                placeholder="Your Email"
                                name='email'
                                id='email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className={`${props.inputClass} ${
                                    formik.touched.email && formik.errors.email ? "is-invalid" : ""
                                }`}
                            />
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-paper-plane"></i></span>
                        </div>
                        {renderEmailError}
                    </div>

                    <div className={props.colClass}>
                        {
                            props.renderLabel && (
                                <label htmlFor="address" className={`form-label ${props.labelClass}`}>Your Address</label>
                            )
                        }
                        <div className="position-relative">
                            <input 
                                type="text" 
                                placeholder="Your Address"
                                name='address'
                                id='address'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.address}
                                className={`${props.inputClass} ${
                                    formik.touched.address && formik.errors.address ? "is-invalid" : ""
                                }`}
                            />
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-map-marker-alt"></i></span>
                        </div>
                        {renderAddressError}
                    </div>

                    <div className="col-lg-12">
                        {
                            props.renderLabel && (
                                <label htmlFor="message" className={`form-label ${props.labelClass}`}>Your Message</label>
                            )
                        }
                        <div className="position-relative">
                            <textarea 
                                placeholder="Write Message.."
                                name='message'
                                id='message'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.message}
                                className={`${props.inputClass} ${
                                    formik.touched.message && formik.errors.message ? "is-invalid" : ""
                                }`}
                            >
                            </textarea>
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-envelope"></i></span>
                        </div>
                        {renderMessageError}
                    </div>

                    <div className="col-lg-12">
                        <button type="submit" className="btn btn-main w-100"> Send Message </button>
                    </div>
                </div>
            </form>   
        </>
    );
};

export default ValidationForm;