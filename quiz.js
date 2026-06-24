// ── Big Cookies — Cookie Personality Quiz ──
(function() {
    var container = document.getElementById('quizBody');
    if (!container) return;

    var questions = [
        {
            q: 'What\'s your ideal afternoon?',
            options: [
                { text: 'Curled up with a book and a blanket', scores: { classic: 3, matcha: 2, caramel: 1 } },
                { text: 'Hiking a trail with friends', scores: { toffee: 3, raspberry: 2, double: 1 } },
                { text: 'Trying a new restaurant across town', scores: { raspberry: 3, matcha: 2, caramel: 1 } },
                { text: 'Baking something from scratch', scores: { double: 3, classic: 2, toffee: 1 } }
            ]
        },
        {
            q: 'Pick a drink to go with it.',
            options: [
                { text: 'Black coffee, no sugar', scores: { double: 3, classic: 2, toffee: 1 } },
                { text: 'Oat milk latte with a dash of cinnamon', scores: { caramel: 3, matcha: 2, classic: 1 } },
                { text: 'Earl Grey tea with honey', scores: { matcha: 3, raspberry: 2, caramel: 1 } },
                { text: 'Sparkling water with lemon', scores: { raspberry: 3, toffee: 2, double: 1 } }
            ]
        },
        {
            q: 'What do your friends say about you?',
            options: [
                { text: '"The reliable one — you always show up"', scores: { classic: 3, caramel: 2, toffee: 1 } },
                { text: '"You\'re a little extra. In the best way."', scores: { double: 3, raspberry: 2, matcha: 1 } },
                { text: '"I never know what you\'re going to do next"', scores: { toffee: 3, matcha: 2, raspberry: 1 } },
                { text: '"You make everything feel special"', scores: { caramel: 3, classic: 2, double: 1 } }
            ]
        }
    ];

    var results = {
        classic: { name: 'Classic Chocolate Chip', desc: 'You\'re timeless, dependable, and everyone\'s first call. You don\'t need to be flashy — your quality speaks for itself. The original, and still the one people come back to.', icon: 'svg/cookies/classic.svg' },
        double: { name: 'Double Chocolate', desc: 'You go all in. Moderation isn\'t in your vocabulary and honestly? It\'s working. You\'re intense in the best way, and people either keep up or get out of the way.', icon: 'svg/cookies/double.svg' },
        toffee: { name: 'Toffee Crunch', desc: 'You\'ve got layers. People think they\'ve figured you out, then you surprise them. Complex, a little unexpected, and somehow everything comes together perfectly.', icon: 'svg/cookies/toffee.svg' },
        raspberry: { name: 'Raspberry Dark Chocolate', desc: 'You\'re the creative one. You see combinations others miss and you\'re not afraid to try something different. Colorful, bold, and impossible to forget.', icon: 'svg/cookies/raspberry.svg' },
        caramel: { name: 'Salted Caramel', desc: 'You\'ve mastered the balance everyone else is still chasing. Warm, sophisticated, with just enough edge to keep things interesting. The sweet-and-salty of the group.', icon: 'svg/cookies/caramel.svg' },
        matcha: { name: 'Matcha White Chocolate', desc: 'You\'re refined, a little unexpected, and you definitely know something the rest of us don\'t. People who get you REALLY get you. An acquired taste worth acquiring.', icon: 'svg/cookies/matcha.svg' }
    };

    var scores = {};
    var currentQ = 0;

    function resetQuiz() {
        scores = { classic: 0, double: 0, toffee: 0, raspberry: 0, caramel: 0, matcha: 0 };
        currentQ = 0;
        var steps = document.querySelectorAll('.quiz-step');
        steps.forEach(function(s) { s.classList.remove('active', 'done'); });
        if (steps.length > 0) steps[0].classList.add('active');
    }

    function showQuestion() {
        var q = questions[currentQ];
        var html = '<h3>' + q.q + '</h3><div class="quiz-options">';
        q.options.forEach(function(opt, i) {
            html += '<button class="quiz-option" data-idx="' + i + '">' + opt.text + '</button>';
        });
        html += '</div>';
        container.innerHTML = html;
        container.className = 'quiz-body';

        container.querySelectorAll('.quiz-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-idx'));
                var chosen = q.options[idx];
                for (var flavor in chosen.scores) {
                    scores[flavor] = (scores[flavor] || 0) + chosen.scores[flavor];
                }

                // Update progress
                var steps = document.querySelectorAll('.quiz-step');
                if (steps[currentQ]) steps[currentQ].classList.add('done');

                currentQ++;
                if (currentQ < questions.length) {
                    if (steps[currentQ]) steps[currentQ].classList.add('active');
                    showQuestion();
                } else {
                    showResult();
                }
            });
        });
    }

    function showResult() {
        var best = null, bestScore = 0;
        for (var flavor in scores) {
            if (scores[flavor] > bestScore) { bestScore = scores[flavor]; best = flavor; }
        }
        var result = results[best];
        if (!result) result = results['classic'];

        var html = '<div class="quiz-result"><div class="quiz-result-icon"><img src="' + result.icon + '" alt="' + result.name + '" width="80" height="80" style="border-radius:50%"></div>';
        html += '<div class="quiz-match">Your soul cookie is</div>';
        html += '<h3>' + result.name + '</h3>';
        html += '<p>' + result.desc + '</p>';
        html += '<a href="#build" class="btn btn-primary">Build a Box with ' + result.name.split(' ')[0] + '</a>';
        html += '<br><button class="quiz-retry" id="quizRetry">Take the quiz again →</button>';
        html += '</div>';
        container.innerHTML = html;
        container.className = 'quiz-body';

        document.getElementById('quizRetry').addEventListener('click', function() {
            resetQuiz();
            showQuestion();
        });
    }

    // Defer to next tick for safe DOM access
    setTimeout(function() {
        resetQuiz();
        showQuestion();
    }, 0);
})();
