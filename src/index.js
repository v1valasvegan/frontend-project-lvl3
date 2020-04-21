import { string, mixed } from 'yup';
import { uniqueId, noop } from 'lodash';
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

const addTimer = (item) => setTimeout(() => {
  const { url, id } = item;
  const processedUrl = `${corsApiUrl}/${url}`;
  axios(processedUrl)
    .then(({ data, status }) => ({ data, status }))
    .then(({ data, status }) => {
      if (status === 200) {
        return parse(data);
      }
      throw new Error(`Request status ${status}`);
    })
    .then((parsed) => {
      const updatedRssItems = state.rssItems.map((i) => (i.id === id ? { ...i, parsed } : i));
      state.rssItems = updatedRssItems;
    })
    .catch(() => noop());
  addTimer(item);
}, 20000);

const handleSubmit = (e) => {
  e.preventDefault();
  const { rssItems } = state;
  const formData = new FormData(e.target);
  const rssUrl = formData.get('input');
  const url = `${corsApiUrl}/${rssUrl}`;
  axios(url)
    .then(({ data }) => data)
    .then((data) => parse(data))
    .then((parsed) => {
      const newRssItem = { ...parsed, url: rssUrl, id: uniqueId() };
      addTimer(newRssItem);
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
