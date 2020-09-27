import * as _ from 'lodash';
import { watch } from 'melanke-watchjs';

const renderPosts = (posts, feedId) => {
  const renderPost = ({ text, link }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerText = text;
    a.setAttribute('href', link);
    li.append(a);
    return li;
  };
  const listItems = posts.map(renderPost);
  const feed = document.getElementById(feedId);
  feed.prepend(...listItems);
};

const renderFeed = ({ title, description, id }) => {
  const article = document.createElement('article');
  const feedContainer = document.querySelector('.feed-container');
  const ul = document.createElement('ul');
  ul.classList.add('list-unstyled');
  ul.setAttribute('id', id);
  const h4 = document.createElement('h4');
  h4.innerText = title;
  const p = document.createElement('p');
  p.innerText = description;
  article.append(h4, p, ul);
  feedContainer.prepend(article);
};

const setButtonAccessibility = (form) => {
  const button = document.querySelector('.btn');
  const disabled = form.processState === 'requested' || form.text === '' || !form.valid;
<<<<<<< HEAD
  button.disabled = disabled;
=======
  if (disabled) {
    button.disabled = true;
    return;
  }

  button.disabled = false;
>>>>>>> 8a2c2680133bf92d8db2c2c7ac6b409ca7868871
};


const renderFeedback = (form) => {
  const feedbackContainer = document.querySelector('.feedback');
  const input = document.querySelector('.form-control');

  if (form.valid) {
    input.classList.remove('is-invalid');
    feedbackContainer.innerText = '';
  }

  if (!form.valid) {
    input.classList.add('is-invalid');
    feedbackContainer.innerText = form.error;
  }

  if (form.processState === 'finished') {
    feedbackContainer.innerText = 'Feed added';
  }

  if (form.processState === 'failed') {
    feedbackContainer.innerText = form.error;
  }
};

export default (state) => {
  const { form, content } = state;

  watch(content, 'posts', () => {
    const { posts, lastPostId, rssFeeds } = content;
    const newPosts = posts.filter(({ id }) => Number(id) > Number(lastPostId));
    const oldPosts = _.difference(posts, newPosts);
    const updatedFeedId = newPosts[0].feedId;
    const hasNewFeed = !oldPosts.some(({ feedId }) => feedId === updatedFeedId);
    if (hasNewFeed) {
      const newFeed = _.last(rssFeeds);
      renderFeed(newFeed);
      const formElement = document.querySelector('.form-group');
      formElement.reset();
      formElement.focus();
    }
    renderPosts(newPosts, updatedFeedId);
  });

  watch(form, ['processState', 'error'], () => {
    setButtonAccessibility(form);
    renderFeedback(form);
  });
};
