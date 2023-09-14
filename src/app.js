/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import 'bootstrap';
import watch from './view.js';
import axios from 'axios';
import parse from './parser.js';


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
        form: document.querySelector('.rss-form'),
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

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const alreadyAddedLinks = state.feeds.map((feed) => feed.url);

        const validatedUrl = validateUrl(url, alreadyAddedLinks)
            .then(() => {
                axios.get('https://buzzfeed.com/world.xml')
            })
            .then((response) => {
                const data = response.data;
                const parsingResults = parse(data);
                setState(watchedState, {
                    form: {
                      ...watchedState.form, // Сохраняем текущее состояние
                      processState: 'success', 
                      response: parsingResults, //  Добавляем распарсенные данные
                    },
                    feeds: [...watchedState.feeds, { url }], // Добавляем новый URL в feeds
                  });
                })
            .catch((error) => {
                setState(watchedState, {
                form: {
                    ...watchedState.form,
                    processState: 'error',
                    errors: error,
                },
                });
            });
    });
};         
            