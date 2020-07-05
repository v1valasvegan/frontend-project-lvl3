import * as _ from 'lodash';
import { watch } from 'melanke-watchjs';

const hasErrors = (state) => {
  const errors = Object.values(state.form.errors);
  return errors.some((error) => error !== null);
};

const buildPost = ({ text, link }) => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.innerText = text;
  a.setAttribute('href', link);
  li.append(a);
  return li;
};

const buildArticle = (title, description, posts) => {
  const article = document.createElement('article');
  const ul = document.createElement('ul');
  ul.classList.add('list-unstyled');
  const listItems = posts.map(buildPost);
  ul.append(...listItems);
  const h4 = document.createElement('h4');
  h4.innerText = title;
  const p = document.createElement('p');
  p.innerText = description;
  article.append(h4, p, ul);
  return article;
};

const renderErrors = (state) => {
  const button = document.querySelector('.btn');
  const feedbackContainer = document.querySelector('.feedback');
  const input = document.querySelector('.form-control');
  button.disabled = !state.form.valid;

  if (state.form.valid) {
    input.classList.remove('is-invalid');
    feedbackContainer.innerText = '';
  }

  if (!state.form.valid) {
    input.classList.add('is-invalid');
  }

  if (hasErrors(state)) {
    feedbackContainer.innerText = Object.values(state.form.errors).find((error) => error);
  }
};

const renderSuccessMessage = () => {
  const feedbackContainer = document.querySelector('.feedback');
  feedbackContainer.innerText = 'Feed added';
};


export default (state) => {
  const feedContainer = document.querySelector('.feed-container');
  const feedbackContainer = document.querySelector('.feedback');

  watch(state.form, 'text', () => {
    const input = document.querySelector('.form-control');
    input.value = state.form.text;
  });

  watch(state, 'form', () => {
    renderErrors(state);
  });

  watch(state, 'error', () => {
    feedbackContainer.innerText = state.error;
  });

  watch(state, 'success', () => {
    feedbackContainer.innerText = state.success;
  });

  watch(state, 'content', (_prop, _action, newContent, prevContent) => {
    const { rssFeeds: prevRssFeeds } = prevContent;
    const { rssFeeds, posts } = newContent;
    const isNewFeedAdded = !_.isEqual(prevRssFeeds, rssFeeds);

    if (isNewFeedAdded) {
      const [newFeed] = _.difference(rssFeeds, prevRssFeeds);
      const newFeedsPosts = posts.filter(({ feedId }) => feedId === newFeed.id);
      const article = buildArticle(newFeed.title, newFeed.description, newFeedsPosts);
      article.setAttribute('data-id', newFeed.id);
      feedContainer.append(article);
      return;
    }

    const allUpdatedFeedsIds = _.difference(newContent, prevContent).map(({ feedId }) => feedId);
    const updatedFeedsIds = _.uniq(allUpdatedFeedsIds);
    updatedFeedsIds.forEach((id) => {
      const currentFeed = state.content.rssFeeds.find(({ id: feedId }) => feedId === id);
      const currentPosts = newContent.filter(({ feedId }) => feedId === id);
      const article = buildArticle(currentFeed.title, currentFeed.description, currentPosts);
      const updatedArticle = document.querySelector(`article[data-id='${id}']`);
      updatedArticle.innerHTML = article.innerHTML;
    });
  });

  watch(state.form, 'processState', () => {
    const isLoaded = state.form.processState === 'finished';
    if (isLoaded) {
      renderSuccessMessage();
    }
  });
};
