const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
// const SHOW_URL = INDEX_URL + "id";
const users = [];
const dataPanel = document.querySelector("#data-panel");
let filteredUsers = [];
const USERS_PER_PAGE = 20;

axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    
    //或寫成function (res) {
    //users = res.data.results;

    renderUserList(getUsersByPage(1));
    renderPaginator(users.length);
  })
  .catch((err) => console.log(err));

function renderUserList(list) {
  let rawHTML = "";
  list.forEach((data) => {
    rawHTML += `

  <div class="col-sm-3">
  <div class="mb-2 user-area">
        <div class="card">
          <img src="${data.avatar}" class="card-img-top" alt="user" >
          <div class="card-body">
          <div class="name-gender">
            <span class="card-text">${data.name} ${data.surname}</span>
            <span>
              ${getgender(data.gender)} ${data.age}歲 
            </span>
</div>
      <button class="btn btn-outline-primary btn-show-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${
        data.id
      }">More</button>
      <button type="button" class="btn btn-outline-info btn-add-favorite" data-id="${
        data.id}"><i class="fas fa-heart"></i></button>
</div>
          </div>
        </div>
           </div>
      </div>
    </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

dataPanel.addEventListener("click", function onImageClicked(event) {
  if (event.target.matches(".btn-show-info")) {
    // 用dataset，在要click的物件上加上data-id，可以找到對應的user，
    // dataset的結果是字串，所以下面要轉成數字。
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    //添加震動效果
    event.target.classList.add("heartbeat");

    //移除震動效果（在動畫结束後）
    //event.target.addEventListener("animationend", () => {
    //event.target.classList.remove("heartbeat");

    addToFavorite(Number(event.target.dataset.id));
    //});
  }
});

function showUserModal(id) {
  const modalAvatar = document.querySelector("#user-modal-avatar");
  const modalName = document.querySelector("#user-modal-title");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalBirthday = document.querySelector("#user-modal-birthday");

  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalAvatar.innerHTML = "";
  modalName.innerText = "";
  modalEmail.innerText = "";
  modalGender.innerText = "";
  modalAge.innerText = "";
  modalRegion.innerText = "";
  modalBirthday.innerText = "";

  axios.get(INDEX_URL + id).then((response) => {
    const content = response.data;
    modalAvatar.innerHTML = `<img src="${content.avatar}" alt="user-avatar" class="img-fluid">`;
    modalName.innerText = `${content.name} ${content.surname}`;
    modalEmail.innerText = `Email : ${content.email}`;
    modalGender.innerText = `Gender : ${content.gender}`;
    modalAge.innerText = `Age : ${content.age}`;
    modalRegion.innerText = `Region : ${content.region}`;
    modalBirthday.innerText = `Birthday : ${content.birthday}`;
  });
}

//搜尋功能設定
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  //沒有key in任何字在搜尋欄
  if (!keyword.length) {
    return alert("請輸入有效字串！");
  }

  //用迴圈的話
  //for ( const user of users ) {
  //if (user.name + user.surname.toLowerCase.includes (keyword)) {
  //filteredUsers.push(users)
  //}

  filteredUsers = users.filter((user) =>
    (user.name + user.surname).toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的使用者`);
  }

  renderUserList(getUsersByPage(1));
  renderPaginator(users.length);
});

//設定加到我的最愛功能
function addToFavorite(id) {
  // list每次讀取，從local Storage以JSON物件形式拿取，若左邊有東西，list會顯示左邊東西; 否則則為右邊空陣列
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  const user = users.find((user) => user.id === id);

  if (list.some((user) => user.id === id)) {
    return alert("此使用者已經加到我的最愛中！");
  }

  // 將list中資料轉成JSON字串形式放入local Storage
  list.push(user);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users;
  //計算起始 index
  const startIndex = (page - 1) * USERS_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

const paginator = document.querySelector("#paginator");

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面
  renderUserList(getUsersByPage(page));
});

//設定user性別icon
function getgender(user) {
  if (user === "male") {
    return '<i class="fa-solid fa-person" style="color: #008efa;"></i>';
  } else {
    return '<i class="fa-solid fa-person" style="color: #df4985;"></i>';
  }
}
