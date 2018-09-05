const blogIndex = getBlogIndex(blogData);

writeFilterNav(document.querySelector('#years'), 'year', Object.keys(blogIndex.data.year).sort().reverse());
writeFilterNav(document.querySelector('#types'), 'category', Object.keys(blogIndex.data.category).sort());

// initiate the filter in UI
document.querySelector('#years a:nth-child(1)').click();


function writeFilterNav(container, indexCat, indexVals) {
  indexVals.forEach(val => {
    const a = document.createElement('a');
    a.setAttribute('href', '');
    a.textContent = val;
    a.onclick = event => showFilteredList(event, indexCat, val);
    container.appendChild(a);
  })
}


function showFilteredList(event, indexCat, indexVal) {
  event.preventDefault();
  document.querySelectorAll('nav a.active').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');

  const now = performance.now(),
        elList = document.querySelector('tbody'),
        indexData = blogIndex.data[indexCat][indexVal];

  renderRowsWithElements(indexData, elList);

  console.log('Rendered ' + indexData.length + ' in ' + (performance.now()-now).toFixed(2)+'ms');
}

function renderRowsWithElements(entryList, elOutput) {
  const fragment = document.createDocumentFragment();

  let blogItem, row, date, cat, title, link, desc, tags;

  entryList.forEach(idx => {
    blogItem = blogData.entries[idx];

    row = document.createElement('tr');

    date = document.createElement('td');
    date.className='date';
    row.appendChild(date);

    cat = document.createElement('td');
    cat.className='cat';
    row.appendChild(cat);

    title = document.createElement('td');
    title.className='title';
    row.appendChild(title);

    link = document.createElement('a');
    link.setAttribute('target', '_blank');
    title.appendChild(link);

    desc = document.createElement('div');
    desc.className='desc';
    title.appendChild(desc);

    tags = document.createElement('td');
    tags.className='tags';
    row.appendChild(tags);

    date.innerText = blogItem.date.substring(0,10);
    cat.innerText = blogItem.category;
    tags.innerText = blogItem.tags.join(', ');
    desc.innerText = blogItem.description;
    link.href = blogItem.url;
    link.innerText = blogItem.title;

    fragment.appendChild(row);
  })

  elOutput.innerHTML = '';
  elOutput.appendChild(fragment);
  document.querySelector('#results').innerText = entryList.length;
}

function getBlogIndex(blogData) {
  const cacheKey = 'albetonBlogIndex';

  // return pre-built if already exists
  const savedItem = localStorage.getItem(cacheKey);
  if (savedItem) {
    const index = JSON.parse(savedItem);
    if (index && index.buildDate && index.buildDate === blogData.buildDate) {
      return index;
    }
  }


  console.log('building new index');
  const index = {
    buildDate: blogData.buildDate,
    data: {}
  };
  const indexData = index.data;
  let date;

  blogData.entries.forEach((o, i) => {
    date = o.date? new Date(o.date) : '';

    addToIndex('year', date ? date.getFullYear() : 'none', i);
    addToIndex('category', o.category || 'none', i);

    // don't index dags, because 808 would show on screen and it's too much for UI
    // o.tags.forEach(tag => addToIndex('tag', tag, i));
  })

  function addToIndex(key, keyValue, blogEntry) {
    if (!indexData.hasOwnProperty(key)) indexData[key] = {};
    if (!indexData[key].hasOwnProperty(keyValue)) indexData[key][keyValue] = [];
    indexData[key][keyValue].push(blogEntry);
  }

  localStorage.setItem(cacheKey, JSON.stringify(index));
  return index;
}