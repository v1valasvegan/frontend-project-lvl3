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


const renderFeedback = (form) => {
  const button = document.querySelector('.btn');
  const feedbackContainer = document.querySelector('.feedback');
  const input = document.querySelector('.form-control');
  button.disabled = !form.valid;

  if (form.valid) {
    input.classList.remove('is-invalid');
    feedbackContainer.innerText = '';
  }

  if (!form.valid) {
    input.classList.add('is-invalid');
  }

  if (!_.isNull(form.error)) {
    feedbackContainer.innerText = form.error;
  }

  if (form.processState === 'finished') {
    feedbackContainer.innerText = 'Feed added';
  }
};

export default (state) => {
  const { form, content } = state;

  watch(form, 'text', () => {
    const input = document.querySelector('.form-control');
    input.value = form.text;
  });

  watch(content, 'posts', () => {
    const { posts, lastPostId, rssFeeds } = content;
    const newPosts = posts.filter(({ id }) => Number(id) > Number(lastPostId));
    const oldPosts = _.difference(posts, newPosts);
    const updatedFeedId = newPosts[0].feedId;
    const hasNewFeed = !oldPosts.some(({ feedId }) => feedId === updatedFeedId);
    if (hasNewFeed) {
      const newFeed = _.last(rssFeeds);
      renderFeed(newFeed);
      const input = document.querySelector('.form-control');
      input.focus();
    }
    renderPosts(newPosts, updatedFeedId);
  });

  watch(form, ['processState', 'error'], () => {
    renderFeedback(form);
  });
};
