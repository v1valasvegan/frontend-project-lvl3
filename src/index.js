import { string, object } from 'yup';
import { uniqueId, noop } from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import parse from './parse';
import render from './render';
import resources from './locales/en';
import './style.scss';

const routes = {
  corsApi: () => 'https://cors-anywhere.herokuapp.com',
};

const buildSchema = (rssUrls, errorMessages) => (
  object().shape({
    text: string()
      .url(errorMessages.notValid)
      .notOneOf(rssUrls, errorMessages.duplicate)
      .required(errorMessages.notValid),
  }));

const validate = (url, schema) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const updateValidationState = (state, schema) => {
  const error = validate(state, schema);
  if (error === null) {
    state.valid = true;
    state.error = null;
  } else {
    state.valid = false;
    state.error = error;
  }
};

const app = async () => {
  await i18next.init({ lng: 'en', debug: false, resources });

  const errorMessages = {
    notValid: i18next.t('errors.notValid'),
    duplicate: i18next.t('errors.duplicate'),
  };

  const input = document.querySelector('.form-control');
  const form = document.querySelector('.form-group');
  const state = {
    text: '',
    valid: null,
    rssItems: [],
    error: null,
    success: null,
  };

  const handleChange = ({ target: { value } }) => {
    const rssUrls = state.rssItems.map(({ url }) => url);
    const schema = buildSchema(rssUrls, errorMessages);
    state.text = value;
    updateValidationState(state, schema);
  };

  const addTimer = (item) => setTimeout(() => {
    const { url, id } = item;
    const processedUrl = `${routes.corsApi()}/${url}`;
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
    const url = `${routes.corsApi()}/${rssUrl}`;
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

  input.addEventListener('input', handleChange);
  form.addEventListener('submit', handleSubmit);
  render(state);
};

app();
