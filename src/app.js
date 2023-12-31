import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    form: {
      error: null,
      valid: true,
    },
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    modalPost: null,
    viewPosts: [],
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
        url: { key: 'errors.invalidUrl', validationError: true },
      },
      mixed: {
        required: () => ({ key: 'errors.emptyInput', validationError: true }),
        notOneOf: () => ({ key: 'errors.exist', validationError: true }),
      },
    });

    const validateUrl = (url, alreadyAddedLinks) => {
      const schema = yup
        .string()
        .required()
        .url()
        .notOneOf(alreadyAddedLinks);

      return schema.validate(url);
    };

    const watchedState = watch(state, elements, i18n);

    const errorHandler = (error) => {
      if (error.message.validationError) {
        watchedState.form = {
          valid: false,
          error: error.message.key,
        };
      } else if (error.isParsingError) {
        watchedState.loadingProcess = {
          status: 'failed',
          error: 'errors.parsingError',
        };
      } else if (error.isAxiosError) {
        watchedState.loadingProcess = {
          status: 'failed',
          error: 'errors.networkError',
        };
      } else {
        watchedState.loadingProcess = {
          status: 'failed',
          error: 'errors.unknownError',
        };
      }
    };

    const getProxyUrl = (url) => {
      const href = new URL('/get', 'https://allorigins.hexlet.app');
      href.searchParams.set('url', url);
      href.searchParams.set('disableCache', 'true');
      return href;
    };

    const updateInterval = 5000;
    const updatePosts = () => {
      const promises = state.feeds.map((feed) => {
        const feedUrl = feed.url;
        return axios.get(getProxyUrl(feedUrl))
          .then((response) => {
            const data = response.data.contents;
            const parsingResults = parse(data);
            const { posts } = parsingResults;

            const newPosts = _.differenceWith(posts, state.posts, (a, b) => a.title === b.title);
            const updatedPosts = newPosts.map((post) => {
              const updatePost = { ...post };
              updatePost.id = _.uniqueId();
              updatePost.feedId = feed.id;
              return updatePost;
            });
            state.posts.unshift(...updatedPosts);
          })
          .catch((error) => {
            console.error(error);
          });
      });

      Promise.all(promises).finally(() => {
        setTimeout(() => updatePosts(), updateInterval);
      });
    };

    updatePosts(state);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const alreadyAddedLinks = state.feeds.map((feed) => feed.url);

      validateUrl(url, alreadyAddedLinks)
        .then(() => {
          watchedState.loadingProcess = { status: 'loading', error: null };
          watchedState.form = { valid: true, error: null };
          return axios.get(getProxyUrl(url));
        })
        .then((response) => {
          const data = response.data.contents;
          const parsingResults = parse(data);
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
            id: _.uniqueId(),
          }));

          watchedState.feeds.unshift(feed);
          watchedState.posts.unshift(...post);

          watchedState.loadingProcess = { status: 'idle', error: null };
          watchedState.form = { error: null, valid: true };
        })
        .catch((error) => {
          errorHandler(error);
        });
    });
    elements.postsDisplay.addEventListener('click', (e) => {
      const { target } = e;
      const id = target.getAttribute('postid');
      if (id) {
        watchedState.modalPost = id;
        watchedState.viewPosts.push(id);
      }
    });
  });
};
