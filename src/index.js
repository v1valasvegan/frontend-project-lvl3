import { string, mixed } from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import parse from './parse';
import render from './render';
import resources from './locales/en';
import './style.scss';

const state = {
  valid: null,
  rssItems: [],
  error: null,
  success: null,
};
const urlSchema = string().url();
const input = document.querySelector('.form-control');
const form = document.querySelector('.form-group');
const corsApiUrl = 'https://cors-anywhere.herokuapp.com';

const handleChange = ({ target: { value } }) => {
  const rssUrls = state.rssItems.map(({ url }) => url);
  const duplicateSchema = mixed().notOneOf(rssUrls);
  if (!urlSchema.isValidSync(value) || value === '') {
    state.error = i18next.t('errors.notValid');
    state.valid = false;
    return;
  }

  if (!duplicateSchema.isValidSync(value)) {
    state.error = i18next.t('errors.duplicate');
    state.valid = false;
    return;
  }

  if (state.success) {
    state.success = '';
  }

  state.valid = true;
  state.error = null;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const { rssItems } = state;
  const formData = new FormData(e.target);
  const rssUrl = formData.get('input');
  const url = `${corsApiUrl}/${rssUrl}`;
  axios(url)
    .then(({ data }) => data)
    .then((data) => parse(data))
    .then((newItem) => {
      const newRssItem = { ...newItem, url: rssUrl };
      state.rssItems = [...rssItems, newRssItem];
      state.success = i18next.t('success');
    })
    .catch((err) => {
      state.error = err.message;
    });

  state.valid = false;
  form.reset();
};
const app = async () => {
  await i18next.init({ lng: 'en', debug: true, resources });
  input.addEventListener('input', handleChange);
  form.addEventListener('submit', handleSubmit);
  render(state);
};

app();
