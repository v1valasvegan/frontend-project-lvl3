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
  const disabled = form.processState !== 'filling' || !form.valid;
  button.disabled = disabled;
};


const renderFeedback = (form) => {
  const feedbackContainer = document.querySelector('.feedback');
  const input = document.querySelector('.form-control');

  if (!form.valid && form.processState !== 'empty') {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }

  if (form.processState === 'finished') {
    feedbackContainer.innerText = 'Feed added';
    return;
  }

  if (form.valid || form.processState === 'empty') {
    feedbackContainer.innerText = '';
    return;
  }

  feedbackContainer.innerText = form.error;
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

  watch(form, ['processState', 'valid'], () => {
    setButtonAccessibility(form);
    renderFeedback(form);
  });
};
