<li id="<?php echo $room['_id']; ?>" class="item" data-user-id="<?php echo $room['to']['id']; ?>">
    <div class="title">
        <span class="name"><span><?php echo html($room['to']['name']); ?></span></span>
        <span class="gender-age"><i class="fa fa-fw fa-comment-o"></i> <?php echo $room['messages_count']; ?></span>
    </div>
    <div class="details">
        <ul>
            <li class="date"><?php echo date(t('dateFormat'), $room['created']->sec); ?></li>
        </ul>
    </div>
</li>
