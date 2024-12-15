<?php
    use SLingo\Core\Lang;
    use SLingo\Core\Request;
    use SLingo\Core\User;
?>
<div id="appWrap">

    <div id="appHeader">
        <div class="logo block block-text"><?php echo t('appTitle'); ?></div>
        <div class="menu block">
            <ul class="nav nav-pills">
                <li>
                    <a id="findMembersLink" href="#"><i class="fa fa-fw fa-search"></i> <?php echo t('findMembers'); ?></a>
                </li>
                <li>
                    <a id="mapLink" href="#"><i class="fa fa-fw fa-map-marker"></i> <?php echo t('membersMap'); ?> <span></span></a>
                </li>
                <li>
                    <a id="voiceChatLink" href="#"><i class="fa fa-fw fa-microphone"></i> <?php echo t('voiceChat'); ?> <span></span></a>
                </li>
                <li>
                    <a id="gamesLink" href="#"><i class="fa fa-fw fa-trophy"></i> <?php echo t('games'); ?> <span></span></a>
                </li>
            </ul>
        </div>
        <div class="menu block block-right">
            <ul class="nav nav-pills">
                <li>
                    <a id="friendsLink" href="#" title="<?php echo t('friends'); ?>"><i class="fa fa-users"></i><span class="badge badge-green"></span></a>
                </li>
                <li>
                    <a id="inboxLink" href="#" title="<?php echo t('inbox'); ?>"><i class="fa fa-envelope"></i><span class="badge"></span></a>
                </li>
                <li>
                    <a id="historyLink" href="#" title="<?php echo t('history'); ?>"><i class="fa fa-history"></i></a>
                </li>
                <?php if (User::isModerator()) { ?>
                    <li>
                        <a id="reportsLink" href="#" title="<?php echo t('reportsList'); ?>"><i class="fa fa-shield"></i><span class="badge"></span></a>
                    </li>
                <?php } ?>
                <?php if (User::isAdmin()) { ?>
                    <li class="dropdown">
                        <a id="adminLink" href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <span class="name"><i class="fa fa-wrench"></i></span> <span class="caret"></span>
                        </a>
                        <ul id="adminMenu" class="dropdown-menu dropdown-menu-right">
                            <li><a class="live-stats-link" href="#"><i class="fa fa-fw fa-bar-chart"></i> <?php echo t('liveStats'); ?></a></li>
                            <li><a class="daily-stats-link" href="#"><i class="fa fa-fw fa-bar-chart"></i> <?php echo t('dayStats'); ?></a></li>
                            <li><a class="broadcast-link" href="#"><i class="fa fa-fw fa-bullhorn"></i> <?php echo t('broadcast'); ?></a></li>
                            <li><a class="mass-mailing-link" href="/mail/compose"><i class="fa fa-fw fa-envelope-o"></i> <?php echo t('massMail'); ?></a></li>
                            <li><a class="bad-mail-link" href="#"><i class="fa fa-fw fa-ban"></i> <?php echo t('shitMail'); ?></a></li>
                        </ul>
                    </li>
                <?php } ?>
                <li class="dropdown">
                    <a id="profileNameLink" href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <span class="name"><?php echo html(User::get('name')['first']); ?></span> <span class="caret"></span>
                    </a>
                    <ul id="profileMenu" class="dropdown-menu dropdown-menu-right">
                        <li><a class="profile-link" href="#"><i class="fa fa-fw fa-search"></i> <?php echo t('myProfile'); ?></a></li>
                        <li><a class="edit-link" href="#"><i class="fa fa-fw fa-gear"></i> <?php echo t('editProfile'); ?></a></li>
                        <li><a class="edit-name-color-link" href="#"><i class="fa fa-fw fa-paint-brush"></i> <?php echo t('editNameColor'); ?></a></li>
                        <li class="divider"></li>
                        <li><a class="logout-link" href="/auth/logout"><i class="fa fa-fw fa-sign-out"></i> <?php echo t('logout'); ?></a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>

    <div id="appTaskbar">
        <ul></ul>
    </div>

    <div id="app"></div>

    <div id="appFooter" class="sticky">
        <div class="pull-left foot-label"><?php echo t('copyright'); ?></div>
        <?php /*
        <div class="pull-left foot-label premium light">
            <?php if (!User::isPremium(true)){ ?>
                <?php echo t('supportUs'); ?>
                <a href="#get-premium" id="premiumLink" class="get"><i class="fa fa-star"></i> <?php echo t('getPremium'); ?></a>
            <?php } else { ?>
                <?php $daysLeft = round((User::get('premium_until')->sec - time()) / (24*60*60)); ?>
                <span class="status"><i class="fa fa-star"></i> <?php echo t('premium'); ?></span>
                <span class="left">&mdash; <?php echo t('premiumLeft', Lang::getPlural('dateDaysPlural', $daysLeft)); ?></span>
                <span class="extend"><a id="premiumExtendLink" href="#"><?php echo t('premiumExtend'); ?></a></span>
            <?php } ?>
        </div> */ ?>
        <div class="pull-left foot-label share-label"><?php echo t('share'); ?>:</div>
        <div class="pull-left share">
            <div class="ya-share2"
                 data-services="facebook,gplus,vkontakte,twitter"
                 data-counter
                 data-lang="en"></div>
        </div>
        <div class="pull-right foot-label">
            <i class="fa fa-envelope"></i>
            <a href="mailto:admin@sharedlingo.com"><?php echo t('contact'); ?></a>
        </div>
    </div>

    <div id="loadingIndicator">
        <div class="indicator">
            <i class="fa fa-spin fa-gear"></i>
        </div>
    </div>

