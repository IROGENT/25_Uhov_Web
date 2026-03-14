function startGame() {
    alert('Игра "Угадай число"!\n\nПравила:\n• Число от 1 до 100\n• 7 попыток\n• После каждой попытки подсказка');

    let ready = confirm('Готовы начать?');

    if (ready != 1) {
        alert('Вы вышли из игры');
        return;
    }

    let zagadannoeNumber = Math.floor(Math.random() * 100) + 1;
    let attempts_left = 7;
    let moves_counter = 0;
    let is_game_active = true;

    while (attempts_left > 0 && is_game_active) {
        let message = `Попытка ${moves_counter + 1} из 7\n\nВведите число от 1 до 100:`;
        let pole_input = prompt(message);

        if (pole_input === null) {
            let is_exit = confirm('Выйти из игры?');
            if (is_exit) {
                alert('Игра завершена');
                is_game_active = false;
                break;
            }
            continue;
        }

        pole_input = pole_input.trim();

        if (pole_input === '') {
            alert('Вы ничего не ввели. Введите ещё раз');
            continue;
        }

        let number = Number(pole_input);
        if (isNaN(number)) {
            alert(`Ошибка: '${pole_input}' не является числом`);
            continue;
        }

        if (Number.isInteger(number) !== true) {
            alert('Введите целое число (без дробной части)');
            continue;
        }

        if (number < 1 || number > 100) {
            alert('Число должно быть от 1 до 100');
            continue;
        }

        moves_counter++;
        attempts_left--;

        if (number === zagadannoeNumber) {
            alert(`ПОБЕДА!\n\nВы угадали число '${zagadannoeNumber}'!`);

            if (confirm('Хотите сыграть ещё раз?')) {
                startGame();
            }
            return;
        }

        if (attempts_left > 0) {
            let bolsh_mensh = number < zagadannoeNumber ? "больше" : "меньше";
            alert(`Загаданное число ${bolsh_mensh}, чем ${number}\nОсталось попыток: ${attempts_left}`);
        }
    }

    if (is_game_active) {
        alert(`Попытки закончились!\nЗагаданное число: ${zagadannoeNumber}`);

        if (confirm('Сыграть ещё раз?')) {
            startGame();
        }
    }
}

window.startGame = startGame;
