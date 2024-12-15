<?php
    use SLingo\Core\Lang;
    use SLingo\Core\User;

    $classes = [];

    $isOwn = $member['_id'] == User::getId();

    $isBanned = !empty($member['banned']);
    $isBlocked = $isBanned && !empty($member['ban_until']);

    if ($isBanned) {
        $classes['banned'] = 'banned';
        $bannedMessage = t('banned');
    }

    if ($isBlocked){
        $classes['blocked'] = 'blocked';
        $until = $member['ban_until']->sec;
        $remainSec = $until - time();
        $remainMin = ceil($remainSec/60);
        if ($remainMin > 0){
            $bannedMessage = t('blocked', Lang::getPlural('dateMinutesPlural', $remainMin));
        } else {
            $isBanned = false;
            $isBlocked = false;
            unset($classes['banned']);
            unset($classes['blocked']);
        }
    }

    $isFriend = User::isFriendTo($member['_id']);
    if ($isFriend) { $classes[] = 'friend'; }

    if (!empty($member['online'])){
        $classes[] = 'online';
    }

    $roles = [];

    if (!empty($member['moderator'])){
        $roles[] = ['icon' => 'shield', 'title' => t('moderator')];
        $classes[] = 'moderator';
    }
    if (!empty($member['admin'])){
        $roles[] = ['icon' => 'cog', 'title' => t('administrator')];
        $classes[] = 'administrator';
    }
    if ($isFriend){
        $roles[] = ['icon' => 'user', 'title' => t('friend')];
    }

    $blackList = User::get('blacklist', []);
    if (in_array($member['_id'], $blackList)){
        $roles[] = ['icon' => 'minus-circle', 'title' => t('ignored')];
    }

?>
<div class="dialog-message member-profile <?php if ($classes){ echo implode(' ', $classes); } ?>">
    <div class="header">
        <div class="avatar">
            <img src="/static/img/user.png">
        </div>
        <h3<?php if (!empty($member['name']['color'])){ ?> style="color:<?php echo $member['name']['color']; ?>"<?php } ?>>
            <?php echo html($member['name']['full']); ?>
        </h3>
        <div class="details">
            <?php if (User::isModerator() && !empty($member['name']['old'])) { ?>
                <span title="<?php echo t('userOldName', html($member['name']['old'])); ?>"><i class="fa fa-pencil"></i></span>
            <?php } ?>
            <span class="gender-age gender-<?php echo $member['genderClass']; ?>">
                <i class="fa fa-<?php echo $member['genderClass']; ?>"></i>
                <?php echo $member['age']; ?>
            </span>
            <span class="location">
                <i class="fa fa-location-arrow"></i>
                <?php echo $member['location']['full']; ?>
            </span>
        </div>
    </div>
    <?php if (!empty($member['bio']) && !$isBanned){ ?>
        <div class="bio">
            <div class="arrow-up"></div>
            <div class="text"><?php echo nl2br(html($member['bio'])); ?></div>
        </div>
    <?php } ?>
    <?php if ($isBanned){ ?>
        <div class="bio bio-danger">
            <div class="arrow-up"></div>
            <div class="text"><i class="fa fa-exclamation-triangle"></i> <?php echo $bannedMessage; ?></div>
        </div>
    <?php } ?>
    <div class="info">
        <?php if (!empty($member['premium'])) { ?>
            <?php $daysLeft = round(($member['premium_until']->sec - time()) / (24*60*60)); ?>
            <div class="item status">
                <span class="title"><?php echo t('status'); ?>:</span>
                <span class="state">
                    <i class="fa fa-star"></i> <?php echo t('premium'); ?>
                </span>
                <?php if ($isOwn){ ?>
                    <span class="state-left">
                        &mdash; <?php echo t('premiumLeft', Lang::getPlural('dateDaysPlural', $daysLeft)); ?>
                    </span>
                <?php } ?>
            </div>
        <?php } ?>
        <?php if ($roles) { ?>
            <div class="item roles">
                <span class="title"><?php echo t('roles'); ?>:</span>
                <?php foreach($roles as $role){ ?>
                    <span class="role">
                        <i class="fa fa-<?php echo $role['icon']; ?>"></i> <?php echo $role['title']; ?>
                    </span>
                <?php } ?>
            </div>
        <?php } ?>
        <div class="item speaks">
            <span class="title"><?php echo t('speaks'); ?>:</span>
            <?php echo $member['speaks']; ?>
        </div>
        <div class="item learns">
            <span class="title"><?php echo t('learns'); ?>:</span>
            <?php echo $member['learns']; ?>
        </div>
        <div class="item date-signed">
            <span class="title"><?php echo t('dateSigned'); ?>:</span>
            <?php echo $member['dates']['signed']; ?>
        </div>
        <div class="item date-online">
            <span class="title"><?php echo t('dateOnline'); ?>:</span>
            <?php if (empty($member['online'])) { ?>
                <?php echo $member['dates']['online']; ?>
            <?php } else { ?>
                <span class="online"><?php echo t('onlineNow'); ?></span>
            <?php } ?>
        </div>
        <?php if (User::isAdmin()){ ?>
            <div class="item for-staff">
                <span class="title"><?php echo t('email'); ?>:</span>
                <?php echo $member['email']; ?>
                <a id="banEmailLink" data-email="<?php echo $member['email']; ?>" href="#" target="_blank"><i class="fa fa-ban"></i></a>
            </div>
            <div class="item for-staff">
                <span class="title"><?php echo t('ipAddr'); ?>:</span>
                <?php echo empty($member['ip']) ? '&mdash;' : $member['ip'] . ' <a href="http://www.infobyip.com/ip-'.$member['ip'].'.html" target="_blank"><i class="fa fa-question-circle"></i></a> <a href="#" id="ipFilterLink" data-ip="'.$member['ip'].'"><i class="fa fa-filter"></i></a>'; ?>
            </div>
        <?php } ?>
        <?php if (User::isModerator()){ ?>
            <?php if (!empty($member['reports_count'])){ ?>
                <div class="item for-staff">
                    <span class="title"><?php echo t('reportedTimes'); ?>:</span>
                    <?php echo Lang::getPlural('timesPlural', $member['reports_count']); ?>
                </div>
            <?php } ?>
            <?php if (!empty($member['bans_count'])){ ?>
                <div class="item for-staff">
                    <span class="title"><?php echo t('blockedTimes'); ?>:</span>
                    <?php echo Lang::getPlural('timesPlural', $member['bans_count']); ?>
                </div>
            <?php } ?>
            <?php $friendsCount = empty($member['friends']) ? 0 : sizeof($member['friends']); ?>
            <?php if ($friendsCount) { ?>
                <div class="item for-staff">
                    <span class="title"><?php echo t('friendsCount'); ?>:</span>
                    <?php echo $friendsCount; ?>
                </div>
            <?php } ?>
        <?php } ?>
    </div>
</div>