</div>

<script id="textLobbyTemplate" type="text/template">
    <?php
        $q = [
            'first' => User::get('name')['first'],
            'last' => User::get('name')['last'],
            'bornYear' => User::get('bornYear'),
            'email' => User::get('email'),
            'gender' => User::get('gender'),
            'natives' => join(',', User::get('langs')['natives']),
            'learns' => join(',', User::get('langs')['learns']),
            'countryCode' => User::get('location')['countryCode'],
            'city' => User::get('location')['city']
        ];
        $qs = http_build_query($q);
    ?>
    <div class="hl-notice">
        <i class="fa fa-bell"></i>
        <div class="text"><?php echo t('hlNotice'); ?></div>
        <a class="btn" href="https://hellolingo.com/sharedlingo?<?php echo $qs; ?>"><?php echo t('learnMore'); ?></a>
    </div>
    <div class="toolbar">
        <span><?php echo t('publicRooms'); ?></span>
        <?php foreach($rooms as $id=>$room) { ?>
            <?php $icon = $id=='team' ? 'shield' : 'comments-o'; ?>
            <i class="fa fa-<?php echo $icon; ?>"></i> <a href="#" class="room-link" data-id="<?php echo $id; ?>"><?php echo $room; ?><span></span></a>
        <?php } ?>
        <i class="fa fa-caret-down"></i> <a href="#" class="all-rooms"><?php echo t('showAllRooms'); ?></a>
    </div>
    <div class="members-scroll">
        <table id="textLobbyMembersList" class="members-list">
            <thead>
                <tr>
                    <th width="180"><?php echo t('name'); ?></th>
                    <th width="60"><?php echo t('age'); ?></th>
                    <th><?php echo t('country'); ?></th>
                    <th><?php echo t('speaks'); ?></th>
                    <th><?php echo t('learns'); ?></th>
                </tr>
            </thead>
            <tbody class="list-body"></tbody>
        </table>
    </div>
</script>

<script id="textLobbyMemberTemplate" type="text/template">
    <tr id="{{id}}" class="item">
        <td class="name gender-{{genderClass}}"><i class="fa fa-fw fa-{{genderClass}}"></i> <span>{{name.full}}</span></td>
        <td>{{age}}</td>
        <td>{{location.country}}</td>
        <td>{{speaks}}</td>
        <td>{{learns}}</td>
    </tr>
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
        <table>
            <tr>
                <td class="messages">
                    <div class="scroll">
                        <ul></ul>
                    </div>
                </td>
                <td class="members">
                    <div class="scroll">
                        <ul></ul>
                        <div class="suggest-hint">
                            <?php echo t('suggestTopicHint'); ?>
                            <button class="btn btn-sm btn-default"><?php echo t('suggestTopicBtn'); ?></button>
                            <div class="credits">Topics by <a href="http://conversationstartersworld.com/" target="_blank">CSW</a></div>
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="controls" colspan="2">
                    <div class="input-group">
                        <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
                        <div class="input-group-addon translate toggle-button" title="<?php echo t('translate'); ?>">
                            <i class="fa fa-globe"></i>
                        </div>
                        <div class="input-group-addon settings-toggle toggle-button">
                            <i class="fa fa-cog"></i>
                        </div>
                        <div class="input-group-addon emoticons-toggle toggle-button">
                            <i class="fa fa-smile-o"></i>
                        </div>
                        <div class="settings-pane pane">
                            <div class="opt-title"><?php echo t('roomOptFontSize'); ?></div>
                            <div class="opt-field opt-zoom">
                                <a class="zoom-out"><i class="fa fa-search-minus"></i></a>
                                <a class="zoom-in"><i class="fa fa-search-plus"></i></a>
                            </div>
                            <div class="opt-title"><?php echo t('roomOptSendKey'); ?></div>
                            <div class="opt-field opt-send-key">
                                <div class="radio">
                                    <label><input type="radio" name="send_key" value="1"><?php echo t('keyEnter'); ?></label>
                                </div>
                                <div class="radio">
                                    <label><input type="radio" name="send_key" value="2"><?php echo t('keyCtrlEnter'); ?></label>
                                </div>
                            </div>
                        </div>
                        <div class="emoticons-pane pane">
                            <div class="emoticons"></div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        <div class="tooltip">
            <div class="content"></div>
            <div class="arrow"></div>
        </div>
    </div>
