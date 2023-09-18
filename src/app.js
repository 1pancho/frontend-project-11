/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import 'bootstrap';
import watch from './view.js';
import axios from 'axios';
import parse from './parser.js';
import _ from 'lodash';


export default () => {
    const state = {
        feeds: [],        // Массив лент (объекты с информацией о лентах)
        posts: [],        // Массив постов (объекты с информацией о постах)
        form: {
          error: null,    // Ошибка формы, если есть
          valid: false,   // Валидность формы (по умолчанию невалидна)
        },
        modalPost: null,  // Идентификатор отображаемого модального поста (по умолчанию null)
        viewPosts: [],    // Массив идентификаторов просматриваемых постов
        loadingProcess: 'idle',       // Состояние загрузки (по умолчанию 'ok')
      };

    const elements = {
        form: document.querySelector('.rss-form'),
        input: document.getElementById('url-input'),
        submit: document.querySelector('button[type="submit"]'),
        feedback: document.querySelector('.feedback'),
        feedsDisplay: document.querySelector('feeds'),
        postsDisplay: document.querySelector('posts'),
    };

    const validateUrl = (url, feeds) => {
        const schema = yup
            .string()
            .required()
            .url()
            .notOneOf(feeds);
        
        return schema.validate(url);
    };

    // const errorHandler = (error) => {
    //     elements.feedbackElement.textContent = error.message;
    // };


    const getProxyUrl = (url) => {
        const href = new URL('/get', 'https://allorigins.hexlet.app');
        href .searchParams.set('url', url);
        href .searchParams.set('disableCache', 'true');
        return href;
      };
        
    const watchedState = watch(state, elements);

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const alreadyAddedLinks = state.feeds.map((feed) => feed.url);

        validateUrl(url, alreadyAddedLinks)
            .then(() => {
                watchedState.loadingProcess = 'loading';
                watchedState.form.valid = true;
                return axios.get(getProxyUrl(url));
            })
            // .then((response) => {
            //     const data = response.data;
            //     const parsingResults = parse(data);
            //     const { flowTitle, flowDescription, posts } = parsingResults;
            //     const feed = {
            //         url,
            //         id: _.uniqueId(),
            //         title: flowTitle,
            //         description: flowDescription,
            //     };

            //     const post = posts.map((item) => ({
            //         ...item,
            //         feedId: feed.id,
            //         postId: _.uniqueId()
            //     }))

            //     watchedState.feeds.unshift(feed);
            //     watchedState.posts.unshift(...post);
            //     watchedState.loadingProcess = 'idle';
            //     watchedState.form = { error: null, valid: true };
            // })
            .catch((error) =>{
                watchedState.form.error = error;
            });
    });
};         
