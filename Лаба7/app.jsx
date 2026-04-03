const { HashRouter, Switch, Route, Link, useLocation } = ReactRouterDOM;

const DataContext = React.createContext(null);

function DataProvider({ children }) {
    const [gitHubRepos, setGitHubRepos] = React.useState([]);
    const [testPosts, setTestPosts] = React.useState([]);
    const [catFacts, setCatFacts] = React.useState([]);

    const [loadingGitHub, setLoadingGitHub] = React.useState(true);
    const [loadingPosts, setLoadingPosts] = React.useState(true);
    const [loadingFacts, setLoadingCatFacts] = React.useState(true);

    const [errorGitHub, setErrorGitHub] = React.useState(null);
    const [errorPosts, setErrorPosts] = React.useState(null);
    const [errorFacts, setErrorFacts] = React.useState(null);

    React.useEffect(() => {
        loadGitHubRepos();
        loadTestPosts();
        loadCatFacts();
    }, []);

    const loadGitHubRepos = async () => {
        setLoadingGitHub(true);
        setErrorGitHub(null);
        try {
            const response = await fetch('https://api.github.com/users/google/repos');
            if (!response.ok) throw new Error('Ошибка загрузки репозиториев GitHub');
            const data = await response.json();
            const reposForCards = data.slice(0, 6).map((repo) => ({
                id: repo.id,
                title: repo.name,
                opisanie: repo.description || 'Описание отсутствует'
            }));
            setGitHubRepos(reposForCards);
        } catch (err) {
            setErrorGitHub('Не удалось загрузить репозитории GitHub');
            setGitHubRepos([]);
        } finally {
            setLoadingGitHub(false);
        }
    };

    const loadTestPosts = async () => {
        setLoadingPosts(true);
        setErrorPosts(null);
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) throw new Error('Ошибка загрузки тестовых постов');
            const data = await response.json();
            let random_post_id = Math.floor(Math.random() * 100) + 1;
            random_post_id = random_post_id >= 96 ? random_post_id - 6 : random_post_id;
            const postsForCards = data.slice(random_post_id, random_post_id + 6).map((post) => ({
                id: post.id,
                title: post.title,
                opisanie: post.body.substring(0, 100) + '...'
            }));
            setTestPosts(postsForCards);
        } catch (err) {
            setErrorPosts('Не удалось загрузить тестовые посты');
            setTestPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    const loadCatFacts = async () => {
        setLoadingCatFacts(true);
        setErrorFacts(null);
        try {
            const response = await fetch('https://catfact.ninja/facts?limit=6');
            if (!response.ok) throw new Error('Ошибка загрузки фактов о котиках (((');
            const data = await response.json();
            const factsCats = data.data.map((fact, index) => ({
                id: index + 1000,
                title: `Факт №${index + 1}`,
                opisanie: fact.fact
            }));
            setCatFacts(factsCats);
        } catch (err) {
            setErrorFacts('Не удалось загрузить факты о котиках (((');
            setCatFacts([]);
        } finally {
            setLoadingCatFacts(false);
        }
    };

    const reloadGitHub = () => loadGitHubRepos();
    const reloadPosts = () => loadTestPosts();
    const reloadFacts = () => loadCatFacts();

    const value = {
        gitHubRepos, testPosts, catFacts,
        loadingGitHub, loadingPosts, loadingFacts,
        errorGitHub, errorPosts, errorFacts,
        reloadGitHub, reloadPosts, reloadFacts
    };

    return React.createElement(DataContext.Provider, { value }, children);
}

function useData() {
    const context = React.useContext(DataContext);
    if (!context) {
        throw new Error('Оберни в DataProvider чтобы использовать данные');
    }
    return context;
}

function App() {
    const [myPosts, setMyPosts] = React.useState([]);
    const [nextId, setNextId] = React.useState(100);

    const addPost = (title, body) => {
        const newPost = { id: nextId, title: title, body: body };
        setMyPosts(prevPosts => [newPost, ...prevPosts]);
        setNextId(prevId => prevId + 1);
    };

    const updatePost = (id, title, body) => {
        setMyPosts(prevPosts => prevPosts.map(post =>
            post.id === id ? { ...post, title, body } : post
        ));
    };

    const deletePost = (id) => {
        setMyPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    };

    const postIsHave = (id) => {
        return myPosts.some(post => post.id === id);
    };

    return React.createElement(
        DataProvider,
        null,
        React.createElement(
            HashRouter,
            null,
            React.createElement(Header, null),
            React.createElement(
                'main',
                null,
                React.createElement(
                    Switch,
                    null,
                    React.createElement(Route, { path: '/github' }, React.createElement(GitHubPage, null)),
                    React.createElement(Route, { path: '/posts' }, React.createElement(PostsPage, null)),
                    React.createElement(Route, { path: '/kotiki' }, React.createElement(CatFactsPage, null)),
                    React.createElement(Route, { path: '/' }, React.createElement(GitHubPage, null))
                ),
                React.createElement(WorkWithAPI, {
                    onAddPost: addPost,
                    onUpdatePost: updatePost,
                    onDeletePost: deletePost,
                    postIsHave: postIsHave
                }),
                React.createElement(MyPosts, { posts: myPosts })
            )
        )
    );
}

