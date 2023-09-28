/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const handleForm = (state, elements, i18n) => {
    if (state.form.error) {
        elements.feedback.classList.add('text-danger');
        elements.feedback.classList.remove('text-success');
        // const errorMessage = i18n.t(state.form.error.message.key);
        elements.feedback.textContent = i18n.t(state.form.error);
        // console.log('Error key:', state.form.error.message.key);
    } 
    if (state.form.valid) {
        elements.input.classList.remove('is-invalid');
        // elements.feedback.classList.remove('text-danger');
        // elements.feedback.classList.add('text-success');

        // elements.feedback.textContent = i18n.t('success')
    } else {
        elements.input.classList.add('is-invalid');
    }
};

const handleFeeds = (state, elements) => {
    console.log('Feeds:', state.feeds); // Вывод состояния feeds
    console.log('Posts:', state.posts);
    elements.feedsDisplay.innerHTML = '';
    const feedsCard = document.createElement('div');
    feedsCard.classList.add('card', 'border-0');

    const feedsTitleContainer = document.createElement('div');
    feedsTitleContainer.classList.add('card-body');
    feedsCard.append(feedsTitleContainer);

    const feedsTitle = document.createElement('h2');
    feedsTitle.classList.add('card-title', 'h4');
    feedsTitle.textContent = 'Фиды'
    feedsTitleContainer.append(feedsTitle);

    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0','rounded-0');
    feedsCard.append(feedsList);

    state.feeds.forEach((feed) => {
        const feedContainer = document.createElement('li');
        feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
        feedsList.append(feedContainer);

        const title = document.createElement('h3');
        title.classList.add('h6', 'm-0');
        title.textContent = feed.title;

        const description = document.createElement('p');
        description.classList.add('m-0', 'small', 'text-black-50');
        description.textContent = feed.description;
        feedContainer.append(title, description);
    });

    elements.feedsDisplay.append(feedsCard);
};

const handlePosts = (state, elements) => {
    //  console.log('Feeds:', state.feeds); // Вывод состояния feeds
    // console.log('Posts:', state.posts);
    elements.postsDisplay.innerHTML = '';

    const postsCard = document.createElement('div');
    postsCard.classList.add('card', 'border-0');

    const postsTitleContainer = document.createElement('div');
    postsTitleContainer.classList.add('card-body');
    postsCard.append(postsTitleContainer);

    const postsTitle = document.createElement('h2');
    postsTitle.classList.add('card-title', 'h4');
    postsTitle.textContent = 'Посты';
    postsTitleContainer.append(postsTitle);

    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');
    postsCard.append(postsList);

    state.posts.forEach((post) => {
        const postContainer = document.createElement('li');
        postContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

        const link = document.createElement('a');
        link.textContent = post.title;
        link.setAttribute('href', post.link);
        link.setAttribute('postId', post.id);
        link.setAttribute('target', '_blank');

        if (state.viewPosts.includes(post.postId)) {
            link.classList.add('fw-normal', 'link-secondary');
        } else {
            link.classList.add('fw-blod');
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.setAttribute('postId', post.id);
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#modal');
        button.textContent = 'Просмотр'

        postContainer.append(link, button);
        postsList.append(postContainer);
    });

    elements.postsDisplay.append(postsCard);
};

const handleLoadingProcess = (state, elements, i18n) => {
    if (state.loadingProcess.error) {
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        elements.feedback.textContent = i18n.t(state.loadingProcess.error);
    }
    if (state.loadingProcess.status === 'idle') {
        elements.input.value = '';
 
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        elements.feedback.textContent = i18n.t('success');
        elements.input.classList.remove('is-invalid');
        elements.input.disabled = false;
        elements.submit.disabled = false;
    } else if (state.loadingProcess.status === 'loading') {
        elements.input.disabled = true;
        elements.submit.disabled = true;
    } else if (state.loadingProcess.status === 'failed') {
        elements.input.classList.add('is-invalid');
        elements.input.disabled = false;
        elements.submit.disabled = false;
    }
};

const handleModalWindow = (state, elements) => {
    const postForModalWindow = state.posts.find((post) => post.id === state.modalPost);
    elements.modalTitle.textContent = postForModalWindow.title;
    elements.modalDescription.textContent = postForModalWindow.description;
    elements.modalFullArticle.setAttribute('href', postForModalWindow.link);
}


export default (state, elements, i18n) => {
    const watchedState = onChange(state, (path) => {
        switch (path) {
            case 'form': {
                handleForm(state, elements, i18n);
                break;
            }
            case 'feeds': {
                handleFeeds(state, elements, i18n);
                break;
            }
            case 'posts': {
                handlePosts(state, elements, i18n);
                break;
            }
            case 'viewPosts': {
                handlePosts(state, elements, i18n);
                break;
            }
            case 'modalPost': {
                handleModalWindow(state, elements);
                break;
            }
            case 'loadingProcess': {
                handleLoadingProcess(state, elements, i18n);
                break;
            }
        }
    });

    return watchedState;
}
