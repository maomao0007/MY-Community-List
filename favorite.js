const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
// const SHOW_URL = INDEX_URL + "id";
const users = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
const dataPanel = document.querySelector("#data-panel");
let filteredUsers = [];
const USERS_PER_PAGE = 20;

console.log("localStorage content:", localStorage.getItem("favoriteUsers"));
console.log("parsed users:", users);

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
      <button type="button" class="btn btn-outline-danger btn-remove-favorite" data-id="${
        data.id
      }">X</button>
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
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
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

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  //if (!keyword.length) {
  //  return alert("請輸入有效字串！");
  //}

   if (keyword === "") {
   // 如果搜索框為空，直接列出所有使用者
   filteredUsers = users;
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

  renderPaginator(users.length);
  renderUserList(getUsersByPage(1));
});

function removeFromFavorite(id) {
  //如果user為空或user長度為0，則跳出
  if (!users || !users.length) return;

  //透過 id 找到要刪除 user的 index，找不到則跳出
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return;

  //刪除該筆電影
  users.splice(userIndex, 1);

  //存回 local storage
  localStorage.setItem("favoriteUsers", JSON.stringify(users));

  // 更新頁面
  renderUserList(getUsersByPage(1));

  // 更新分頁器
  renderPaginator(users.length);
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
renderPaginator(filteredUsers.length);
renderUserList(getUsersByPage(1));

//設定user性別icon
function getgender(user) {
  if (user === "male") {
    return '<i class="fa-solid fa-person" style="color: #008efa;"></i>';
  } else {
    return '<i class="fa-solid fa-person" style="color: #df4985;"></i>';
  }
}
