const getTitle = (el) => el.querySelector('title').textContent;

export default (data) => {
  try {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(data, 'text/xml');
    const title = getTitle(doc);
    const description = doc.querySelector('description').textContent;
    const items = doc.querySelectorAll('item');
    const posts = [...items].map((i) => {
      const link = i.querySelector('link').textContent;
      return { text: getTitle(i), link };
    });
    return {
      title, description, posts, error: null,
    };
  } catch (e) {
    throw new Error(e);
  }
};
