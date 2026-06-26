// ── Big Cookies — Cookie Personality Quiz ──
(function() {
    var container = document.getElementById('quizBody');
    if (!container) return;

    var questions = [];
    var products = [];
    var productLookup = {};
    var scores = {};
    var currentQ = 0;
    var ready = false;

    function resetQuiz() {
        scores = {};
        products.forEach(function(p) {
            if (p.quiz) scores[p.id] = 0;
        });
        currentQ = 0;
        var steps = document.querySelectorAll('.quiz-step');
        steps.forEach(function(s) { s.classList.remove('active', 'done'); });
        if (steps.length > 0) steps[0].classList.add('active');
    }

    function showQuestion() {
        if (!ready) return;
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
                var qKey = 'q' + (currentQ + 1);

                // Product-centric scoring: each product carries quiz.q1/q2/q3 arrays
                products.forEach(function(p) {
                    if (p.quiz && p.quiz[qKey] && typeof p.quiz[qKey][idx] === 'number') {
                        scores[p.id] = (scores[p.id] || 0) + p.quiz[qKey][idx];
                    }
                });

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
        for (var id in scores) {
            if (scores[id] > bestScore) { bestScore = scores[id]; best = id; }
        }
        var product = productLookup[best];
        if (!product) product = productLookup['classic'];

        var name = product.name;
        var icon = product.icon;
        var desc = product.resultDesc || product.desc;

        var firstWord = name.split(' ')[0];
        var html = '<div class="quiz-result"><div class="quiz-result-icon"><img src="' + icon + '" alt="' + name + '" width="80" height="80" style="border-radius:50%"></div>';
        html += '<div class="quiz-match">Your soul cookie is</div>';
        html += '<h3>' + name + '</h3>';
        html += '<p>' + desc + '</p>';
        html += '<a href="#build" class="btn btn-primary">Build a Box with ' + firstWord + '</a>';
        html += ' <button class="quiz-retry" id="quizShare" style="background:none;border:1px solid var(--soft);border-radius:100px;padding:0.5rem 1rem;cursor:pointer;font-size:0.8125rem;color:var(--ink);transition:all 0.2s">📋 Share Result</button>';
        html += '<br><button class="quiz-retry" id="quizRetry">Take the quiz again →</button>';
        html += '</div>';
        container.innerHTML = html;
        container.className = 'quiz-body';

        document.getElementById('quizRetry').addEventListener('click', function() {
            resetQuiz();
            showQuestion();
        });
        var shareBtn = document.getElementById('quizShare');
        if (shareBtn) shareBtn.addEventListener('click', function() {
            var text = '🥠 I got ' + name + ' on the Big Cookies quiz! What cookie are you? big-cookies.yaoyy.moe';
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function() {
                    window.showToast && showToast('📋 Result copied! Share with a friend.');
                });
            }
        });
    }

    function init(data) {
        questions = data.quiz.questions;
        products = data.products;
        products.forEach(function(p) {
            productLookup[p.id] = p;
        });
        ready = true;
        resetQuiz();
        showQuestion();
    }

    function loadQuiz() {
        var BCD = window.BigCookiesData;
        var fetcher = BCD ? BCD.fetchJSON : function(url) {
            return fetch(url).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            });
        };
        fetcher('data/products.json')
            .then(function(data) {
                if (data && data.quiz && data.products) {
                    init(data);
                }
            })
            .catch(function(err) {
                console.warn('Quiz data load failed:', err);
            });
    }

    loadQuiz();
})();
