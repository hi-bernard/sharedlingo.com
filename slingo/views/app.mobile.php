<?php
    use SLingo\Core\Request;
    use SLingo\Core\User;
?>
<div id="appWrap">

    <div id="appHeader">
        <ul>
            <li id="logo">
                <?php echo t('appTitle'); ?>
            </li>
            <li class="menu-container" id="appTaskbar">
                <a id="toolbarLink" href="#"><i class="fa fa-bars"></i><span class="badge"></span></a>
                <ul class="menu-pane nav nav-pills nav-stacked"></ul>
            </li>
            <li class="menu-container">
                <a id="profileNameLink" href="#"><i class="fa fa-user"></i><span class="badge"></span></a>
                <ul id="profileMenu" class="menu-pane nav nav-pills nav-stacked">
                    <?php if (User::isModerator()) { ?>
                        <li>
                            <a id="reportsLink" href="#"><i class="fa fa-fw fa-shield"></i> <?php echo t('reportsList'); ?><span class="badge"></span></a>
                        </li>
                    <?php } ?>
                    <li><a id="inboxLink" class="inbox-link" href="#"><i class="fa fa-fw fa-envelope"></i> <?php echo t('inbox'); ?><span class="badge"></span></a></li>
                    <li><a id="friendsLink" class="friends-link" href="#"><i class="fa fa-fw fa-users"></i> <?php echo t('friends'); ?><span class="badge badge-green"></span></a></li>
                    <?php if (User::isAdmin()) { ?>
                    <li>
                        <a id="historyLink" href="#"><i class="fa fa-fw fa-history"></i> <?php echo t('history'); ?></a>
                    </li>
                    <?php } ?>
                    <li><a class="profile-link" href="#"><i class="fa fa-fw fa-search"></i> <?php echo t('myProfile'); ?></a></li>
                    <li><a class="edit-link" href="#"><i class="fa fa-fw fa-gear"></i> <?php echo t('editProfile'); ?></a></li>
                    <?php if (User::isAdmin()) { ?>
                    <li><a class="edit-name-color-link" href="#"><i class="fa fa-fw fa-paint-brush"></i> <?php echo t('editNameColor'); ?></a></li>
                    <?php } ?>
                    <?php if (User::isAdmin()) { ?>
                        <li class="divider"></li>
                        <li><a href="#get-premium" id="premiumLink"><i class="fa fa-fw fa-star"></i> <?php echo t('getPremium'); ?></a></li>
                    <?php } ?>
                    <li class="divider"></li>
                    <li><a class="logout-link" href="/auth/logout"><i class="fa fa-fw fa-sign-out"></i> <?php echo t('logout'); ?></a></li>
                </ul>
            <li>
                <a id="gamesLink" href="#"><i class="fa fa-fw fa-trophy"></i></a>
            </li>
            <li>
                <a id="findMembersLink" href="#"><i class="fa fa-fw fa-search"></i></a>
            </li>
            <li>
                <a id="publicRoomsLink" href="#"><i class="fa fa-comments-o"></i></a>
            </li>
            <li>
                <a id="textLobbyLink" href="#"><i class="fa fa-home"></i></a>
            </li>
        </ul>
    </div>

    <div id="app"></div>

    <div id="loadingIndicator">
        <div class="indicator">
            <i class="fa fa-spin fa-gear"></i>
        </div>
    </div>

</div>

<script id="textLobbyTemplate" type="text/template">
    <div class="members-scroll">
        <div id="textLobbyMembersList" class="members-list">
            <ul class="list-body"></ul>
        </div>
    </div>
</script>

<script id="textLobbyMemberTemplate" type="text/template">
    <li id="{{id}}" class="item">
        <div class="title gender-{{genderClass}}">
            <span class="name"><span>{{name.full}}</span></span>
            <span class="gender-age"><i class="fa fa-fw fa-{{genderClass}}"></i> {{age}}</span>
        </div>
        <div class="details">
            <ul>
                <li><span><?php echo t('speaks'); ?>:</span> {{speaks}}</li>
                <li><span><?php echo t('learns'); ?>:</span> {{learns}}</li>
            </ul>
        </div>
    </li>
</script>

<script id="chatRequestTemplate" type="text/template">
    <div class="dialog-message chat-request">
        <div class="name">{{name.full}}</div>
        <div class="gender-age gender-{{genderClass}}">
            <i class="fa fa-fw fa-{{genderClass}}"></i> {{age}}
        </div>
        <div class="info">
            <div class="location">
                <span><?php echo t('location'); ?>:</span> {{location.full}}
            </div>
            <div class="speaks">
                <span><?php echo t('speaks'); ?>:</span> {{speaks}}
            </div>
            <div class="learns">
                <span><?php echo t('learns'); ?>:</span> {{learns}}
            </div>
        </div>
    </div>
</script>

<script id="chatRoomTemplate" type="text/template">
    <div class="chat-room">
        <div class="messages">
            <div class="scroll">
                <ul></ul>
            </div>
        </div>
        <div class="members">
            <div class="shortcut">
                <i class="fa fa-user"></i> <span class="count"></span>
            </div>
            <div class="scroll">
                <ul></ul>
                <div class="suggest-hint">
                    <?php echo t('suggestTopicHint'); ?>
                    <button class="btn btn-sm btn-default"><?php echo t('suggestTopicBtn'); ?></button>
                    <div class="credits">Topics by <a href="http://conversationstartersworld.com/" target="_blank">CSW</a></div>
                </div>
            </div>
        </div>
        <div class="controls">
            <div class="input-group">
                <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
                <div class="input-group-addon zoom-toggle toggle-button">
                    <i class="fa fa-search-plus"></i>
                </div>
                <div class="input-group-addon emoticons-toggle toggle-button">
                    <i class="fa fa-smile-o"></i>
                </div>
                <div class="emoticons-pane pane">
                    <div class="emoticons"></div>
                </div>
                <div class="zoom-pane pane">
                    <a class="zoom-out"><i class="fa fa-search-minus"></i></a>
                    <a class="zoom-in"><i class="fa fa-search-plus"></i></a>
                </div>
            </div>
        </div>
    </div>
