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
          valid: null,   // Валидность формы (по умолчанию невалидна)
        },
        loadingProcess: {
            status: 'idle',
            error: null,
        },
        modalPost: null,  // Идентификатор отображаемого модального поста (по умолчанию null)
        viewPosts: [],    // Массив идентификаторов просматриваемых постов
      };

    const elements = {
        form: document.querySelector('.rss-form'),
        input: document.getElementById('url-input'),
        submit: document.querySelector('button[type="submit"]'),
        feedback: document.querySelector('.feedback'),
        feedsDisplay: document.querySelector('.feeds'),
        postsDisplay: document.querySelector('.posts'),
        modalTitle: document.querySelector('.modal-title'),
        modalDescription: document.querySelector('.modal-body'),
        modalFullArticle: document.querySelector('.full-article'),
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
                required: () => ({ key: 'errors.emptyInput', validationError: true }),
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
                error: error.message.key,
            };
        } else if (error.isParsingError) {
            watchedState.loadingProcess = {
                status: 'failed',
                error: 'errors.parsingError'
            };
        } else if (error.isAxiosError) {
            watchedState.loadingProcess = {
                status: 'failed',
                error: 'errors.networkError',
            }
        } else {
            watchedState.loadingProcess = {
                status: 'failed',
                error: 'errors.unknownError'
            }
        }
    };
    

    const getProxyUrl = (url) => {
        const href = new URL('/get', 'https://allorigins.hexlet.app');
        href .searchParams.set('url', url);
        href .searchParams.set('disableCache', 'true');
        return href;
    };

    const postsRecheck = () => {
        const promises = state.feeds.map((feed) => {
                const feedUrl = feed.url;
                return axios.get(getProxyUrl(feedUrl))
                    .then((response) => {
                        const data = response.data.contents;
                        // console.log(data);
                        const parsingResults = parse(data);
                        console.log(parsingResults)
                        const { flowTitle, flowDescription, posts } = parsingResults;

                    const newPosts = _.differenceWith(posts, state.posts, (a, b) => a.title === b.title);
                    const updatedPosts = newPosts.map((post) => {
                        post.id = _.uniqueId();
                        post.feedId = feed.id;
                        return post;
                    });
                    state.posts.unshift(...updatedPosts);
                })
                .catch((error) => {
                    console.error(error);
                });
        });

        Promise.all(promises).finally(() => {
            setTimeout(() => postsRecheck(), 5000);
        });
    };

    const watchedState = watch(state, elements, i18n);

    postsRecheck(state);

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const alreadyAddedLinks = state.feeds.map((feed) => feed.url);

        validateUrl(url, alreadyAddedLinks)
            .then(() => {
                watchedState.loadingProcess = { status: 'loading' };
                watchedState.form = { valid: true, error: null };
                return axios.get(getProxyUrl(url));
            })
            .then((response) => {
                const data = response.data.contents;
                // console.log(data);
                const parsingResults = parse(data);
                // console.log(parsingResults)
                const { flowTitle, flowDescription, posts } = parsingResults;
                // console.log(posts)
                const feed = {
                    url,
                    id: _.uniqueId(),
                    title: flowTitle,
                    description: flowDescription,
                };

                const post = posts.map((item) => ({
                    ...item,
                    feedId: feed.id,
                    id: _.uniqueId(),
                }));

                watchedState.feeds.unshift(feed);
                watchedState.posts.unshift(...post);

                watchedState.loadingProcess = { status: 'idle', error: null };
                watchedState.form = { error: null, valid: true };
            })
            .catch((error) =>{
                // console.log(error)
                errorHandler(error)
            });
        })
        elements.postsDisplay.addEventListener('click', (e) => {
            
            const { target } = e;
            // console.log(target);
            const id = target.getAttribute('postid');
            // console.log(id);
            watchedState.modalPost = id;
            console.log(watchedState.modalPost)
            watchedState.viewPosts.push(id);
            // console.log(watchedState.viewPosts);
        });
    });
};         




