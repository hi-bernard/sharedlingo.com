<div class="toolbar">
    <div class="checkbox">
        <label>
            <input type="checkbox" id="hide-empty"> <?php echo t('hideEmptyRooms'); ?>
        </label>
    </div>
</div>
<div class="rooms-list">
    <ul class="nav nav-pills nav-stacked">
        <?php foreach($langs as $code => $lang) { ?>
            <?php if ($lang == '-') { ?>
                <li class="divider"></li>
            <?php } else { ?>
                <li role="presentation">
                    <a href="#" class="room-link" onclick="join(event, '<?php echo $code; ?>')" data-id="<?php echo $code; ?>"><i class="fa fa-fw fa-comments-o"></i> <?php echo $lang; ?> <span class="badge">0</span></a>
                </li>
            <?php } ?>
        <?php } ?>
    </ul>
</div>
