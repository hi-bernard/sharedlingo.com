<tr id="<?php echo $member['_id']; ?>" class="item" <?php if (!empty($member['online'])) { ?>data-online="true"<?php } ?>>
    <td class="name gender-<?php echo $member['genderClass']; ?>"<?php if (!empty($member['name']['color'])){ ?> style="color:<?php echo $member['name']['color']; ?>"<?php } ?>>
        <i class="fa fa-fw fa-<?php echo $member['genderClass']; ?>"></i> <span><?php echo html($member['name']['full']); ?></span>
    </td>
    <td><?php echo $member['age']; ?></td>
    <td><?php echo $member['location']['country']; ?></td>
    <td><?php echo $member['speaks']; ?></td>
    <td><?php echo $member['learns']; ?></td>
    <td>
        <?php if (empty($member['online'])) { ?>
            <?php echo $member['dates']['online']; ?>
        <?php } else { ?>
            <span class="online"><i class="fa fa-circle"></i> <?php echo t('onlineNow'); ?></span>
        <?php } ?>
    </td>
</tr>
