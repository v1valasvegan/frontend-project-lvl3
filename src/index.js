/* eslint-disable no-param-reassign */
import { string, object } from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import parse from './parse';
import render from './render';
import resources from './locales/en';
import './style.scss';

const routes = {
  corsApi: () => 'https://cors-anywhere.herokuapp.com',
};

const buildSchema = (state, errorMessages) => {
  const rssUrls = state.content.rssFeeds.map(({ url }) => url);
  return object().shape({
    form: object({
      text: string()
        .url(errorMessages.notValid)
        .notOneOf(rssUrls, errorMessages.duplicate)
        .required(errorMessages.notValid),
    }),
  });
};

const validate = (state, errorMessages) => {
  try {
    const schema = buildSchema(state, errorMessages);
    schema.validateSync(state);
    return null;
  } catch (e) {
    return e.message;
  }
};

const updateValidationState = (state, errorMessages) => {
  const error = validate(state, errorMessages);
  if (error === null) {
    state.form.valid = true;
    state.form.error = null;
  } else {
    state.form.valid = false;
    state.form.error = error;
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
    form: {
      text: '',
      processState: 'filling',
      valid: null,
      error: null,
    },
    content: {
      rssFeeds: [],
      posts: [],
    },
  };

  const handleChange = ({ target: { value } }) => {
    state.form.text = value;
    updateValidationState(state, errorMessages);
  };

  const addTimer = (feed) => setTimeout(() => {
    const { url } = feed;
    const { content: { posts } } = state;
    const postsFromUnchangedFeeds = posts.filter(({ feedId }) => feedId !== feed.id);
    const processedUrl = `${routes.corsApi()}/${url}`;
    axios(processedUrl)
      .then(({ data }) => parse(data))
      .then(({ posts: updatedPosts, error }) => {
        if (error) {
          throw new Error(`Parsing error: ${error}`);
        }
        const updatedPostsWithFeedId = updatedPosts.map((p) => ({ ...p, feedId: feed.id }));
        state.content.posts = [...postsFromUnchangedFeeds, ...updatedPostsWithFeedId];
      })
      .catch((e) => {
        throw new Error(e);
      });
    addTimer(feed);
  }, 20000);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { content: { rssFeeds, posts } } = state;
    const formData = new FormData(e.target);
    const rssUrl = formData.get('input');
    const url = [routes.corsApi(), rssUrl].join('/');
    state.form.processState = 'requested';
    try {
      axios(url)
        .then(({ data }) => data)
        .then((data) => parse(data))
        .then(({
          title, description, posts: parsedPosts, error,
        }) => {
          if (error) {
            throw new Error(`Parsing error: ${error}`);
          }
          const feedId = _.uniqueId();
          const newFeed = {
            title, description, url: rssUrl, id: feedId,
          };
          const newPosts = parsedPosts.map((post) => ({ ...post, feedId, id: _.uniqueId() }));
          addTimer(newFeed);
          const updatedFeeds = [...rssFeeds, newFeed];
          const updatedPosts = [...posts, ...newPosts];
          state.content = { posts: updatedPosts, rssFeeds: updatedFeeds };
        })
        .then(() => {
          state.form.processState = 'finished';
          state.form.text = '';
        });
    } catch (err) {
      state.form.error = err.message;
      state.form.processState = 'failed';
    }
  };

  input.addEventListener('input', handleChange);
  form.addEventListener('submit', handleSubmit);
  render(state);
};

app();
