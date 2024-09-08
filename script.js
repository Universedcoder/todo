document.addEventListener("DOMContentLoaded", () => {
    const categories = document.querySelectorAll('.categories li');
    const taskList = document.getElementById('task-list');
    const selectedCategoryElement = document.getElementById('selected-category');
    const addTaskButton = document.getElementById('add-task-button');
    const newTaskInput = document.getElementById('new-task-input');
    const progressBar = document.getElementById('progress-bar');
    const editProfileButton = document.getElementById('edit-profile-button');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeModalButton = document.querySelector('.modal .close');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePic = document.getElementById('profile-pic');
    const addNewListButton = document.getElementById('add-new-list');

    const tasks = JSON.parse(localStorage.getItem('tasks')) || {
        'my-day': [],
        'important': [],
        'planned': [],
        'assigned-to-you': [],
        'tasks': [],
        'custom-grocery-list': [],
        'custom-mobile-report-publisher': []
    };

    categories.forEach(category => {
        if (category.dataset.category !== 'add-new-list') {
            addDeleteIconToCategory(category);
        }

        category.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-list-icon')) {
                const categoryToDelete = category.dataset.category;
                deleteCategory(categoryToDelete);
                category.remove();
            } else {
                const selectedCategory = category.dataset.category;
                setSelectedCategory(selectedCategory, category.textContent.trim().split(' ')[0]);
            }
        });
    });

    addNewListButton.addEventListener('click', () => {
        const newListName = prompt('Enter the name of the new list:');
        if (newListName) {
            const formattedListName = newListName.toLowerCase().replace(/\s+/g, '-');
            const newListCategory = `custom-${formattedListName}`;

            tasks[newListCategory] = [];

            const newListItem = document.createElement('li');
            newListItem.dataset.category = newListCategory;
            newListItem.className = 'category-item';
            newListItem.innerHTML = `
                ${newListName} <span class="task-count" id="count-${newListCategory}">0</span>
            `;
            addDeleteIconToCategory(newListItem);
            document.querySelector('.categories').insertBefore(newListItem, addNewListButton);

            newListItem.addEventListener('click', (event) => {
                if (event.target.classList.contains('delete-list-icon')) {
                    const categoryToDelete = newListItem.dataset.category;
                    deleteCategory(categoryToDelete);
                    newListItem.remove();
                } else {
                    setSelectedCategory(newListItem.dataset.category, newListName);
                }
            });

            saveTasks();
        }
    });

    addTaskButton.addEventListener('click', () => {
        const taskName = newTaskInput.value.trim();
        if (taskName) {
            const selectedCategory = selectedCategoryElement.dataset.category || 'tasks';
            const newTask = {
                name: taskName,
                categories: [selectedCategory],
                completed: false,
                important: false,
                dueDate: null
            };
            tasks[selectedCategory].push(newTask);
            renderTasks(selectedCategory);
            saveTasks();
            newTaskInput.value = '';
        } else {
            alert("Task name cannot be empty!");
        }
    });

    function setSelectedCategory(category, categoryName) {
        selectedCategoryElement.textContent = categoryName;
        selectedCategoryElement.dataset.category = category;
        renderTasks(category);
    }

    function renderTasks(category) {
        taskList.innerHTML = '';
        tasks[category].forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            
            taskItem.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-name">${task.name}</span>
                <span class="task-categories">${task.categories.join(', ')}</span>
                <span class="due-date">${task.dueDate ? `Due: ${task.dueDate}` : ''}</span>
                <div class="task-actions">
                    <span class="star-icon">${task.important ? '★' : '☆'}</span>
                    <span class="delete-icon">🗑️</span>
                </div>
            `;

            taskItem.querySelector('input[type="checkbox"]').addEventListener('click', () => {
                task.completed = !task.completed;
                saveTasks();
                updateProgressBar(category);
            });

            taskItem.querySelector('.star-icon').addEventListener('click', () => {
                task.important = !task.important;
                if (task.important) {
                    tasks.important.push(task);
                } else {
                    tasks.important = tasks.important.filter(t => t.name !== task.name);
                }
                renderTasks(category);
                updateTaskCount('important');
                saveTasks();
            });

            taskItem.querySelector('.delete-icon').addEventListener('click', () => {
                tasks[category] = tasks[category].filter(t => t !== task);
                renderTasks(category);
                saveTasks();
                updateProgressBar(category);
            });

            taskList.appendChild(taskItem);
        });
        updateTaskCount(category);
        updateProgressBar(category);
    }

    function updateTaskCount(category) {
        document.getElementById(`count-${category}`).textContent = tasks[category].length;
    }

    function updateProgressBar(category) {
        const totalTasks = tasks[category].length;
        const completedTasks = tasks[category].filter(task => task.completed).length;
        const progressPercentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addDeleteIconToCategory(category) {
        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'delete-list-icon';
        deleteIcon.innerHTML = '🗑️';
        category.appendChild(deleteIcon);
    }

    function deleteCategory(category) {
        delete tasks[category];
        saveTasks();
    }

    // Edit Profile Modal
    editProfileButton.addEventListener('click', () => {
        editProfileModal.style.display = 'block';
        document.getElementById('edit-profile-name').value = profileName.textContent;
        document.getElementById('edit-profile-email').value = profileEmail.textContent;
    });

    closeModalButton.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    editProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('edit-profile-name').value.trim();
        const email = document.getElementById('edit-profile-email').value.trim();

        if (name && email) {
            profileName.textContent = name;
            profileEmail.textContent = email;

            const profilePicInput = document.getElementById('edit-profile-pic');
            if (profilePicInput.files && profilePicInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePic.src = e.target.result;
                };
                reader.readAsDataURL(profilePicInput.files[0]);
            }

            editProfileModal.style.display = 'none';
        } else {
            alert('Name and email cannot be empty!');
        }
    });
});