function Header() {
    const location = useLocation();
    const path = location.pathname;

    const getActiveTab = () => {
        if (path === '/github') return 'GitHub';
        if (path === '/posts') return 'TestPost';
        if (path === '/kotiki') return 'Kotiki';
        return 'GitHub';
    };

    const activeTab = getActiveTab();

    const buttonStyle = (isActive) => ({
        backgroundColor: isActive ? '#007bff' : '#e0e0e0',
        color: isActive ? 'white' : '#333333',
        fontFamily: 'Segoe UI, sans-serif',
        padding: '8px 20px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '20px',
        cursor: 'pointer',
        margin: '0 5px',
        textDecoration: 'none',
        display: 'inline-block',
    });

    return React.createElement('header',
        {
            style: {
                background: 'white',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }
        },
        React.createElement('h1', {
            style: {
                fontFamily: 'Segoe UI, sans-serif',
                color: '#333333',
                fontSize: '24px',
                marginBottom: '15px'
            }
        }, 'Лаба №7'),
        React.createElement('nav',
            null,
            React.createElement(Link, { to: '/github', style: buttonStyle(activeTab === 'GitHub') }, 'Репозитории GitHub'),
            React.createElement(Link, { to: '/posts', style: buttonStyle(activeTab === 'TestPost') }, 'Тестовые посты'),
            React.createElement(Link, { to: '/kotiki', style: buttonStyle(activeTab === 'Kotiki') }, 'Факты о кошках')
        )
    );
}

function CardsSetka({ cards }) {
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    };

    if (!cards || cards.length === 0) {
        return React.createElement('div', { style: { textAlign: 'center', padding: '40px' } }, 'Нет данных');
    }

    return React.createElement('div',
        { style: gridStyle },
        cards.map(card => React.createElement(Card, { key: card.id, title: card.title, opisanie: card.opisanie }))
    );
}

function Card({ title, opisanie }) {
    const [isHovered, setIsHovered] = React.useState(false);

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: isHovered
            ? '0 4px 15px rgba(0,0,0,0.2)'
            : '0 2px 5px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s'
    };

    return React.createElement('div',
        {
            style: cardStyle,
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false)
        },
        React.createElement('h3', { style: { marginBottom: '10px', color: '#2c3e50' } }, title),
        React.createElement('p', { style: { color: '#7f8c8d' } }, opisanie)
    );
}

function DataLoader({ loading, error, onRetry, children }) {
    if (loading) {
        return React.createElement('div',
            { style: { textAlign: 'center', padding: '40px' } },
            React.createElement('div', {
                style: {
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 15px'
                }
            }),
            React.createElement('p', null, 'Загрузка...'),
            React.createElement('style', null, `@keyframes spin {to { transform: rotate(360deg); }}`)
        );
    }

    if (error) {
        return React.createElement('div',
            { style: { textAlign: 'center', padding: '40px', color: 'red' } },
            React.createElement('p', null, error),
            React.createElement('button', {
                onClick: onRetry,
                style: {
                    marginTop: '15px',
                    padding: '8px 20px',
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }
            }, 'Повторить')
        );
    }
    return children;
}

function GitHubPage() {
    const { gitHubRepos, loadingGitHub, errorGitHub, reloadGitHub } = useData();

    return React.createElement('div',
        { style: { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '1200px', margin: '0 auto 30px' } },
        React.createElement('h2', { style: { fontFamily: 'Segoe UI, sans-serif', color: '#333333', fontSize: '20px', marginBottom: '20px' } }, 'Репозитории GitHub'),
        React.createElement(DataLoader,
            { loading: loadingGitHub, error: errorGitHub, onRetry: reloadGitHub },
            React.createElement(CardsSetka, { cards: gitHubRepos })
        )
    );
}

function PostsPage() {
    const { testPosts, loadingPosts, errorPosts, reloadPosts } = useData();

    return React.createElement('div',
        { style: { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '1200px', margin: '0 auto 30px' } },
        React.createElement('h2', { style: { fontFamily: 'Segoe UI, sans-serif', color: '#333333', fontSize: '20px', marginBottom: '20px' } }, 'Тестовые посты'),
        React.createElement(DataLoader,
            { loading: loadingPosts, error: errorPosts, onRetry: reloadPosts },
            React.createElement(CardsSetka, { cards: testPosts })
        )
    );
}

