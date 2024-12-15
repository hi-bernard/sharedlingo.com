<tr id="<?php echo $room['_id']; ?>" class="item" data-user-id="<?php echo $room['to']['id']; ?>">
    <td class="name">
        <span><?php echo html($room['to']['name']); ?></span>
    </td>
    <td class="date"><?php echo date(t('dateFormat'), $room['created']->sec); ?></td>
    <td><?php echo $room['messages_count']; ?></td>
</tr>
