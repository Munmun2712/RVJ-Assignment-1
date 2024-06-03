const apiBaseUrl = 'https://gorest.co.in/public-api/users';
const apiToken = 'e739b05ab5bf3901f3eb4b84f2d425fd10af7aadc1baf43afd5deaf889cc5ebe'; 

let currentPage = 1;
const usersPerPage = 7;

document.addEventListener('DOMContentLoaded', () => {
    loadUsers(currentPage);
    setupFormModal();
});

function loadUsers(page) {
    fetch(`${apiBaseUrl}?page=${page}`, {
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const users = data.data;
            displayUsers(users, page);
            setupPagination(data.meta.pagination);
        })
        .catch(error => console.error('Error fetching users:', error));
}

function displayUsers(users, page) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${(page - 1) * usersPerPage + index + 1}</td>
            <td>${user.name}</td>
            <td class="actions">
                <a href="#" onclick="showUser(${user.id})">Show</a>
                <a href="#" onclick="editUser(${user.id})">Edit</a>
                <a href="#" onclick="deleteUser(${user.id})">Delete</a>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

function setupPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (pagination.page > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerText = '<<';
        prevBtn.onclick = () => loadUsers(pagination.page - 1);
        paginationDiv.appendChild(prevBtn);
    }

    for (let i = 1; i <= pagination.pages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i;
        if (i === pagination.page) {
            pageBtn.disabled = true;
        }
        pageBtn.onclick = () => loadUsers(i);
        paginationDiv.appendChild(pageBtn);
    }

    if (pagination.page < pagination.pages) {
        const nextBtn = document.createElement('button');
        nextBtn.innerText = '>>';
        nextBtn.onclick = () => loadUsers(pagination.page + 1);
        paginationDiv.appendChild(nextBtn);
    }
}

document.getElementById('newUserBtn').addEventListener('click', () => {
    openFormModal();
});

function openFormModal(user = {}) {
    const modal = document.getElementById('userFormModal');
    const form = document.getElementById('userForm');

    form.name.value = user.name || '';
    form.email.value = user.email || '';
    form.gender.value = user.gender || 'male';
    form.status.checked = user.status === 'active';
    form.userId.value = user.id || '';

    modal.style.display = 'block';
}

function setupFormModal() {
    const modal = document.getElementById('userFormModal');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('userForm');

    span.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    form.onsubmit = (event) => {
        event.preventDefault();
        const user = {
            name: form.name.value,
            email: form.email.value,
            gender: form.gender.value,
            status: form.status.checked ? 'active' : 'inactive'
        };
        const userId = form.userId.value;

        if (userId) {
            updateUser(userId, user);
        } else {
            createUser(user);
        }
    };
}

function createUser(user) {
    fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .then(() => {
            loadUsers(currentPage);
            closeFormModal();
        })
        .catch(error => console.error('Error creating user:', error));
}

function updateUser(userId, user) {
    fetch(`${apiBaseUrl}/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .then(() => {
            loadUsers(currentPage);
            closeFormModal();
        })
        .catch(error => console.error('Error updating user:', error));
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    fetch(`${apiBaseUrl}/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    })
        .then(() => {
            loadUsers(currentPage);
        })
        .catch(error => console.error('Error deleting user:', error));
}

function showUser(userId) {
    fetch(`${apiBaseUrl}/${userId}`, {
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const user = data.data;
            alert(`Name: ${user.name}\nEmail: ${user.email}\nGender: ${user.gender}\nStatus: ${user.status}`);
        })
        .catch(error => console.error('Error fetching user details:', error));
}

function editUser(userId) {
    fetch(`${apiBaseUrl}/${userId}`, {
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const user = data.data;
            openFormModal(user);
        })
        .catch(error => console.error('Error fetching user details:', error));
}

function closeFormModal() {
    const modal = document.getElementById('userFormModal');
    modal.style.display = 'none';
}
