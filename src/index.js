import { string, mixed } from 'yup';
import axios from 'axios';
import parse from './parse';
import render from './render';
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
    state.error = 'Not a valid url';
    state.valid = false;
    return;
  }

  if (!duplicateSchema.isValidSync(value)) {
    state.error = 'This url has already been added';
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
      state.success = 'RSS has been added';
    })
    .catch((err) => {
      state.error = err.message;
    });

  state.valid = false;
  form.reset();
};

input.addEventListener('input', handleChange);
form.addEventListener('submit', handleSubmit);
render(state);
