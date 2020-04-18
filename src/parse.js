const getTitle = (el) => el.querySelector('title').textContent;

export default (data) => {
  const domparser = new DOMParser();
  try {
    const doc = domparser.parseFromString(data, 'text/xml');
    const title = getTitle(doc);
    const description = doc.querySelector('description').textContent;
    const items = doc.querySelectorAll('item');
    const rssLinks = [...items].map((i) => {
      const link = i.querySelector('link').textContent;
      return { text: getTitle(i), link };
    });
    return {
      title, description, rssLinks, error: null,
    };
  } catch (e) {
    throw new Error(e);
  }
};
