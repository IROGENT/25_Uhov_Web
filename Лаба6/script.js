document.addEventListener('DOMContentLoaded', function() {  // жду загрузку страницы перед выполнением кода
    const contentBlock = document.getElementById('content');
    const loadingBlock = document.getElementById('loading');
    const errorBlock = document.getElementById('error');
    const emptyBlock = document.getElementById('empty');
    const api_Title = document.getElementById('api_title');

    let myPosts = [];
    let nextId = 101;

    function showLoading() {
        contentBlock.classList.add('hidden');
        loadingBlock.classList.remove('hidden');
        errorBlock.classList.add('hidden');
        emptyBlock.classList.add('hidden');
    }

    function showContent() {
        contentBlock.classList.remove('hidden');
        loadingBlock.classList.add('hidden');
        errorBlock.classList.add('hidden');
        emptyBlock.classList.add('hidden');
    }

    function showError() {
        contentBlock.classList.add('hidden');
        loadingBlock.classList.add('hidden');
        errorBlock.classList.remove('hidden');
        emptyBlock.classList.add('hidden');
    }

    function showNothing() {
        contentBlock.classList.add('hidden');
        loadingBlock.classList.add('hidden');
        errorBlock.classList.add('hidden');
        emptyBlock.classList.remove('hidden');
    }

    function refreshMyPosts() {
        const Block = document.getElementById('my_posts');
        if (!Block) return;

        if (myPosts.length === 0) {
            Block.innerHTML = '<p class="no_posts">Нет постов</p>';
            return;
        }

        const html = `
            <div class="arr_my_posts">
                ${myPosts.map(post => `
                    <div class="my_post_block">
                        <h4>${post.title}</h4>
                        <p>${post.body}</p>
                        <small>ID поста: ${post.id}</small>
                    </div>
                `).join('')}
            </div>
        `;
        Block.innerHTML = html;
    }

    async function loadGitHub() {
        api_Title.textContent = 'Репозитории GitHub';
        showLoading();

        try {
            const res = await fetch('https://api.github.com/users/google/repos');
            if (!res.ok) throw new Error('Ошибка HTTP: ' + res.status);
            const GitHub = await res.json();

            if (!GitHub || !GitHub.length) {
                showNothing();
                return;
            }

            const html = `
                <div class="repos_grid">
                    ${GitHub.slice(0, 6).map(repo => `
                        <div class="repo_card">
                            <h3>${repo.name}</h3>
                            <p>${repo.description || 'Нет описания'}</p>
                            <a href="${repo.html_url}" target="_blank">Репозиторий</a>
                        </div>
                    `).join('')}
                </div>
            `;
            contentBlock.innerHTML = html;
            showContent();
        } catch (err) {
            console.error('GitHub ошибка:', err);
            showError();
        }
    }

    async function loadPosts() {
        api_Title.textContent = 'Тестовые посты';
        showLoading();

        try {
            const res = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!res.ok) throw new Error('Ошибка HTTP: ' + res.status);
            const posts = await res.json();

            if (!posts || !posts.length) {
                showNothing();
                return;
            }

            const random_post_id = Math.floor(Math.random() * 100) + 1;
            if (random_post_id >= 96) {random_post_id -= 6} // с тернарным оператором не работает, не знаю почему
            const arr_random_posts = posts.slice(random_post_id, random_post_id + 6);
            const html = `
                <div class="posts_grid">
                    ${arr_random_posts.map(post => `
                        <div class="post_card">
                            <h3>${post.title}</h3>
                            <p>${post.body.substring(0, 100)}...</p>
                        </div>
                    `).join('')}
                </div>
            `;
            contentBlock.innerHTML = html;
            showContent();
        } catch (err) {
            console.error('JSONPlaceholder ошибка:', err);
            showError();
        }
    }

    async function loadKotiki() {
        api_Title.textContent = 'Факты о кошках';
        showLoading();

        try {
            const res = await fetch('https://catfact.ninja/facts?limit=6'); // лимит для норм вывода
            if (!res.ok) throw new Error('Ошибка HTTP: ' + res.status);
            const facts = await res.json();

            if (!facts || !facts.data || !facts.data.length) {
                showNothing();
                return;
            }

            const html = `
                <div class="facts_grid">
                    ${facts.data.map((fact, i) => `
                        <div class="fact_card">
                            <h3>Факт №${i + 1}</h3>
                            <p>${fact.fact}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            contentBlock.innerHTML = html;
            showContent();
        } catch (err) {
            console.error('Cat Facts ошибка:', err);
            showError();
        }
    }

    const Buttons = document.querySelectorAll('.head_button');

    Buttons.forEach(button => {
        button.addEventListener('click', function() {
            Buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            const api = button.dataset.api;
            if (api === 'github') loadGitHub();
            else if (api === 'posts') loadPosts();
            else if (api === 'kotiki') loadKotiki();
        });
    });

    function postExists(id) {
        return myPosts.some(post => post.id === id);
    }

    const postForm = document.getElementById('post_form');
    const postResult = document.getElementById('post_result');

    postForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // не даю странице перезагрузиться
        const title = document.getElementById('post_title').value.trim();
        const body = document.getElementById('post_body').value.trim();

        if (!title || !body) {
            postResult.className = 'error';
            postResult.textContent = 'Заполните заголовок и содержание';
            return;
        }
        postResult.className = '';
        postResult.textContent = 'Отправка...';

        try {
            const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, userId: 1 })
            });
            if (!res.ok) throw new Error();

            const newId = nextId++;

            myPosts.unshift({ id: newId, title: title, body: body });
            refreshMyPosts();

            postResult.className = 'success';
            postResult.textContent = 'Создан пост с ID ' + newId;
            postForm.reset();
        } catch (err) {
            postResult.className = 'error';
            postResult.textContent = 'Ошибка отправки';
        }
    });

    const putForm = document.getElementById('put_form');
    const putResult = document.getElementById('put_result');

    putForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('put_id').value.trim());
        const title = document.getElementById('put_title').value.trim();
        const body = document.getElementById('put_body').value.trim();

        if (!id || isNaN(id)) {
            putResult.className = 'error';
            putResult.textContent = 'Введите существующий ID поста';
            return;
        }

        if (!title || !body) {
            putResult.className = 'error';
            putResult.textContent = 'Заполните заголовок и содержание';
            return;
        }

        if (!postExists(id)) {
            putResult.className = 'error';
            putResult.textContent = 'Пост ID ' + id + ' не существует. Создайте пост.';
            return;
        }

        putResult.className = '';
        putResult.textContent = 'Обновление...';

        try {
            await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title, body, userId: 1 })
            });

            const index = myPosts.findIndex(p => p.id === id);
            if (index !== -1) {
                myPosts[index] = { id: id, title: title, body: body };
            }
            refreshMyPosts();

            putResult.className = 'success';
            putResult.textContent = 'Обновлён пост с ID ' + id;
            putForm.reset();
        } catch (err) {
            putResult.className = 'error';
            putResult.textContent = 'Ошибка обновления';
        }
    });

    const deleteForm = document.getElementById('delete_form');
    const deleteResult = document.getElementById('delete_result');

    deleteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('delete_id').value.trim());

        if (!id || isNaN(id)) {
            deleteResult.className = 'error';
            deleteResult.textContent = 'Введите корректный ID поста';
            return;
        }

        if (!postExists(id)) {
            deleteResult.className = 'error';
            deleteResult.textContent = 'Пост ID ' + id + ' не существует.';
            return;
        }

        deleteResult.className = '';
        deleteResult.textContent = 'Удаление...';

        try {
            await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
                method: 'DELETE'
            });

            myPosts = myPosts.filter(p => p.id !== id);
            refreshMyPosts();

            deleteResult.className = 'success';
            deleteResult.textContent = 'Пост с ID ' + id + ' удалён';
            deleteForm.reset();
        } catch (err) {
            deleteResult.className = 'error';
            deleteResult.textContent = 'Ошибка удаления';
        }
    });

    const retryButton = document.querySelector('.retry_btn');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            const active = document.querySelector('.head_button.active');
            if (active) active.click();
            else loadGitHub();
        });
    }

    loadGitHub();
});