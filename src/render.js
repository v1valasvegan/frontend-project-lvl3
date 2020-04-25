import { last } from 'lodash';
import { watch } from 'melanke-watchjs';
// import buildArticle from './buildArticle';


const buildListItem = ({ text, link }) => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.innerText = text;
  a.setAttribute('href', link);
  li.append(a);
  return li;
};

const buildArticle = (rss) => {
  const { title, description, rssLinks } = rss;
  const article = document.createElement('article');
  const ul = document.createElement('ul');
  ul.classList.add('list-unstyled');
  const listItems = rssLinks.map(buildListItem);
  ul.append(...listItems);
  const h4 = document.createElement('h4');
  h4.innerText = title;
  const p = document.createElement('p');
  p.innerText = description;
  article.append(h4, p, ul);
  return article;
};


const toggleInputClassnames = (state) => {
  const feedbackContainer = document.querySelector('.feedback');
  const input = document.querySelector('.form-control');
  const isInputValidated = input.classList.contains('is-valid') || input.classList.contains('is-invalid');
  if (!isInputValidated) {
    input.classList.add('is-invalid');
    input.classList.add('is-valid');
  }

  if (state.valid) {
    input.classList.replace('is-invalid', 'is-valid');
  } else {
    input.classList.replace('is-valid', 'is-invalid');
  }

  if (state.error) {
    feedbackContainer.classList.replace('text-success', 'text-danger');
  }

  if (state.success) {
    feedbackContainer.classList.replace('text-danger', 'text-success');
  }
};

const toggleButtonAccessibility = (state) => {
  const button = document.querySelector('.btn');

  if (state.valid) {
    button.removeAttribute('disabled');
    return;
  }
  button.setAttribute('disabled', true);
};

export default (state) => {
  const feedContainer = document.querySelector('.feed-container');
  const feedbackContainer = document.querySelector('.feedback');

  watch(state, 'valid', () => {
    toggleInputClassnames(state);
    toggleButtonAccessibility(state);
  });

  watch(state, 'error', () => {
    feedbackContainer.innerText = state.error;
    toggleInputClassnames(state);
  });

  watch(state, 'success', () => {
    feedbackContainer.innerText = state.success;
  });


  watch(state, 'rssItems', (_prop, _action, newItems, oldItems) => {
    if (newItems.length !== oldItems.length) {
      const newItem = last(newItems);
      const article = buildArticle(newItem);
      feedContainer.append(article);
      return;
    }
    feedContainer.innerHTML = '';
    newItems.forEach((item) => {
      const article = buildArticle(item);
      feedContainer.append(article);
    });
  });
};
