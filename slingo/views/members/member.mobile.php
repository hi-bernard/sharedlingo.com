<li id="<?php echo $member['_id']; ?>" class="item" <?php if (!empty($member['online'])) { ?>data-online="true"<?php } ?>>
    <div class="title gender-<?php echo $member['genderClass']; ?>">
        <span class="name"><span><?php echo html($member['name']['full']); ?></span></span>
        <span class="gender-age"><i class="fa fa-fw fa-<?php echo $member['genderClass']; ?>"></i> <?php echo $member['age']; ?></span>
    </div>
    <div class="details">
        <ul>
            <li><span><?php echo t('speaks'); ?>:</span> <?php echo $member['speaks']; ?></li>
            <li><span><?php echo t('learns'); ?>:</span> <?php echo $member['learns']; ?></li>
            <li>
                <span><?php echo t('dateOnline'); ?>:</span>
                <?php if (empty($member['online'])) { ?>
                    <?php echo $member['dates']['online']; ?>
                <?php } else { ?>
                    <span class="online"><i class="fa fa-circle"></i> <?php echo t('onlineNow'); ?></span>
                <?php } ?>
            </li>
        </ul>
    </div>
</li>
