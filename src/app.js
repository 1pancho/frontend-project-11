/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import 'bootstrap';
import watch from './view.js';


export default () => {
    const state = {
        form: {
            field: '',
            processState: '',
            response: {},
            errors: {},
            isValid: null,
        },
        feeds: [],
    };

    const elements = {
        input: document.getElementById('url-input'),
        submit: document.querySelector('button[type="submit"]'),
        feedback: document.querySelector('.feedback'),
    };

    const validateUrl = (url, feeds) => {
        const schema = yup
            .string()
            .required()
            .url()
            .notOneOf(feeds);
        
        return schema.validate(url);
    };


    const watchedState = watch(state, element);

    

}

