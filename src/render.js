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


// const toggleInputClassnames = (state) => {
//   const feedbackContainer = document.querySelector('.feedback');
//   const input = document.querySelector('.form-control');
//   const isInputTouched = input.classList.contains('is-valid') || input.classList.contains('is-invalid');
//   if (!isInputTouched) {
//     input.classList.add('is-invalid');
//     input.classList.add('is-valid');
//   }

//   if (state.form.valid) {
//     input.classList.replace('is-invalid', 'is-valid');
//   } else {
//     input.classList.replace('is-valid', 'is-invalid');
//   }

//   if (state.error) {
//     feedbackContainer.classList.replace('text-success', 'text-danger');
//   }

//   if (state.success) {
//     feedbackContainer.classList.replace('text-danger', 'text-success');
//   }
// };

// const toggleButtonAccessibility = (state) => {
//   const button = document.querySelector('.btn');

//   if (state.valid) {
//     button.removeAttribute('disabled');
//     return;
//   }
//   button.setAttribute('disabled', true);
// };

const renderErrors = (state) => {
  const button = document.querySelector('.btn');
  const feedbackContainer = document.querySelector('.feedback');
  const input = document.querySelector('.form-control');
  button.disabled = !state.form.valid;
  console.log(button.disabled);
  console.log(state);

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

// const renderNewFeed = (prevState, state) => {
//   const feedContainer = document.querySelector('.feed-container');
//   const newFeed = _.difference(state.content.rssFeeds, prevState.content.rssFeeds);
//   const article = buildArticle(newFeed);
//   feedContainer.append(article);
// };

const updateFeed = (feed) => {
  
};

const renderSuccessMessage = () => {
  const feedbackContainer = document.querySelector('.feedback');
  feedbackContainer.innerText = 'Feed added';
};


export default (state) => {
  const feedContainer = document.querySelector('.feed-container');
  const feedbackContainer = document.querySelector('.feedback');

  watch(state, 'form', () => {
    renderErrors(state);
  });

  watch(state, 'error', () => {
    feedbackContainer.innerText = state.error;
  });

  watch(state, 'success', () => {
    feedbackContainer.innerText = state.success;
  });


  // watch(state, 'rssItems', (_prop, _action, newItems, oldItems) => {
  //   if (newItems.length !== oldItems.length) {
  //     const newItem = last(newItems);
  //     const article = buildArticle(newItem);
  //     feedContainer.append(article);
  //     return;
  //   }
  //   feedContainer.innerHTML = '';
  //   newItems.forEach((item) => {
  //     const article = buildArticle(item);
  //     feedContainer.append(article);
  //   });
  // });

  watch(state, 'content', (_prop, _action, newContent, oldContent) => {
    const { rssFeeds } = oldContent;
    const { rssFeeds: newRssFeeds, posts } = newContent;
    const [newFeed] = _.difference(newRssFeeds, rssFeeds);
    const newPosts = posts.filter(({ feedId }) => feedId === newFeed.id);
    const article = buildArticle(newFeed.title, newFeed.description, newPosts);
    feedContainer.append(article);
  });

  watch(state.form, 'processState', renderSuccessMessage);
};
