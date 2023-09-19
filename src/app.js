/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import 'bootstrap';
import watch from './view.js';
import axios from 'axios';
import parse from './parser.js';
import _ from 'lodash';
import resources from './locales/index.js';
import i18next from 'i18next';



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
        feedsDisplay: document.querySelector('.feeds'),
        postsDisplay: document.querySelector('.posts'),
    };

    const i18n = i18next.createInstance();

    i18n.init({
        debug: true,
        lng: 'ru',
        resources,
    }).then(() => {
        yup.setLocale({
            string: {
                url: () => ({ key: 'errors.invalidUrl', validationError: true }),
            },
            mixed: {
                required: () => ({ key: 'errros.default', validationError: true }),
                notOneOf: () => ({ key: 'errors.exist', validationError: true }),
            },
        });    
    
    const validateUrl = (url, feeds) => {
        const schema = yup
            .string()
            .required()
            .url()
            .notOneOf(feeds);
        
        return schema.validate(url);
    };

    
    const errorHandler = (error) => {
        if (error.message.validationError) {
            // console.log(error.message);
            watchedState.form = {
                valid: false,
                error: error
            };
        } else if (error.message.parsingError) {
            watchedState.form = {
                valid: false,
                error: error
            };
        }
        
    };


    const getProxyUrl = (url) => {
        const href = new URL('/get', 'https://allorigins.hexlet.app');
        href .searchParams.set('url', url);
        href .searchParams.set('disableCache', 'true');
        return href;
      };
        
    const watchedState = watch(state, elements, i18n);



    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const alreadyAddedLinks = state.feeds.map((feed) => feed.url);

        validateUrl(url, alreadyAddedLinks)
            .then(() => {
                watchedState.loadingProcess = 'loading';
                watchedState.form.valid = true;
                // console.log(axios.get(getProxyUrl(url)))
                return axios.get(getProxyUrl(url));
            })
            .then((response) => {
                const data = response.data.contents;
                // console.log(data.contents)
                const parsingResults = parse(data);
                // console.log(parsingResults)
                const { flowTitle, flowDescription, posts } = parsingResults;
                const feed = {
                    url,
                    id: _.uniqueId(),
                    title: flowTitle,
                    description: flowDescription,
                };

                const post = posts.map((item) => ({
                    ...item,
                    feedId: feed.id,
                    postId: _.uniqueId()
                }))

                // console.group(feed, post);

                watchedState.feeds.push(feed);
                watchedState.posts.push(post);
                console.group(state.feeds, state.posts)

                watchedState.loadingProcess = 'idle';
                watchedState.form = { error: null, valid: true };
            })
            .catch((error) =>{
                errorHandler(error)
            });
        })
    });
};         
