const buildListItem = ({ text, link }) => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.innerText = text;
  a.setAttribute('href', link);
  li.append(a);
  return li;
};

export default (rss) => {
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
