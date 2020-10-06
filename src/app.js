/* eslint-disable no-param-reassign */
import { string, object } from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import parse from './parse';
import render from './render';
import resources from './locales/en';
import './style.scss';

const interval = 10000;

const apiUrl = {
  corsApi: () => 'https://cors-anywhere.herokuapp.com',
};

const getLastPostId = (posts) => {
  if (_.isEmpty(posts)) {
    return 0;
  }

  const ids = posts.map(({ id }) => id);
  return Math.max(...ids);
};

const buildSchema = (rssFeeds) => {
  const errorMessages = {
    notValid: i18next.t('errors.notValid'),
    duplicate: i18next.t('errors.duplicate'),
  };

  const rssUrls = rssFeeds.map(({ url }) => url);
  return object().shape({
    form: object({
      text: string()
        .required()
        .url(errorMessages.notValid)
        .notOneOf(rssUrls, errorMessages.duplicate),
    }),
  });
};

const validate = (state) => {
  try {
    const schema = buildSchema(state.content.rssFeeds);
    schema.validateSync(state);
    return null;
  } catch (e) {
    return e.message;
  }
};

const updateValidationState = (state) => {
  const error = validate(state);
  if (error === null) {
    state.form.valid = true;
    state.form.error = null;
    return;
  }
  state.form.valid = false;
  state.form.error = error;
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
      processState: 'empty',
      valid: null,
      error: null,
    },
    content: {
      rssFeeds: [],
      posts: [],
      lastPostId: 0,
    },
  };

  const handleChange = ({ target: { value } }) => {
    state.form.text = value;
    state.form.processState = value === '' ? 'empty' : 'filling';
    updateValidationState(state, errorMessages);
  };

  const addTimer = (feed) => setTimeout(() => {
    const { url } = feed;
    const { content: { posts, lastPostId } } = state;
    const processedUrl = `${apiUrl.corsApi()}/${url}`;
    axios(processedUrl)
      .then(({ data }) => parse(data))
      .then(({ posts: currentFeedPosts }) => {
        const newPosts = _.differenceBy(currentFeedPosts, posts, 'link');
        if (_.isEmpty(newPosts)) {
          return;
        }
        const newPostsWithIds = newPosts.map((p) => ({ ...p, feedId: feed.id, id: _.uniqueId() }));
        state.content.posts = [...newPostsWithIds, ...posts];
        state.content.lastPostId = _.isEmpty(newPosts) ? lastPostId : getLastPostId(posts);
      });
    addTimer(feed);
  }, interval);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssUrl = formData.get('input');
    const url = [apiUrl.corsApi(), rssUrl].join('/');
    state.form.processState = 'requested';
    axios(url)
      .then(({ data }) => data)
      .then((data) => parse(data))
      .then(({
        title, description, posts: parsedPosts,
      }) => {
        const feedId = _.uniqueId();
        const newFeed = {
          title, description, url: rssUrl, id: feedId,
        };
        const newPosts = parsedPosts.map((post) => ({ ...post, feedId, id: _.uniqueId() }));
        addTimer(newFeed);
        state.content.lastPostId = getLastPostId(state.content.posts);
        state.content.posts.push(...newPosts);
        state.content.rssFeeds.push(newFeed);
        state.form.processState = 'finished';
      })
      .catch((err) => {
        state.form.error = err.message;
        state.form.processState = 'failed';
      });
  };

  input.addEventListener('input', handleChange);
  form.addEventListener('submit', handleSubmit);
  render(state);
};

export default app;
