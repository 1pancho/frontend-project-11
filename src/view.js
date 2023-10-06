import onChange from 'on-change';

const handleForm = (state, elements, i18n) => {
  const updateElements = { ...elements };
  if (state.form.error) {
    updateElements.feedback.classList.add('text-danger');
    updateElements.feedback.classList.remove('text-success');
    updateElements.feedback.textContent = i18n.t(state.form.error);
  }
  if (state.form.valid) {
    updateElements.input.classList.remove('is-invalid');
  } else {
    updateElements.input.classList.add('is-invalid');
  }
  return updateElements;
};

const handleFeeds = (state, elements, i18n) => {
  const updateElements = { ...elements };
  updateElements.feedsDisplay.textContent = '';
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');

  const feedsTitleContainer = document.createElement('div');
  feedsTitleContainer.classList.add('card-body');
  feedsCard.append(feedsTitleContainer);

  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-title', 'h4');
  feedsTitle.textContent = i18n.t('feedsTitle');
  feedsTitleContainer.append(feedsTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  feedsCard.append(feedsList);

  state.feeds.forEach((feed) => {
    const feedContainer = document.createElement('li');
    feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedsList.append(feedContainer);

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'description', 'text-black-50');
    description.textContent = feed.description;
    feedContainer.append(title, description);
  });

  updateElements.feedsDisplay.append(feedsCard);
  return updateElements;
};

const handlePosts = (state, elements, i18n) => {
  const updateElements = { ...elements };
  updateElements.postsDisplay.textContent = '';

  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');

  const postsTitleContainer = document.createElement('div');
  postsTitleContainer.classList.add('card-body');
  postsCard.append(postsTitleContainer);

  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-title', 'h4');
  postsTitle.textContent = i18n.t('postsTitle');
  postsTitleContainer.append(postsTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsCard.append(postsList);

  state.posts.forEach((post) => {
    const postContainer = document.createElement('li');
    postContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    if (state.viewPosts.includes(post.id)) {
      link.classList.add('fw-normal', 'link-secondary');
    } else {
      link.classList.add('fw-bold');
    }
    link.textContent = post.title;
    link.setAttribute('href', post.link);
    link.setAttribute('id', post.id);
    link.setAttribute('target', '_blank');

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('postId', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = 'Просмотр';

    postContainer.append(link, button);
    postsList.append(postContainer);
  });

  updateElements.postsDisplay.append(postsCard);
  return updateElements;
};

const handleLoadingProcess = (state, elements, i18n) => {
  const updateElements = { ...elements };

  if (state.loadingProcess.error) {
    updateElements.feedback.classList.remove('text-success');
    updateElements.feedback.classList.add('text-danger');
    updateElements.feedback.textContent = i18n.t(state.loadingProcess.error);
  }
  switch (state.loadingProcess.status) {
    case 'idle': {
      updateElements.input.value = '';
      updateElements.feedback.classList.remove('text-danger');
      updateElements.feedback.classList.add('text-success');
      updateElements.feedback.textContent = i18n.t('success');
      updateElements.input.classList.remove('is-invalid');
      updateElements.input.disabled = false;
      updateElements.submit.disabled = false;
      break;
    }
    case 'loading': {
      updateElements.input.disabled = true;
      updateElements.submit.disabled = true;
      break;
    }
    case 'failed': {
      updateElements.input.classList.add('is-invalid');
      updateElements.input.disabled = false;
      updateElements.submit.disabled = false;
      break;
    }
    default:
      break;
  }
  return updateElements;
};

const handleModalWindow = (state, elements) => {
  const updateElements = { ...elements };
  const postForModalWindow = state.posts.find((post) => post.id === state.modalPost);
  updateElements.modalFullArticle.setAttribute('href', postForModalWindow.link);
  updateElements.modalTitle.textContent = postForModalWindow.title;
  updateElements.modalDescription.textContent = postForModalWindow.description;
  return updateElements;
};

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
      default:
        throw new Error('Unknown error!');
    }
  });

  return watchedState;
};
