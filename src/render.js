import { last } from 'lodash';
import { watch } from 'melanke-watchjs';
import buildArticle from './buildArticle';

const feedContainer = document.querySelector('.feed-container');
const input = document.querySelector('.form-control');
const feedbackContainer = document.querySelector('.feedback');

const toggleInputClassnames = (state) => {
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

export default (state) => {
  watch(state, 'valid', () => {
    toggleInputClassnames(state);
  });

  watch(state, 'error', () => {
    feedbackContainer.innerText = state.error;
    toggleInputClassnames(state);
  });

  watch(state, 'success', () => {
    feedbackContainer.innerText = state.success;
  });


  watch(state, 'rssItems', () => {
    const newItem = last(state.rssItems);
    const article = buildArticle(newItem);
    feedContainer.append(article);
  });
};
