import "./scss/index.scss";

// Кастомный модуль запросов
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return cb;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return cb;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Инициализация http модуля
const http = customHttp();

// start
document.addEventListener("DOMContentLoaded", function () {
  loadNews();
});

// Elements
const form = document.forms["form"];
const countrySelect = document.querySelector(".js-select-country");
const categorySelect = document.querySelector(".js-select-category");
const searchInput = document.querySelector(".form-autocomplete-input");
const selects = document.querySelectorAll(".js-select");

selects.forEach((item) => {
  item.addEventListener("change", () => (searchInput.value = ""));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const county = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(county, category, onGetResponce);
  } else {
    newsService.everything(searchText, onGetResponce);
  }
});

// app
const newsService = (function () {
  const apiKey = "ebcf8661ed97433fa9f4d00301d67550";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadlines(country = "us", category = "general", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// Функция загрузки новостей
function loadNews() {
  newsService.topHeadlines("ru", "general", onGetResponce);
}

// Функция получения ответа от сервера
function onGetResponce(err, res) {
  if (err) {
    showAlert(err, "toast-error");
  }

  if (!res.articles.length) {
    const msg = "Новостей по вашему запросу не найдено :(";
    showAlert(msg);
    return;
  }

  renderNews(res.articles);
}

// Функция создания новостей
function renderNews(news) {
  const newsContainer = document.querySelector(".js-container-news");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  const imgPlug =
    "https://prodamtext.com/wp-content/uploads/2017/09/%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8-%D0%B4%D0%BB%D1%8F-%D1%81%D0%B0%D0%B9%D1%82%D0%BE%D0%B2-%D0%BF%D0%BE%D1%87%D0%B5%D0%BC%D1%83-%D0%BE%D0%BD%D0%B8-%D0%B2%D0%B0%D0%B6%D0%BD%D1%8B.jpg";
  let fragment = "";
  news.forEach((newsItem) => {
    if (!newsItem.urlToImage || newsItem.urlToImage === "https:") {
      newsItem.urlToImage = imgPlug;
    }

    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);

  const imgList = document.querySelectorAll(".img-responsive");
  imgList.forEach((img) => {
    img.onerror = () => img.setAttribute("src", `${imgPlug}`);
  });
}

// Функция создания одной новости
function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="column col-6 col-xs-12 col-sm-12">
      <div class="card card_modify">
        <div class="card-image"><img class="img-responsive" loading="lazy" src="${urlToImage}"></div>
        <div class="card-header">
          <div class="card-title h5">${title || ""}</div>
        </div>
        <div class="card-body">${description || ""}</div>
        <div class="card-footer"><a class="btn btn-primary" href="${url}">Читать</a></div>
      </div>
    </div>
  `;
}

// Функция очистки контейнера
function clearContainer(container) {
  container.innerHTML = "";
}

// Helpers

// Функция показа ошибки
function showAlert(msg, type = "") {
  const error = renderAlertTemplate(msg, type);
  const wrapper = document.querySelector(".wrapper");
  wrapper.insertAdjacentHTML("afterbegin", error);

  setTimeout(() => {
    wrapper.querySelector(".toast_custom").classList.add("show");
  });

  setTimeout(() => {
    wrapper.querySelector(".toast_custom").classList.remove("show");
  }, 2000);
}

// Функция создания ошибоки
function renderAlertTemplate(msg, type = "") {
  return `
    <div class="toast toast_custom ${type}">
      ${msg}
    </div>
  `;
}
