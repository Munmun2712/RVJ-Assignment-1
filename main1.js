document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const usersPerPage = 7;

    function loadUsers(page) {
        fetch(`https://gorest.co.in/public-api/users?page=${page}`, {
            headers: {
                'Authorization': 'Bearer 9d3ec6256c696462f23ebfb0eee0a7c1a1ad6819f398740ae7dfd4bb579e5ba9'
            }
        })
        .then(response => response.json())
        .then(data => {
            displayUsers(data.data);
            setupPagination(data.meta.pagination);
            currentPage = page;
        })
        .catch(error => console.error('Error:', error));
    }

    function displayUsers(users) {
        const userTableBody = document.getElementById('userTableBody');
        userTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>
                    <span class="action-link" data-id="${user.id}" data-action="show">Show</span> |
                    <span class="action-link" data-id="${user.id}" data-action="edit">Edit</span> |
                    <span class="action-link" data-id="${user.id}" data-action="delete">Delete</span>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        document.querySelectorAll('.action-link').forEach(link => {
            link.addEventListener('click', handleAction);
        });
    }

    function setupPagination(pagination) {
        const paginationDiv = document.getElementById('pagination');
        paginationDiv.innerHTML = '';

        if (pagination.page > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '<<';
            prevButton.onclick = () => loadUsers(pagination.page - 1);
            paginationDiv.appendChild(prevButton);
        }

        for (let i = 1; i <= pagination.pages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === pagination.page) {
                pageButton.disabled = true;
            }
            pageButton.onclick = () => loadUsers(i);
            paginationDiv.appendChild(pageButton);
        }

        if (pagination.page < pagination.pages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '>>';
            nextButton.onclick = () => loadUsers(pagination.page + 1);
            paginationDiv.appendChild(nextButton);
        }
    }

    function handleAction(event) {
        const userId = event.target.dataset.id;
        const action = event.target.dataset.action;

        switch (action) {
            case 'show':
                showUser(userId);
                break;
            case 'edit':
                editUser(userId);
                break;
            case 'delete':
                confirmDelete(userId);
                break;
        }
    }

    function confirmDelete(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
        }
    }

    function deleteUser(userId) {
        fetch(`https://gorest.co.in/public-api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer 9d3ec6256c696462f23ebfb0eee0a7c1a1ad6819f398740ae7dfd4bb579e5ba9'
            }
        })
        .then(() => {
            loadUsers(currentPage);
        })
        .catch(error => console.error('Error:', error));
    }

    function showUser(userId) {
        fetch(`https://gorest.co.in/public-api/users/${userId}`, {
            headers: {
                'Authorization': 'Bearer 9d3ec6256c696462f23ebfb0eee0a7c1a1ad6819f398740ae7dfd4bb579e5ba9'
            }
        })
        .then(response => response.json())
        .then(data => {
            const user = data.data;
            alert(`Name: ${user.name}\nEmail: ${user.email}\nGender: ${user.gender}\nStatus: ${user.status}`);
        })
        .catch(error => console.error('Error:', error));
    }

    function editUser(userId) {
        fetch(`https://gorest.co.in/public-api/users/${userId}`, {
            headers: {
                'Authorization': 'Bearer 9d3ec6256c696462f23ebfb0eee0a7c1a1ad6819f398740ae7dfd4bb579e5ba9'
            }
        })
        .then(response => response.json())
        .then(data => {
            const user = data.data;
            openUserForm(user);
        })
        .catch(error => console.error('Error:', error));
    }

    function openUserForm(user = {}) {
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('gender').value = user.gender || 'male';
        document.getElementById('status').checked = user.status === 'active';
        document.getElementById('userId').value = user.id || '';

        document.getElementById('userFormModal').style.display = 'block';
    }

    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('userFormModal').style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == document.getElementById('userFormModal')) {
            document.getElementById('userFormModal').style.display = 'none';
        }
    }

    document.getElementById('userForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const user = {
            name: event.target.name.value,
            email: event.target.email.value,
            gender: event.target.gender.value,
            status: event.target.status.checked ? 'active' : 'inactive'
        };

        const userId = event.target.userId.value;
        if (userId) {
            updateUser(userId, user);
        } else {
            createUser(user);
        }
    });

    function createUser(user) {
        fetch('https://gorest.co.in/public-api/users', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 9d3ec6256c696462f23ebfb0eee0a7c1a1ad6819f398740ae7dfd4bb579e5ba9',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(() => {
            loadUsers(currentPage);
            document.getElementById('userFormModal').style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    }

    function updateUser(userId, user) {
        fetch(`https://gorest.co.in/public-api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer 9d3ec6256c696462f23ebfb0eee0a7c1a1ad6819f398740ae7dfd4bb579e5ba9',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(() => {
            loadUsers(currentPage);
            document.getElementById('userFormModal').style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    }

    document.getElementById('addUserButton').addEventListener('click', function() {
        openUserForm();
    });

    loadUsers(currentPage);
});