</script>

<script id="roomMessageTemplate" type="text/template">
    <li><span class="name c{{color}}" onclick="insert(this)">{{name}}:</span> {{message}}</li>
</script>

<script id="roomSystemMessageTemplate" type="text/template">
    <li class="system {{class}}"><span class="icon"><i class="fa fa-fw fa-{{icon}}"></i></span> {{message}}</li>
</script>

<script id="roomTooltipTemplate" type="text/template">
    <div class="name"><span class="gender-{{genderClass}}">{{name.full}}</span> {{age}}</div>
    <div class="location">
        <i class="fa fa-location-arrow"></i> {{location.full}}
    </div>
    <div class="langs">
        <span class="title"><?php echo t('speaks'); ?>:</span> {{speaks}}
    </div>
    <div class="langs">
        <span class="title"><?php echo t('learns'); ?>:</span> {{learns}}
    </div>
</script>

<script id="voiceLobbyTemplate" type="text/template">
    <div class="toolbar">
        <div class="checkbox">
            <label>
                <input type="checkbox" id="hide-busy"> <?php echo t('voiceChatHideBusy'); ?>
            </label>
        </div>
    </div>
    <div class="members-scroll">
        <table id="voiceLobbyMembersList" class="members-list">
            <thead>
                <tr>
                    <th width="180"><?php echo t('name'); ?></th>
                    <th width="60"><?php echo t('age'); ?></th>
                    <th><?php echo t('country'); ?></th>
                    <th><?php echo t('speaks'); ?></th>
                    <th><?php echo t('learns'); ?></th>
                    <th width="45"><i class="fa fa-phone"></i></th>
                </tr>
            </thead>
            <tbody class="list-body"></tbody>
        </table>
    </div>
    <div class="not-supported list-overlay">
        <p><?php echo t('voiceChatNotSupported'); ?></p>
        <p><?php echo t('voiceChatUpdateBrowser'); ?></p>
        <p>
            <span class="get-chrome get-browser">
                <i class="fa fa-chrome"></i>
                <a href="https://www.google.com/chrome" target="_blank"><?php echo t('voiceChatGetChrome'); ?></a>
            </span>
            <span class="get-firefox get-browser">
                <i class="fa fa-firefox"></i>
                <a href="https://www.mozilla.org/firefox" target="_blank"><?php echo t('voiceChatGetFirefox'); ?></a>
            </span>
        </p>
    </div>
    <div class="wait-perms list-overlay">
        <p><?php echo t('voiceChatPerms'); ?></p>
    </div>
    <div class="no-perms list-overlay">
        <p><?php echo t('voiceChatNoPerms'); ?></p>
        <p><?php echo t('voiceChatNoPermsHint'); ?></p>
    </div>
</script>

<script id="voiceLobbyMemberTemplate" type="text/template">
    <tr id="{{id}}" class="status-{{status}}">
        <td class="name gender-{{genderClass}}"><i class="fa fa-fw fa-{{genderClass}}"></i> <span>{{name.full}}</span></td>
        <td>{{age}}</td>
        <td>{{location.country}}</td>
        <td>{{speaks}}</td>
        <td>{{learns}}</td>
        <td class="status status-{{status}}"><i class="fa fa-circle"></i></td>
    </tr>
</script>

<script id="voiceChatRoomTemplate" type="text/template">
    <div class="chat-room voice-chat-room">
        <table>
            <tr>
                <td class="head">
                    <img src="/static/img/user.png">
                    {{name.full}}
                    <button class="btn btn-danger btn-disconnect" title="<?php echo t('voiceChatEndCall'); ?>"><i class="fa fa-ban"></i></button>
                    <span class="timer">00:00</span>
                    <audio src=""></audio>
                </td>
            </tr>
            <tr>
                <td class="messages">
                    <div class="scroll">
                        <ul></ul>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="controls">
                    <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
                </td>
            </tr>
        </table>
    </div>
</script>