</script>

<script id="roomMessageTemplate" type="text/template">
    <li><span class="name c{{color}}" onclick="insert(this)">{{name}}:</span> {{message}}</li>
</script>

<script id="roomSystemMessageTemplate" type="text/template">
    <li class="system {{class}}"><span class="icon"><i class="fa fa-fw fa-{{icon}}"></i></span> {{message}}</li>
</script>

<script id="gamesLobbyTemplate" type="text/template">
    <div class="toolbar">
        <button class="create-game btn btn-default btn-sm"><i class="fa fa-plus"></i> <?php echo t('gameCreate'); ?></button>
        <span class="in-game"><?php echo t('gamesInGameShort'); ?></span>
    </div>
    <div class="members-scroll">
        <div id="gamesList" class="games-list members-list">
            <ul class="list-body"></ul>
        </div>
    </div>
</script>

<script id="gamesLobbyGameTemplate" type="text/template">
    <li id="{{id}}" class="item">
        <div class="title">
            <i class="fa fa-trophy"></i> {{title}}
        </div>
        <div class="details">
            <ul>
                <li><span><?php echo t('gameLanguage'); ?>:</span> {{language}}</li>
                <li><span><?php echo t('gameStatus'); ?>:</span> <span class="status">{{statusText}}</span></li>
                <li><span><?php echo t('gamePlayers'); ?>:</span> <span class="players is-closed-{{closed}}">{{playersCount}}/{{maxPlayers}}</span></li>
            </ul>
        </div>
    </li>
</script>

<script id="gameAliasRoomTemplate" type="text/template">
    <div class="chat-room game-room">
        <div class="toolbar">
            <span class="status"></span>
            <span class="timer pull-right"></span>
        </div>
        <div class="messages">
            <div class="scroll">
                <ul class="chat"></ul>
            </div>
        </div>
        <div class="members">
            <div class="shortcut">
                <i class="fa fa-user"></i> <span class="count"></span>
            </div>
            <div class="scroll">
                <ul></ul>
            </div>
        </div>
        <div class="controls">
            <div class="player-controls">
                <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
            </div>
            <div class="spectator-controls form-control-static">
                <i class="fa fa-eye"></i> <?php echo t('gameSpectatorInfo'); ?>
            </div>
        </div>
    </div>
</script>

<script id="gameBuilderRoomTemplate" type="text/template">
    <div class="chat-room game-room game-builder">
        <div class="toolbar">
            <span class="status"></span>
            <span class="timer pull-right"></span>
        </div>
        <div class="messages">
            <div class="scroll">
                <ul class="chat"></ul>
                <div class="game-field">
                    <div class="patterns"></div>
                    <div class="letters">
                        <div class="hint"><?php echo t('gameBuilderHint'); ?></div>
                        <ul></ul>
                    </div>
                    <div class="spectator-field"></div>
                </div>
            </div>
        </div>
        <div class="members">
            <div class="shortcut">
                <i class="fa fa-user"></i> <span class="count"></span>
            </div>
            <div class="scroll">
                <ul></ul>
            </div>
        </div>
        <div class="controls">
            <div class="player-controls">
                <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
            </div>
            <div class="spectator-controls form-control-static">
                <i class="fa fa-eye"></i> <?php echo t('gameSpectatorInfo'); ?>
            </div>
        </div>
    </div>
</script>

<script id="premiumLockDialogTemplate" type="text/template">
    <div class="premium-lock dialog-message">
        <p><?php echo nl2br(t('premiumExplained')); ?></p>
    </div>
</script>

<script id="messageDialogTemplate" type="text/template">
    <div class="dialog-message">{{message}}</div>
</script>

<script id="dialogTemplate" type="text/template">
    <div class="dialog">
        <div class="title"></div>
        <div class="body"></div>
        <div class="buttons"></div>
    </div>
</script>

<?php if (User::isAdmin()) { ?>
    <script id="liveStatsTemplate" type="text/template">
        <div class="dialog-message live-stats">
            <h3><?php echo t('activeRooms'); ?></h3>
            <ul class="rooms-list"></ul>
            <div class="no-rooms"><?php echo t('noActiveRooms'); ?></div>
        </div>
    </script>
<?php } ?>

<?php if (User::isModerator()) { ?>
    <script id="logTemplate" type="text/template">
        <div class="messages-log">
            <ul class="messages-list"></ul>
        </div>
    </script>
<?php } ?>

<?php echo js('app'); ?>

<?php if (User::isAdmin()) { ?>
    <script src="/admin/js"></script>
<?php } ?>
<?php if (User::isModerator()) { ?>
    <script src="/moderator/js"></script>
<?php } ?>

<script>
    $(function() {
        app = new App({
            mobile: true,
            userId: '<?php echo User::getId(); ?>',
            token: '<?php echo User::getToken(); ?>',
            host:  '<?php echo Request::getHost(); ?>',
            port: 3000
        });
    });
</script>

<audio id="notifySound" preload="auto"><source src="/static/sounds/notify.mp3"></source></audio>
<audio id="ringSound" preload="auto" loop><source src="/static/sounds/ring.mp3"></source></audio>