function CatFactsPage() {
    const { catFacts, loadingFacts, errorFacts, reloadFacts } = useData();

    return React.createElement('div',
        { style: { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '1200px', margin: '0 auto 30px' } },
        React.createElement('h2', { style: { fontFamily: 'Segoe UI, sans-serif', color: '#333333', fontSize: '20px', marginBottom: '20px' } }, 'Факты о кошках'),
        React.createElement(DataLoader,
            { loading: loadingFacts, error: errorFacts, onRetry: reloadFacts },
            React.createElement(CardsSetka, { cards: catFacts })
        )
    );
}

function WorkWithAPI({ onAddPost, onUpdatePost, onDeletePost, postIsHave }) {
    const [postTitle, setPostTitle] = React.useState('');
    const [postBody, setPostBody] = React.useState('');
    const [createResult, setCreateResult] = React.useState(null);
    const [updateId, setUpdateId] = React.useState('');
    const [updateTitle, setUpdateTitle] = React.useState('');
    const [updateBody, setUpdateBody] = React.useState('');
    const [updateResult, setUpdateResult] = React.useState(null);
    const [deleteId, setDeleteId] = React.useState('');
    const [deleteResult, setDeleteResult] = React.useState(null);

    const formCardStyle = {
        background: '#f9f9f9',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        width: '320px'
    };

    const inputStyle = {
        fontFamily: "'Segoe UI', sans-serif",
        width: '100%',
        padding: '8px 10px',
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        boxSizing: 'border-box'
    };

    const textareaStyle = {
        ...inputStyle,
        resize: 'none'
    };

    const buttonStyle = (bgColor) => ({
        fontFamily: "'Segoe UI', sans-serif",
        width: '100%',
        padding: '8px',
        background: bgColor,
        color: 'white',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    });

    const handleCreatePost = (event) => {
        event.preventDefault();
        if (!postTitle.trim() || !postBody.trim()) {
            setCreateResult({ type: 'error', message: 'Заполните заголовок и содержание' });
            return;
        }
        onAddPost(postTitle.trim(), postBody.trim());
        setCreateResult({ type: 'success', message: 'Пост создан' });
        setPostTitle('');
        setPostBody('');
        setTimeout(() => setCreateResult(null), 3000);
    };

    const handleUpdatePost = (event) => {
        event.preventDefault();
        const id = parseInt(updateId);
        if (!updateId || isNaN(id)) {
            setUpdateResult({ type: 'error', message: 'Введите корректный ID поста' });
            return;
        }
        if (!updateTitle.trim() || !updateBody.trim()) {
            setUpdateResult({ type: 'error', message: 'Заполните заголовок и содержание' });
            return;
        }
        if (!postIsHave(id)) {
            setUpdateResult({ type: 'error', message: `Пост с ID ${id} не существует` });
            return;
        }
        onUpdatePost(id, updateTitle.trim(), updateBody.trim());
        setUpdateResult({ type: 'success', message: `Пост с ID ${id} обновлён` });
        setUpdateId('');
        setUpdateTitle('');
        setUpdateBody('');
        setTimeout(() => setUpdateResult(null), 3000);
    };

    const handleDeletePost = (event) => {
        event.preventDefault();
        const id = parseInt(deleteId);
        if (!deleteId || isNaN(id)) {
            setDeleteResult({ type: 'error', message: 'Введите корректный ID поста' });
            return;
        }
        if (!postIsHave(id)) {
            setDeleteResult({ type: 'error', message: `Пост с ID ${id} не существует` });
            return;
        }
        onDeletePost(id);
        setDeleteResult({ type: 'success', message: `Пост с ID ${id} удалён` });
        setDeleteId('');
        setTimeout(() => setDeleteResult(null), 3000);
    };

    const resultStyles = {
        marginTop: '10px',
        padding: '8px',
        fontSize: '12px',
        borderRadius: '5px'
    };

    const successResultStyles = {
        ...resultStyles,
        background: '#d4edda',
        color: '#155724'
    };

    const errorResultStyles = {
        ...resultStyles,
        background: '#f8d7da',
        color: '#721c24'
    };

    return React.createElement('div',
        {
            style: {
                background: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '1200px',
                margin: '0 auto 30px'
            }
        },
        React.createElement('h3', {
            style: {
                fontFamily: "'Segoe UI', sans-serif",
                color: '#333333',
                fontSize: '18px',
                marginBottom: '20px',
                textAlign: 'center'
            }
        }, 'Работа с API'),
        React.createElement('div',
            { style: { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' } },
            React.createElement('div',
                { style: formCardStyle },
                React.createElement('h4', { style: { fontFamily: "'Segoe UI', sans-serif", color: '#007bff', fontSize: '14px', marginBottom: '12px' } }, 'Создать пост'),
                React.createElement('form',
                    { onSubmit: handleCreatePost },
                    React.createElement('input', { type: 'text', placeholder: 'Заголовок', style: inputStyle, value: postTitle, onChange: (e) => setPostTitle(e.target.value) }),
                    React.createElement('textarea', { rows: '3', placeholder: 'Текст', style: textareaStyle, value: postBody, onChange: (e) => setPostBody(e.target.value) }),
                    React.createElement('button', { type: 'submit', style: buttonStyle('#28a745') }, 'Отправить')
                ),
                createResult && React.createElement('div', { style: createResult.type === 'success' ? successResultStyles : errorResultStyles }, createResult.message)
            ),
            React.createElement('div',
                { style: formCardStyle },
                React.createElement('h4', { style: { fontFamily: "'Segoe UI', sans-serif", color: '#007bff', fontSize: '14px', marginBottom: '12px' } }, 'Обновить пост'),
                React.createElement('form',
                    { onSubmit: handleUpdatePost },
                    React.createElement('input', { type: 'text', placeholder: 'ID поста', pattern: '[0-9]+', style: inputStyle, value: updateId, onChange: (e) => setUpdateId(e.target.value) }),
                    React.createElement('input', { type: 'text', placeholder: 'Новый заголовок', style: inputStyle, value: updateTitle, onChange: (e) => setUpdateTitle(e.target.value) }),
                    React.createElement('textarea', { rows: '2', placeholder: 'Новый текст', style: textareaStyle, value: updateBody, onChange: (e) => setUpdateBody(e.target.value) }),
                    React.createElement('button', { type: 'submit', style: buttonStyle('#007bff') }, 'Обновить')
                ),
                updateResult && React.createElement('div', { style: updateResult.type === 'success' ? successResultStyles : errorResultStyles }, updateResult.message)
            ),
            React.createElement('div',
                { style: formCardStyle },
                React.createElement('h4', { style: { fontFamily: "'Segoe UI', sans-serif", color: '#007bff', fontSize: '14px', marginBottom: '12px' } }, 'Удалить пост'),
                React.createElement('form',
                    { onSubmit: handleDeletePost },
                    React.createElement('input', { type: 'text', placeholder: 'ID поста', pattern: '[0-9]+', style: inputStyle, value: deleteId, onChange: (e) => setDeleteId(e.target.value) }),
                    React.createElement('button', { type: 'submit', style: buttonStyle('#dc3545') }, 'Удалить')
                ),
                deleteResult && React.createElement('div', { style: deleteResult.type === 'success' ? successResultStyles : errorResultStyles }, deleteResult.message)
            )
        )
    );
}

function MyPosts({ posts }) {
    const containerStyle = {
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto 30px'
    };

    const postsGridStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px'
    };

    const postBlockStyle = {
        background: '#f9f9f9',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        width: 'calc(33% - 10px)'
    };

    if (posts.length === 0) {
        return React.createElement('div',
            { style: containerStyle },
            React.createElement('h3', { style: { fontFamily: "'Segoe UI', sans-serif", color: '#333333', fontSize: '18px', marginBottom: '20px', textAlign: 'center' } }, 'Мои посты'),
            React.createElement('p', { style: { fontFamily: "'Segoe UI', sans-serif", textAlign: 'center', color: '#999999', padding: '30px' } }, 'Нет постов')
        );
    }

    return React.createElement('div',
        { style: containerStyle },
        React.createElement('h3', { style: { fontFamily: "'Segoe UI', sans-serif", color: '#333333', fontSize: '18px', marginBottom: '20px', textAlign: 'center' } }, 'Мои посты'),
        React.createElement('div',
            { style: postsGridStyle },
            posts.map(post => React.createElement('div',
                { key: post.id, style: postBlockStyle },
                React.createElement('h4', { style: { fontFamily: "'Segoe UI', sans-serif", fontSize: '16px', color: '#333333', marginBottom: '8px' } }, post.title),
                React.createElement('p', { style: { fontFamily: "'Segoe UI', sans-serif", fontSize: '13px', color: '#666666', marginBottom: '8px', lineHeight: '1.4', overflowWrap: 'break-word' } }, post.body),
                React.createElement('small', { style: { fontFamily: "'Segoe UI', sans-serif", fontSize: '11px', color: '#aaaaaa', display: 'block', marginTop: '5px' } }, 'ID поста: ', post.id)
            ))
        )
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));