<script id="gamesLobbyTemplate" type="text/template">
    <div class="toolbar">
        <button class="create-game btn btn-default btn-sm"><i class="fa fa-plus"></i> <?php echo t('gameCreate'); ?></button>
        <span class="in-game"><?php echo t('gamesInGame'); ?></span>
    </div>
    <div class="members-scroll">
        <table id="gamesList" class="games-list members-list">
            <thead>
                <tr>
                    <th width="200"><?php echo t('gameType'); ?></th>
                    <th><?php echo t('gameLanguage'); ?></th>
                    <th><?php echo t('gameStatus'); ?></th>
                    <th><?php echo t('gamePlayers'); ?></th>
                </tr>
            </thead>
            <tbody class="list-body"></tbody>
        </table>
    </div>
</script>

<script id="gamesLobbyGameTemplate" type="text/template">
    <tr id="{{id}}" class="item">
        <td class="title"><i class="fa fa-fw fa-trophy"></i> <span>{{title}}</span></td>
        <td>{{language}}</td>
        <td class="status">{{statusText}}</td>
        <td class="players is-closed-{{closed}}">{{playersCount}}/{{maxPlayers}}</td>
    </tr>
</script>

<script id="gameAliasRoomTemplate" type="text/template">
    <div class="chat-room game-room">
        <table>
            <tr>
                <td class="toolbar" colspan="2">
                    <span class="status"></span>
                    <span class="timer pull-right"></span>
                </td>
            </tr>
            <tr>
                <td class="messages">
                    <div class="scroll">
                        <ul class="chat"></ul>
                    </div>
                </td>
                <td class="members">
                    <div class="scroll">
                        <ul></ul>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="controls" colspan="2">
                    <div class="player-controls">
                        <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
                    </div>
                    <div class="spectator-controls form-control-static">
                        <i class="fa fa-eye"></i> <?php echo t('gameSpectatorInfo'); ?>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</script>

<script id="gameBuilderRoomTemplate" type="text/template">
    <div class="chat-room game-room game-builder">
        <table>
            <tr>
                <td class="toolbar" colspan="2">
                    <span class="status"></span>
                    <span class="timer pull-right"></span>
                </td>
            </tr>
            <tr>
                <td class="messages">
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
                </td>
                <td class="members">
                    <div class="scroll">
                        <ul></ul>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="controls" colspan="2">
                    <div class="player-controls">
                        <input type="text" class="form-control message" placeholder="<?php echo t('messageInputPlaceholder'); ?>">
                    </div>
                    <div class="spectator-controls form-control-static">
                        <i class="fa fa-eye"></i> <?php echo t('gameSpectatorInfo'); ?>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</script>

<script id="mapDialogTemplate" type="text/template">
    <div class="map-wrap">
        <div id="mapCanvas"></div>
    </div>
</script>

<script id="premiumLockDialogTemplate" type="text/template">
    <div class="premium-lock dialog-message">
        <p><?php echo nl2br(t('premiumExplained')); ?></p>
    </div>
</script>

<?php if (User::isAdmin()) { ?>
    <script id="liveStatsTemplate" type="text/template">
        <div class="dialog-message live-stats">
            <h3><?php echo t('activeRooms'); ?></h3>
            <ul class="rooms-list"></ul>
            <h3><?php echo t('counters'); ?></h3>
            <div class="suggests-count"><?php echo t('suggestCounter'); ?>: <span></span></div>
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

<script id="messageDialogTemplate" type="text/template">
    <div class="dialog-message">{{message}}</div>
</script>

<script id="dialogTemplate" type="text/template">
    <div class="dialog">
        <div class="title title-drag"></div>
        <div class="body"></div>
        <div class="buttons"></div>
    </div>
</script>

<?php echo js('app'); ?>

<?php if (User::isAdmin()) { ?>
    <script src="/admin/js"></script>
    <?php echo js('admin'); ?>
<?php } ?>
<?php if (User::isModerator()) { ?>
    <script src="/moderator/js"></script>
<?php } ?>

<script>
    $(function() {
        app = new App({
            token: '<?php echo User::getToken(); ?>',
            userId: '<?php echo User::getId(); ?>',
            host: '<?php echo Request::getHost(); ?>',
            rooms: [<?php echo implode(',', array_map(function($id){ return "'{$id}'"; }, array_keys($rooms))); ?>],
            port: 3000
        });
    });
</script>

<audio id="notifySound" preload="auto"><source src="/static/sounds/notify.mp3"></source></audio>
<audio id="ringSound" preload="auto" loop><source src="/static/sounds/ring.mp3"></source></audio>

<script src="https://yastatic.net/share2/share.js" async="async"></script>
