function GameBuilder(app, socket, manager){

    var $status, $field, $messagesList, $input, $spectatorField;

    this.init = function(game){
        $status = game.dialog.body().find('.status').html('');
        $field = game.dialog.body().find('.game-field');
        $messagesList = game.dialog.body().find('.messages ul.chat');
        $input = game.dialog.body().find('.controls input');

        if (game.spectator){
            $spectatorField = $field.find('.spectator-field')
            $field.find('.patterns').hide();
            $field.find('.letters').hide();
        }

    };

    this.getRoomTemplate = function(){
        return tpl('gameBuilderRoomTemplate');
    };

    this.resizeDialog = function(dialog, height){
        dialog.$messagesCell.css({height: (height - 95)+'px'});
        dialog.$membersCell.css({height: (height - 95)+'px'});
    };

    this.startStateWaiting = function(game){
        toggleGameField(false);
        $status.html(t('gameStateWaiting', {
            count: game.playersCount,
            max: game.maxPlayers
        }));
    };

    this.startStatePrepare = function(game){

        toggleGameField(false);

        if (game.round == 1){
            manager.gameMessageReceived({
                id: 'system',
                icon: 'check',
                class: 'text-primary'
            }, t('gamePlayersJoined'));
        } else {
            manager.gameMessageReceived({
                id: 'system',
                icon: 'chevron-right'
            }, t('gameRoundGetReady'));
        }

        $status.html(t('gameRoundGetReady'));

        manager.gameSetDelay();

    };

    this.startStateRound = function(game){

        manager.gameClearChat();

        manager.gameMessageReceived({
            id: 'system',
            icon: 'clock-o'
        }, t('gameRoundStarted'));

        $status.html(t('gameBuilderRules'));

        manager.gameSetDelay();

        toggleGameField(true);

        if (game.spectator){
            initSpectatorField(game);
            return;
        }

        initGameField(game);

    };

    this.startStateOver = function(game){

        toggleGameField(false);

        manager.gameMessageReceived({
            id: 'system',
            icon: 'refresh'
        }, t('gameOverRestart'));

        $status.html(t('gameOver', {
            name: game.winnerName
        }));

        manager.gameSetDelay();

        var $membersList = game.dialog.$membersList;

        for (var i in game.players){
            game.players[i].score = 0;
            $('#player-' + i, $membersList).find('.score').text('0');
        }

    };

    this.endRound = function(game, winnerId, score, data){

        toggleGameField(false);

        var words = data.words.join(', ');

        if (!winnerId){
            manager.gameMessageReceived({
                id: 'system',
                icon: 'clock-o',
                class: 'text-danger'
            }, t('gameBuilderRoundTimeUp', {
                words: words
            }));
            return;
        }

        var $membersList = game.dialog.$membersList;

        game.players[winnerId].score += score;
        $('#player-' + winnerId, $membersList).find('.score').text(game.players[winnerId].score);

        if (winnerId == app.userId){
            manager.gameMessageReceived({
                id: 'system',
                icon: 'check',
                class: 'text-success'
            }, t('gameBuilderRoundWinYou'));
            return;
        }

        var winner = app.getMember(winnerId);
        if (!winner) { return; }

        manager.gameMessageReceived({
            id: 'system',
            icon: 'check',
            class: 'text-success'
        }, t('gameBuilderRoundWin', {
            name: winner.name.first
        }));

    };

    function toggleGameField(isShow){
        $field.toggle(isShow);
        $messagesList.toggle(!isShow);
        $input.prop('disabled', isShow).val('');
    }

    function initSpectatorField(game){

        $spectatorField.empty();

        for (var id in game.players){

            var player = game.players[id];
            var member = app.getMember(id);

            var $playerDiv = $('<div/>').addClass('player-display').addClass('player-' + id);

            $('<div/>').addClass('player-name').html(member.name.first).appendTo($playerDiv);

            var $wordsList = $('<div/>').addClass('player-words');

            $wordsList.appendTo($playerDiv);

            for(var p=0; p<game.patterns.length; p++){

                var $patternList = $('<ul/>').data('id', p);
                var pattern = game.patterns[p];

                for (var i=0; i<pattern.length; i++){

                    var letter = pattern[i];
                    var $letterSpace = $('<li/>');

                    if (letter) {
                        $letterSpace.html(letter).addClass('fixed');
                    } else {

                        var guessedLetter = '';

                        if (player.guessedLetters){
                            if (p in player.guessedLetters){
                                if (i in player.guessedLetters[p]){
                                    guessedLetter = player.guessedLetters[p][i];
                                }
                            }
                        }

                        $letterSpace.addClass('space').html(guessedLetter);
                    }

                    $letterSpace.appendTo($patternList);

                }

                $patternList.appendTo($wordsList);

            }

            $playerDiv.appendTo($spectatorField);

        }

    }

    function initGameField(game){

        var $patterns = $field.find('.patterns');

        $patterns.empty();

        for(var p=0; p<game.patterns.length; p++){

            var $patternList = $('<ul/>').data('id', p);
            var pattern = game.patterns[p];

            for (var i=0; i<pattern.length; i++){

                var letter = pattern[i];
                var $letterSpace = $('<li/>');

                if (letter) {
                    $letterSpace.html(letter).addClass('fixed');
                } else {
                    $letterSpace.addClass('space');
                }

                $letterSpace.appendTo($patternList);

            }

            $('<div/>').addClass('wrap').append($patternList).appendTo($patterns);

        }

        var $lettersList = $field.find('.letters ul');

        $lettersList.empty();

        for (var i=0; i<game.letters.length; i++){

            var letter = game.letters[i];
            var $letterBlock = $('<li/>').html(letter);

            $letterBlock.appendTo($lettersList);

        }

        initDrag(game, $patterns, $lettersList);

    }

    function initDrag(game, $patterns, $lettersList){

        $('li', $lettersList).draggable({
            revert: 'invalid'
        });

        $lettersList.droppable();

        $('.space', $patterns).droppable({
            drop: function(event, ui) {

                var $space = $(this);
                var $letter = ui.draggable;

                var currentLetter = $space.html();

                var letter = $letter.html();

                $space.html(letter).addClass('letter');
                $letter.remove();

                if (currentLetter){
                    var $letterBlock = $('<li/>').html(currentLetter).draggable({
                        revert: 'invalid'
                    });
                    $letterBlock.appendTo($lettersList);
                }

                var wordId = $space.parent('ul').data('id');
                var letterId = $space.index();

                socket.emit('game event', {
                    gameId: game.id,
                    player: app.userId,
                    wordId: wordId,
                    letterId: letterId,
                    letter: letter
                });

                checkWords(game, $patterns);

            }
        }).click(function(){

            var $space = $(this);
            var $pattern = $space.parent('ul');

            $pattern.removeClass('word-correct').removeClass('word-wrong');

            if (!$space.html()) { return; }

            var $letterBlock = $('<li/>').html($space.html()).draggable({
                revert: 'invalid'
            });

            $letterBlock.appendTo($lettersList);

            $space.html('').removeClass('letter');

            var wordId = $pattern.data('id');
            var letterId = $space.index();

            socket.emit('game event', {
                gameId: game.id,
                player: app.userId,
                wordId: wordId,
                letterId: letterId,
                letter: ''
            });

        });

    }

    function checkWords(game, $patterns){

        var results = [];

        $('ul', $patterns).each(function(p){

            var $pattern = $(this);
            var word = game.words[$pattern.data('id')];

            var result = '';
            var spacesLeft = 0;

            $('li', $pattern).each(function(i){
                var letter = $(this).html();
                if (!letter) {
                    spacesLeft++;
                    return;
                }
                result += letter;
            });

            if (result === word && spacesLeft === 0){
                $pattern.addClass('word-correct');
            }

            if (result !== word && spacesLeft === 0){
                $pattern.addClass('word-wrong');
            }

            results.push(result);

        });

        var resultString = results.join(', ')

        if (resultString === game.words.join(', ')){
            socket.emit('game send', {
                gameId: game.id,
                msg: resultString
            });
        }

    }

    this.onEvent = function(game, event){

        if (!game.spectator) { return; }

        $spectatorField.
                find('.player-'+event.player).
                find('.player-words ul').eq(event.wordId).
                find('li').eq(event.letterId).
                html(event.letter).fadeIn();

    };

}