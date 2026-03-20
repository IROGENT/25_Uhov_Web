document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');

    if (!themeToggle) {
        console.error('Ошибка: Кнопка #theme-toggle не найдена на странице');
        return;
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = 'Light';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.textContent = 'Dark';
            localStorage.setItem('theme', 'light');
        }
    }

    themeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
    });


    const defaultReviews = [
        {
            name: "Закись Ашота",
            text: "Прошёл курс \"Успешный успех\" и уже чэрез нэделю купил новую машьину! Правда, пришлось продать старую и взять крэдит..."
        },
        {
            name: "Сатору Гойда",
            text: "Очень доволен курсом \"Крипто-триллионер\". Купил биткоин на все деньги, жду когда подоражает. Автор обещал, что это 100% сработает!"
        },
        {
            name: "Наташа ДваБаша",
            text: "Курс \"Инвестиции для бедных\" изменил мою жизнь! Теперь я бедная, но с дипломом инвестора. Автор очень убедительно обманывет."
        },
        {
            name: "Генерал Гавс",
            text: "Курсы хорошие, но много рекламы внутри, развилась эпилепсия. Впрочем, автор предупреждал, что не несёт ответственности. Буду покупать дальше!"
        },
        {
            name: "Тайно Дёрнул",
            text: "Спасибо создателям! Благодаря курсам \"Жизнь в богатстве\" и \"Смерть в нищите\" я понял, что главное — это верить в себя! И иметь много денег."
        },
        {
            name: "Волк с Лузстрит",
            text: "Отличный сайт, удобная навигация, прекрасное исполнение. Курсы подобраны со вкусом. Особенно порадовали рекламные баннеры, но жаль что их так мало!"
        }
    ];

    const KET_site_reviews = 'site_reviews';

    function getReviews() {
        const stored = localStorage.getItem(KET_site_reviews);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (e) {
                console.error('Ошибка парсинга отзывов:', e);
            }
        }
        return JSON.parse(JSON.stringify(defaultReviews));
    }

    function saveReviews(reviews) {
        localStorage.setItem(KET_site_reviews, JSON.stringify(reviews));
    }

    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';

        const textDiv = document.createElement('div');
        textDiv.className = 'review-text';
        textDiv.textContent = review.text;

        const authorDiv = document.createElement('div');
        authorDiv.className = 'review-author';
        authorDiv.textContent = review.name;

        const span = document.createElement('span');
        span.textContent = 'довольный клиент';
        authorDiv.appendChild(span);

        card.appendChild(textDiv);
        card.appendChild(authorDiv);

        return card;
    }

    function renderReviews() {
        const container = document.getElementById('reviews-container');
        if (!container) {
            console.error('Контейнер #reviews-container не найден');
            return;
        }

        const reviews = getReviews();
        container.innerHTML = '';

        if (reviews.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-reviews';
            emptyMessage.textContent = 'Пока отзывов нет';
            container.appendChild(emptyMessage);
            return;
        }

        reviews.forEach(review => {
            container.appendChild(createReviewCard(review));
        });
    }

    function validateReview(name, text) {
        const trimmedName = name.trim();
        const trimmedText = text.trim();

        if (!trimmedName || trimmedName.length < 2) return { valid: false, field: 'name', message: 'Имя должно содержать минимум 2 символа' };
        if (!trimmedText || trimmedText.length < 10) return { valid: false, field: 'text', message: 'Отзыв должен содержать минимум 10 символов' };

        return { valid: true };
    }

    function showError(fieldId, message) {
        const errorSpan = document.getElementById(fieldId);
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    function clearErrors() {
        const errors = ['name-error', 'text-error'];
        errors.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `position:fixed;bottom:80px;right:20px;background:#4caf50;color:white;padding:12px 20px;border-radius:8px;z-index:1001;animation:fadeInOut 3s ease-in-out;box-shadow:0 4px 15px rgba(0,0,0,0.2);`;

        if (!document.getElementById('notif-style')) {
            const style = document.createElement('style');
            style.id = 'notif-style';
            style.textContent = '@keyframes fadeInOut{0%{opacity:0;transform:translateY(20px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-20px);visibility:hidden}}';
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function addReview(name, text) {
        clearErrors();

        const reviews = getReviews();
        const newReview = { name: name.trim(), text: text.trim() };

        reviews.unshift(newReview);
        saveReviews(reviews);
        renderReviews();

        document.getElementById('review-name').value = '';
        document.getElementById('review-text').value = '';

        showNotification('Отзыв успешно добавлен!');
        return true;
    }

    const form = document.getElementById('review-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('review-name').value;
            const text = document.getElementById('review-text').value;

            const validation = validateReview(name, text);

            if (!validation.valid) {
                showError(validation.field + '-error', validation.message);
                return;
            }

            addReview(name, text);
        });

        const nameInput = document.getElementById('review-name');
        const textInput = document.getElementById('review-text');

        if (nameInput) nameInput.addEventListener('input', () => clearErrors());
        if (textInput) textInput.addEventListener('input', () => clearErrors());
    } else {
        console.error('Форма #review-form не найдена');
    }

    renderReviews();
});